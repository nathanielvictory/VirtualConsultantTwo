// api/Controllers/OrganizationMembershipsController.cs
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Dtos;
using api.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace api.Controllers;

[Route("api/[controller]")]
[SwaggerTag("Organization Memberships")]
[Authorize(Roles = "Admin")]
[ApiController]
public class OrganizationMembershipsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public OrganizationMembershipsController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>List all memberships with filtering/sorting/paging (admin-only)</summary>
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<OrganizationMembershipListItemDto>>> GetMemberships(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string sort = "OrganizationName,UserName")
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var q = _context.OrganizationMemberships
            .AsNoTracking()
            .Include(m => m.User)
            .Include(m => m.Organization)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var like = $"%{search}%";
            q = q.Where(m =>
                EF.Functions.ILike(m.User.UserName!, like) ||
                EF.Functions.ILike(m.OrganizationId, like) ||
                EF.Functions.ILike(m.Organization.Name, like));
        }

        // Sorting (supports "UserName", "-UserName", "OrganizationName", "-OrganizationName", "CreatedAt", "-CreatedAt")
        q = sort switch
        {
            "UserName"            => q.OrderBy(m => m.User.UserName).ThenBy(m => m.OrganizationId),
            "-UserName"           => q.OrderByDescending(m => m.User.UserName).ThenByDescending(m => m.OrganizationId),
            "OrganizationName"    => q.OrderBy(m => m.Organization.Name).ThenBy(m => m.User.UserName),
            "-OrganizationName"   => q.OrderByDescending(m => m.Organization.Name).ThenByDescending(m => m.User.UserName),
            "CreatedAt"           => q.OrderBy(m => m.CreatedAt).ThenBy(m => m.OrganizationId),
            "-CreatedAt"          => q.OrderByDescending(m => m.CreatedAt).ThenByDescending(m => m.OrganizationId),
            _                     => q.OrderBy(m => m.Organization.Name).ThenBy(m => m.User.UserName)
        };

        var total = await q.CountAsync();

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<OrganizationMembershipListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new PagedResultDto<OrganizationMembershipListItemDto>(
            items, page, pageSize, total, totalPages, page > 1, page < totalPages));
    }

    /// <summary>Create/Upsert organization membership (admin-only)</summary>
    [HttpPost]
    public async Task<ActionResult<OrganizationMembershipListItemDto>> CreateMembership(CreateOrganizationMembershipDto dto)
    {
        // Validate FK existence up-front for clean errors
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId);
        if (user is null) return NotFound(new { error = "user_not_found", dto.UserId });

        var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == dto.OrganizationId);
        if (org is null) return NotFound(new { error = "organization_not_found", dto.OrganizationId });

        var existing = await _context.OrganizationMemberships.FindAsync(dto.UserId, dto.OrganizationId);
        if (existing is not null)
        {
            // Already exists; return current representation (idempotent)
            var existingDto = await _context.OrganizationMemberships.AsNoTracking()
                .Where(m => m.UserId == dto.UserId && m.OrganizationId == dto.OrganizationId)
                .ProjectTo<OrganizationMembershipListItemDto>(_mapper.ConfigurationProvider)
                .FirstAsync();

            // 200 OK is fine; or 409 Conflict if you prefer. Using 200 for idempotent create.
            return Ok(existingDto);
        }

        var entity = _mapper.Map<OrganizationMembership>(dto);
        _context.OrganizationMemberships.Add(entity);
        await _context.SaveChangesAsync();

        var created = await _context.OrganizationMemberships.AsNoTracking()
            .Where(m => m.UserId == dto.UserId && m.OrganizationId == dto.OrganizationId)
            .ProjectTo<OrganizationMembershipListItemDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        // Location header could point back to the list; composite key GET isn't defined (by design).
        return Created(Request.Path, created);
    }

    /// <summary>Delete membership (admin-only)</summary>
    [HttpDelete("{userId:int}/{organizationId}")]
    public async Task<IActionResult> DeleteMembership(int userId, string organizationId)
    {
        var entity = await _context.OrganizationMemberships.FindAsync(userId, organizationId);
        if (entity is null) return NotFound();

        _context.OrganizationMemberships.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
