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
[SwaggerTag("System Prompts (append-only history)")]
[Authorize]
[ApiController]
public class SystemPromptsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public SystemPromptsController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    // List revisions (optionally filter by type, optionally only latest per type)
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<SystemPromptListItemDto>>> GetSystemPrompts(
        [FromQuery] string? type = null,
        [FromQuery] bool latestOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var q = _context.SystemPrompts.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(type) &&
            Enum.TryParse<SystemPromptType>(type, ignoreCase: true, out var t))
        {
            q = q.Where(p => p.PromptType == t);
        }

        if (latestOnly)
        {
            // Latest per type:
            // GroupBy + FirstOrDefault is translated by EF Core/Npgsql.
            q = q.GroupBy(p => p.PromptType)
                 .Select(g => g.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).First());
        }
        else
        {
            q = q.OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id);
        }

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<SystemPromptListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new PagedResultDto<SystemPromptListItemDto>(
            items, page, pageSize, total, totalPages, page > 1, page < totalPages));
    }

    // Get single revision
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SystemPromptDetailDto>> GetSystemPrompt(int id)
    {
        var dto = await _context.SystemPrompts.AsNoTracking()
            .Where(p => p.Id == id)
            .ProjectTo<SystemPromptDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null ? NotFound() : Ok(dto);
    }

    // Create a new revision (append-only)
    [HttpPost]
    public async Task<ActionResult<SystemPromptDetailDto>> PostSystemPrompt(CreateSystemPromptDto dto)
    {
        var entity = _mapper.Map<SystemPrompt>(dto);
        _context.SystemPrompts.Add(entity);
        await _context.SaveChangesAsync();

        var created = await _context.SystemPrompts.AsNoTracking()
            .Where(p => p.Id == entity.Id)
            .ProjectTo<SystemPromptDetailDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        return CreatedAtAction(nameof(GetSystemPrompt), new { id = created.Id }, created);
    }

    // Intentionally no PATCH/PUT to keep history immutable.
}
