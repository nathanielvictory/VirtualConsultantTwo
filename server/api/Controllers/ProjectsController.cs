// Controllers/ProjectsController.cs
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Dtos;

namespace api.Controllers;

[Route("api/[controller]")]
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

    // GET: api/Projects
    [HttpGet]
public async Task<ActionResult<PagedResultDto<ProjectListItemDto>>> GetProjects(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? search = null,
    [FromQuery] string? organizationId = null,
    [FromQuery] string? kbid = null,
    [FromQuery] bool? isActive = null,
    [FromQuery] bool? hasData = null,
    [FromQuery] string sort = "-CreatedAt" // "-" means desc
)
{
    // guardrails
    page = page < 1 ? 1 : page;
    pageSize = pageSize is < 1 or > 100 ? 20 : pageSize; // cap to prevent abuse

    var q = _context.Projects.AsNoTracking().AsQueryable();

    // filtering
    if (!string.IsNullOrWhiteSpace(search))
    {
        var like = $"%{search}%";
        q = q.Where(p =>
            EF.Functions.ILike(p.Name, like) ||
            EF.Functions.ILike(p.OrganizationId, like) ||
            EF.Functions.ILike(p.Kbid, like));
    }

    if (!string.IsNullOrWhiteSpace(organizationId))
        q = q.Where(p => p.OrganizationId == organizationId);
    
    if (!string.IsNullOrWhiteSpace(kbid))
        q = q.Where(p => p.Kbid == kbid);

    if (isActive is not null)
        q = q.Where(p => p.IsActive == isActive);

    if (hasData is not null)
        q = q.Where(p => p.HasData == hasData);

    // sorting
    q = sort switch
    {
        "Name"       => q.OrderBy(p => p.Name),
        "-Name"      => q.OrderByDescending(p => p.Name),
        "CreatedAt"  => q.OrderBy(p => p.CreatedAt),
        "-CreatedAt" => q.OrderByDescending(p => p.CreatedAt),
        "UpdatedAt"  => q.OrderBy(p => p.UpdatedAt),
        "-UpdatedAt" => q.OrderByDescending(p => p.UpdatedAt),
        _            => q.OrderByDescending(p => p.CreatedAt) // default
    };

    var total = await q.CountAsync();

    var items = await q
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ProjectTo<ProjectListItemDto>(_mapper.ConfigurationProvider)
        .ToListAsync();

    var totalPages = (int)Math.Ceiling(total / (double)pageSize);

    return Ok(new PagedResultDto<ProjectListItemDto>(
        Items: items,
        Page: page,
        PageSize: pageSize,
        TotalCount: total,
        TotalPages: totalPages,
        HasPrevious: page > 1,
        HasNext: page < totalPages
    ));
}

    // GET: api/Projects/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDetailDto>> GetProject(int id)
    {
        var dto = await _context.Projects
            .AsNoTracking()
            .Where(p => p.Id == id)
            // ProjectTo will map nested Insights via your profiles
            .ProjectTo<ProjectDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null ? NotFound() : Ok(dto);
    }

    // POST: api/Projects
    [HttpPost]
    public async Task<ActionResult<ProjectDetailDto>> PostProject(CreateProjectDto dto)
    {
        var entity = _mapper.Map<api.Models.Project>(dto);
        _context.Projects.Add(entity);
        await _context.SaveChangesAsync();

        var created = await _context.Projects
            .AsNoTracking()
            .Where(p => p.Id == entity.Id)
            .ProjectTo<ProjectDetailDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        return CreatedAtAction(nameof(GetProject), new { id = created.Id }, created);
    }

    // PATCH: api/Projects/5
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> PatchProject(int id, UpdateProjectDto dto)
    {
        var entity = await _context.Projects.FindAsync(id);
        if (entity is null) return NotFound();

        _mapper.Map(dto, entity); // applies only non-null fields; UpdatedAt handled in profile
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Projects/5
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
