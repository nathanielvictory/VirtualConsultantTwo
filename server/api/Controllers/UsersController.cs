using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using api.Data;
using api.Dtos;
using api.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
[SwaggerTag("Users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _users;
    private readonly RoleManager<IdentityRole<int>> _roles;
    private readonly AppDbContext _db;
    private static readonly string[] AllowedRoles = ["Admin"];
    
    public UsersController(
        UserManager<User> users,
        RoleManager<IdentityRole<int>> roles,
        AppDbContext db)
    {
        _users = users;
        _roles = roles;
        _db = db;
    }

    // POST: api/Users
    [HttpPost]
    public async Task<ActionResult<object>> Create(CreateUserDto dto)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        var user = new User { UserName = dto.Username };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            foreach (var e in result.Errors) ModelState.AddModelError(e.Code, e.Description);
            return ValidationProblem(ModelState);
        }

        if (!string.IsNullOrWhiteSpace(dto.OrganizationId))
        {
            // Set claim, then sync membership (idempotent)
            var oldOrg = await SetOrgClaim(user, dto.OrganizationId);
            await SyncMembershipAsync(user.Id, oldOrg, dto.OrganizationId);
        }

        if (dto.Roles?.Length > 0)
            await EnsureAndAssignRoles(user, dto.Roles);

        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = user.Id }, new { user.Id, user.UserName });
    }

    // GET: api/Users/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<object>> Get(int id)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();
        var roles = await _users.GetRolesAsync(user);
        var claims = await _users.GetClaimsAsync(user);
        return Ok(new
        {
            user.Id,
            user.UserName,
            Roles = roles,
            Claims = claims.Select(c => new { c.Type, c.Value })
        });
    }

    // GET: api/Users
    // Simple list with paging + search on username
    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var query = _users.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.UserName!.Contains(search));

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(u => u.UserName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new List<object>(items.Count);
        foreach (var u in items)
        {
            var roles = await _users.GetRolesAsync(u);
            var claims = await _users.GetClaimsAsync(u);
            result.Add(new
            {
                u.Id,
                u.UserName,
                Roles = roles,
                Claims = claims.Select(c => new { c.Type, c.Value })
            });
        }

        return Ok(new
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            Items = result
        });
    }

    // PATCH: api/Users/{id}
    // Allows updating username, password (admin reset), organization claim, and roles (replace set)
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        await using var tx = await _db.Database.BeginTransactionAsync();

        if (!string.IsNullOrWhiteSpace(dto.Username) && dto.Username != user.UserName)
        {
            user.UserName = dto.Username;
            var nameRes = await _users.UpdateAsync(user);
            if (!nameRes.Succeeded)
            {
                foreach (var e in nameRes.Errors) ModelState.AddModelError(e.Code, e.Description);
                return ValidationProblem(ModelState);
            }
        }

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            // If the user already has a password, remove it first
            if (await _users.HasPasswordAsync(user))
            {
                var remove = await _users.RemovePasswordAsync(user);
                if (!remove.Succeeded)
                {
                    foreach (var e in remove.Errors)
                        ModelState.AddModelError(e.Code, e.Description);
                    return ValidationProblem(ModelState);
                }
            }

            // Add the new password
            var add = await _users.AddPasswordAsync(user, dto.Password);
            if (!add.Succeeded)
            {
                foreach (var e in add.Errors)
                    ModelState.AddModelError(e.Code, e.Description);
                return ValidationProblem(ModelState);
            }
        }

        if (dto.OrganizationId is not null) // replace or remove org claim when empty
        {
            // Capture old org BEFORE changing the claim
            var existingClaims = await _users.GetClaimsAsync(user);
            var oldOrg = GetOrgClaimValue(existingClaims);

            var newOrg = string.IsNullOrWhiteSpace(dto.OrganizationId) ? null : dto.OrganizationId;
            await SetOrgClaim(user, newOrg);

            // Keep membership in sync with the new claim
            await SyncMembershipAsync(user.Id, oldOrg, newOrg);
        }

        if (dto.Roles is not null)
        {
            await ReplaceRoles(user, dto.Roles);
        }

        await tx.CommitAsync();

        return NoContent();
    }

    // DELETE: api/Users/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        // (Optional) don't let an admin delete themselves
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (callerId == user.Id.ToString())
            return BadRequest(new { error = "Cannot delete the currently authenticated user." });

        var res = await _users.DeleteAsync(user);
        if (!res.Succeeded)
        {
            foreach (var e in res.Errors) ModelState.AddModelError(e.Code, e.Description);
            return ValidationProblem(ModelState);
        }
        return NoContent();
    }

    // --- helpers ---

    private static string[] NormalizeRoles(IEnumerable<string> roles) =>
        roles
            .Where(r => !string.IsNullOrWhiteSpace(r))   // remove null/empty first
            .Select(r => r.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

    private static string[] FilterValidRoles(IEnumerable<string> roles) =>
        roles
            .Where(r => AllowedRoles.Contains(r))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    
    private async Task EnsureAndAssignRoles(User user, IEnumerable<string> roles)
    {
        var normalized = NormalizeRoles(roles);
        var validDesired = FilterValidRoles(normalized);

        foreach (var r in validDesired)
            if (!await _roles.RoleExistsAsync(r))
                await _roles.CreateAsync(new IdentityRole<int>(r));

        await _users.AddToRolesAsync(user, validDesired);
    }

    private async Task ReplaceRoles(User user, IEnumerable<string> desiredRoles)
    {
        var normalized = NormalizeRoles(desiredRoles);
        var validDesired = FilterValidRoles(normalized);

        var current = await _users.GetRolesAsync(user);

        var toRemove = current.Except(validDesired, StringComparer.OrdinalIgnoreCase).ToArray();
        var toAdd = validDesired.Except(current, StringComparer.OrdinalIgnoreCase).ToArray();

        if (toRemove.Length > 0)
            await _users.RemoveFromRolesAsync(user, toRemove);

        foreach (var r in toAdd)
            if (!await _roles.RoleExistsAsync(r))
                await _roles.CreateAsync(new IdentityRole<int>(r));

        if (toAdd.Length > 0)
            await _users.AddToRolesAsync(user, toAdd);
    }

    private static string? GetOrgClaimValue(IEnumerable<Claim> claims) =>
        claims.FirstOrDefault(c => c.Type == "org")?.Value;

    /// <summary>
    /// Set/replace the "org" claim and return the previous org value (if any).
    /// </summary>
    private async Task<string?> SetOrgClaim(User user, string? organizationId)
    {
        var claims = await _users.GetClaimsAsync(user);
        var existing = claims.Where(c => c.Type == "org").ToArray();
        var oldOrg = existing.FirstOrDefault()?.Value;

        if (existing.Length > 0)
            await _users.RemoveClaimsAsync(user, existing);

        if (!string.IsNullOrWhiteSpace(organizationId))
            await _users.AddClaimAsync(user, new Claim("org", organizationId));

        return oldOrg;
    }

    /// <summary>
    /// Synchronize OrganizationMembership to match a new org value.
    /// - If org changed: delete old membership (if it exists), create new (if it doesn't exist).
    /// - If new org is null/empty: delete old membership (if it exists).
    /// Idempotent: double-checks existence before remove/add.
    /// </summary>
    private async Task SyncMembershipAsync(int userId, string? oldOrgId, string? newOrgId, CancellationToken ct = default)
    {
        // Normalize
        oldOrgId = string.IsNullOrWhiteSpace(oldOrgId) ? null : oldOrgId.Trim();
        newOrgId = string.IsNullOrWhiteSpace(newOrgId) ? null : newOrgId.Trim();

        // Nothing to do
        if (oldOrgId == newOrgId) return;

        // Remove old (if any & different)
        if (!string.IsNullOrWhiteSpace(oldOrgId))
        {
            var oldMembership = await _db.OrganizationMemberships
                .SingleOrDefaultAsync(m => m.UserId == userId && m.OrganizationId == oldOrgId, ct);

            if (oldMembership is not null)
                _db.OrganizationMemberships.Remove(oldMembership);
        }

        // Add new (if any & not already present)
        if (!string.IsNullOrWhiteSpace(newOrgId))
        {
            var exists = await _db.OrganizationMemberships
                .AnyAsync(m => m.UserId == userId && m.OrganizationId == newOrgId, ct);

            if (!exists)
            {
                // (Optional) ensure Organization exists first:
                // var orgExists = await _db.Organizations.AnyAsync(o => o.Id == newOrgId, ct);
                // if (!orgExists) throw new InvalidOperationException($"Organization '{newOrgId}' does not exist.");

                _db.OrganizationMemberships.Add(new OrganizationMembership
                {
                    UserId = userId,
                    OrganizationId = newOrgId,
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync(ct);
    }
}
