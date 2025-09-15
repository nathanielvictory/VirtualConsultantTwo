using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using api.Data;
using api.Dtos;
using api.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace api.Controllers;

[Route("api/[controller]")]
[SwaggerTag("Tasks")]
[Authorize]
[ApiController]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public TasksController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Paginated, filterable list of tasks.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TaskListItemDto>>> GetTasks(
        [FromQuery] int? projectId = null,
        [FromQuery] int? createdByUserId = null,
        [FromQuery] TaskJobStatus? status = null,
        [FromQuery] TaskJobType? type = null,
        [FromQuery] DateTimeOffset? createdAfter = null,
        [FromQuery] DateTimeOffset? createdBefore = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string sort = "-CreatedAt")
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var q = _context.Tasks.AsNoTracking().AsQueryable();

        if (projectId is not null)
            q = q.Where(t => t.ProjectId == projectId);

        if (createdByUserId is not null)
            q = q.Where(t => t.CreatedByUserId == createdByUserId);

        if (status is not null)
            q = q.Where(t => t.JobStatus == status);

        if (type is not null)
            q = q.Where(t => t.JobType == type);

        if (createdAfter is not null)
            q = q.Where(t => t.CreatedAt >= createdAfter);

        if (createdBefore is not null)
            q = q.Where(t => t.CreatedAt < createdBefore);

        q = sort switch
        {
            "CreatedAt"   => q.OrderBy(t => t.CreatedAt).ThenBy(t => t.Id),
            "-CreatedAt"  => q.OrderByDescending(t => t.CreatedAt).ThenByDescending(t => t.Id),
            "UpdatedAt"   => q.OrderBy(t => t.UpdatedAt).ThenBy(t => t.Id),
            "-UpdatedAt"  => q.OrderByDescending(t => t.UpdatedAt).ThenByDescending(t => t.Id),
            "Type"        => q.OrderBy(t => t.JobType).ThenBy(t => t.Id),
            "-Type"       => q.OrderByDescending(t => t.JobType).ThenByDescending(t => t.Id),
            "Status"      => q.OrderBy(t => t.JobStatus).ThenBy(t => t.Id),
            "-Status"     => q.OrderByDescending(t => t.JobStatus).ThenByDescending(t => t.Id),
            _             => q.OrderByDescending(t => t.CreatedAt).ThenByDescending(t => t.Id)
        };

        var total = await q.CountAsync();

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<TaskListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new PagedResultDto<TaskListItemDto>(
            items, page, pageSize, total, totalPages, page > 1, page < totalPages));
    }

    /// <summary>
    /// Get a single task (includes artifacts).
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskDetailDto>> GetTask(int id)
    {
        var dto = await _context.Tasks.AsNoTracking()
            .Where(t => t.Id == id)
            .ProjectTo<TaskDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>
    /// Create a task.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TaskDetailDto>> PostTask(CreateTaskDto dto)
    {
        var entity = _mapper.Map<TaskJob>(dto);
        _context.Tasks.Add(entity);
        await _context.SaveChangesAsync();

        var created = await _context.Tasks.AsNoTracking()
            .Where(t => t.Id == entity.Id)
            .ProjectTo<TaskDetailDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        return CreatedAtAction(nameof(GetTask), new { id = created.Id }, created);
    }

    /// <summary>
    /// Patch (partial update) a task.
    /// </summary>
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> PatchTask(int id, UpdateTaskDto dto)
    {
        var entity = await _context.Tasks.FindAsync(id);
        if (entity is null) return NotFound();

        _mapper.Map(dto, entity);
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Delete a task.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var entity = await _context.Tasks.FindAsync(id);
        if (entity is null) return NotFound();

        _context.Tasks.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
