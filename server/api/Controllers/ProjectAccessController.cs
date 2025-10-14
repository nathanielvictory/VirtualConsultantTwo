// api/Controllers/ProjectAccessesController.cs
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
[SwaggerTag("Project Access Overrides (explicit allow/deny)")]
[Authorize(Roles = "Admin")]
[ApiController]
public class ProjectAccessesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public ProjectAccessesController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<ProjectAccessListItemDto>>> GetAccesses(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var q = _context.ProjectAccesses.AsNoTracking().OrderBy(a => a.ProjectId).ThenBy(a => a.UserId);

        var total = await q.CountAsync();

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<ProjectAccessListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new PagedResultDto<ProjectAccessListItemDto>(
            items, page, pageSize, total, totalPages, page > 1, page < totalPages));
    }

    [HttpPost]
    public async Task<ActionResult<ProjectAccessListItemDto>> Upsert(CreateProjectAccessDto dto)
    {
        // Validate FKs
        if (!await _context.Users.AnyAsync(u => u.Id == dto.UserId))
            return NotFound(new { error = "user_not_found", dto.UserId });

        if (!await _context.Projects.AnyAsync(p => p.Id == dto.ProjectId))
            return NotFound(new { error = "project_not_found", dto.ProjectId });

        var existing = await _context.ProjectAccesses.FindAsync(dto.UserId, dto.ProjectId);

        if (existing is null)
        {
            var entity = _mapper.Map<ProjectAccess>(dto);
            _context.ProjectAccesses.Add(entity);
        }
        else
        {
            existing.AllowAccess = dto.AllowAccess;
            existing.Reason      = dto.Reason;
        }

        await _context.SaveChangesAsync();

        var result = await _context.ProjectAccesses.AsNoTracking()
            .Where(a => a.UserId == dto.UserId && a.ProjectId == dto.ProjectId)
            .ProjectTo<ProjectAccessListItemDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        return Ok(result);
    }

    [HttpDelete("{userId:int}/{projectId:int}")]
    public async Task<IActionResult> Delete(int userId, int projectId)
    {
        var entity = await _context.ProjectAccesses.FindAsync(userId, projectId);
        if (entity is null) return NotFound();

        _context.ProjectAccesses.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
