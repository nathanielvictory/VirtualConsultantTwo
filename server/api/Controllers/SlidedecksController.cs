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
[SwaggerTag("Slidedecks")]
[Authorize]
[ApiController]
public class SlidedecksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public SlidedecksController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<SlidedeckListItemDto>>> GetSlidedecks(
        [FromQuery] int? projectId = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string sort = "ProjectId,CreatedAt")
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var q = _context.Slidedecks.AsNoTracking().AsQueryable();

        if (projectId is not null) q = q.Where(s => s.ProjectId == projectId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var like = $"%{search}%";
            q = q.Where(s =>
                EF.Functions.ILike(s.Name, like) ||
                (s.PromptFocus != null && EF.Functions.ILike(s.PromptFocus, like)));
        }

        q = sort switch
        {
            "CreatedAt" => q.OrderBy(s => s.CreatedAt).ThenBy(s => s.Id),
            "-CreatedAt" => q.OrderByDescending(s => s.CreatedAt).ThenByDescending(s => s.Id),
            "ProjectId,CreatedAt" => q.OrderBy(s => s.ProjectId).ThenBy(s => s.CreatedAt).ThenBy(s => s.Id),
            "-ProjectId,-CreatedAt" => q.OrderByDescending(s => s.ProjectId).ThenByDescending(s => s.CreatedAt).ThenByDescending(s => s.Id),
            _ => q.OrderBy(s => s.ProjectId).ThenBy(s => s.CreatedAt).ThenBy(s => s.Id)
        };

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<SlidedeckListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new PagedResultDto<SlidedeckListItemDto>(
            items, page, pageSize, total, totalPages, page > 1, page < totalPages));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SlidedeckDetailDto>> GetSlidedeck(int id)
    {
        var dto = await _context.Slidedecks.AsNoTracking()
            .Where(s => s.Id == id)
            .ProjectTo<SlidedeckDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<SlidedeckDetailDto>> PostSlidedeck(CreateSlidedeckDto dto)
    {
        var entity = _mapper.Map<Slidedeck>(dto);
        _context.Slidedecks.Add(entity);
        await _context.SaveChangesAsync();

        var created = await _context.Slidedecks.AsNoTracking()
            .Where(s => s.Id == entity.Id)
            .ProjectTo<SlidedeckDetailDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        return CreatedAtAction(nameof(GetSlidedeck), new { id = created.Id }, created);
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> PatchSlidedeck(int id, UpdateSlidedeckDto dto)
    {
        var entity = await _context.Slidedecks.FindAsync(id);
        if (entity is null) return NotFound();

        _mapper.Map(dto, entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSlidedeck(int id)
    {
        var entity = await _context.Slidedecks.FindAsync(id);
        if (entity is null) return NotFound();

        _context.Slidedecks.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
