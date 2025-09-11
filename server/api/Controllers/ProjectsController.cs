using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using api.Data;
using api.Dtos;
using api.Models;

namespace api.Controllers;

[Route("api/[controller]")]
[Authorize]
[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public ProjectsController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<ProjectListItemDto>>> GetProjects(
        [FromQuery] string? orgId = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string sort = "Name")
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var q = _context.Projects.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(orgId))
            q = q.Where(p => p.OrganizationId == orgId);

        if (isActive is not null)
            q = q.Where(p => p.IsActive == isActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var like = $"%{search}%";
            q = q.Where(p =>
                EF.Functions.ILike(p.Name, like) ||
                EF.Functions.ILike(p.Kbid, like) ||
                (p.ProjectContext != null && EF.Functions.ILike(p.ProjectContext, like)));
        }

        q = sort switch
        {
            "Name" => q.OrderBy(p => p.Name).ThenBy(p => p.Id),
            "-Name" => q.OrderByDescending(p => p.Name).ThenByDescending(p => p.Id),
            "CreatedAt" => q.OrderBy(p => p.CreatedAt),
            "-CreatedAt" => q.OrderByDescending(p => p.CreatedAt),
            "UpdatedAt" => q.OrderBy(p => p.UpdatedAt),
            "-UpdatedAt" => q.OrderByDescending(p => p.UpdatedAt),
            _ => q.OrderBy(p => p.Name).ThenBy(p => p.Id)
        };

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<ProjectListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new PagedResultDto<ProjectListItemDto>(
            items, page, pageSize, total, totalPages, page > 1, page < totalPages));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDetailDto>> GetProject(int id)
    {
        var dto = await _context.Projects.AsNoTracking()
            .Where(p => p.Id == id)
            .ProjectTo<ProjectDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDetailDto>> PostProject(CreateProjectDto dto)
    {
        var entity = _mapper.Map<Project>(dto);
        _context.Projects.Add(entity);
        await _context.SaveChangesAsync();

        var created = await _context.Projects.AsNoTracking()
            .Where(p => p.Id == entity.Id)
            .ProjectTo<ProjectDetailDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        return CreatedAtAction(nameof(GetProject), new { id = created.Id }, created);
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> PatchProject(int id, UpdateProjectDto dto)
    {
        var entity = await _context.Projects.FindAsync(id);
        if (entity is null) return NotFound();

        _mapper.Map(dto, entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var entity = await _context.Projects.FindAsync(id);
        if (entity is null) return NotFound();

        _context.Projects.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
