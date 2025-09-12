using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
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

    public UsersController(UserManager<User> users, RoleManager<IdentityRole<int>> roles)
    {
        _users = users; _roles = roles;
    }

    // POST: api/Users
    [HttpPost]
    public async Task<ActionResult<object>> Create(CreateUserDto dto)
    {
        var user = new User { UserName = dto.Username };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            foreach (var e in result.Errors) ModelState.AddModelError(e.Code, e.Description);
            return ValidationProblem(ModelState);
        }

        if (!string.IsNullOrWhiteSpace(dto.OrganizationId))
            await SetOrgClaim(user, dto.OrganizationId);

        if (dto.Roles?.Length > 0)
            await EnsureAndAssignRoles(user, dto.Roles);

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

        var total = query.Count();
        var items = query
            .OrderBy(u => u.UserName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

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

        if (!string.IsNullOrEmpty(dto.Password))
        {
            var token = await _users.GeneratePasswordResetTokenAsync(user);
            var pwRes = await _users.ResetPasswordAsync(user, token, dto.Password);
            if (!pwRes.Succeeded)
            {
                foreach (var e in pwRes.Errors) ModelState.AddModelError(e.Code, e.Description);
                return ValidationProblem(ModelState);
            }
        }

        if (dto.OrganizationId is not null) // replace or remove org claim when empty
        {
            var orgVal = string.IsNullOrWhiteSpace(dto.OrganizationId) ? null : dto.OrganizationId;
            await SetOrgClaim(user, orgVal);
        }

        if (dto.Roles is not null)
        {
            await ReplaceRoles(user, dto.Roles);
        }

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

    private async Task EnsureAndAssignRoles(User user, IEnumerable<string> roles)
    {
        foreach (var r in roles.Distinct())
            if (!await _roles.RoleExistsAsync(r))
                await _roles.CreateAsync(new IdentityRole<int>(r));
        await _users.AddToRolesAsync(user, roles);
    }

    private async Task ReplaceRoles(User user, IEnumerable<string> desiredRoles)
    {
        var current = await _users.GetRolesAsync(user);
        var desired = desiredRoles?.Distinct().ToArray() ?? Array.Empty<string>();

        var toRemove = current.Except(desired).ToArray();
        var toAdd = desired.Except(current).ToArray();

        if (toRemove.Length > 0)
            await _users.RemoveFromRolesAsync(user, toRemove);

        if (toAdd.Length > 0)
        {
            foreach (var r in toAdd)
                if (!await _roles.RoleExistsAsync(r))
                    await _roles.CreateAsync(new IdentityRole<int>(r));
            await _users.AddToRolesAsync(user, toAdd);
        }
    }

    private async Task SetOrgClaim(User user, string? organizationId)
    {
        var claims = await _users.GetClaimsAsync(user);
        var existing = claims.Where(c => c.Type == "org").ToArray();
        if (existing.Length > 0)
            await _users.RemoveClaimsAsync(user, existing);

        if (!string.IsNullOrWhiteSpace(organizationId))
            await _users.AddClaimAsync(user, new Claim("org", organizationId));
    }
}
