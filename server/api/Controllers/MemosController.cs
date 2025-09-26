using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;            // ⬅ add
using AutoMapper;
using AutoMapper.QueryableExtensions;
using api.Data;
using api.Dtos;
using api.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace api.Controllers;

[Route("api/[controller]")]
[SwaggerTag("Memos")]
[Authorize]
[ApiController]
public class MemosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public MemosController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    // Helper: get current user's ID (int) from claims
    private int GetUserId()
    {
        // Prefer NameIdentifier, fall back to "sub"
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                      ?? User.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(idValue) || !int.TryParse(idValue, out var id))
            throw new UnauthorizedAccessException("Authenticated user id claim missing or invalid.");
        return id;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<MemoListItemDto>>> GetMemos(
        [FromQuery] int? projectId = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string sort = "ProjectId,CreatedAt")
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var q = _context.Memos.AsNoTracking().AsQueryable();

        if (projectId is not null) q = q.Where(m => m.ProjectId == projectId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var like = $"%{search}%";
            q = q.Where(m => EF.Functions.ILike(m.Name, like));
        }

        q = sort switch
        {
            "CreatedAt" => q.OrderBy(m => m.CreatedAt).ThenBy(m => m.Id),
            "-CreatedAt" => q.OrderByDescending(m => m.CreatedAt).ThenByDescending(m => m.Id),
            "ProjectId,CreatedAt" => q.OrderBy(m => m.ProjectId).ThenBy(m => m.CreatedAt).ThenBy(m => m.Id),
            "-ProjectId,-CreatedAt" => q.OrderByDescending(m => m.ProjectId).ThenByDescending(m => m.CreatedAt).ThenByDescending(m => m.Id),
            _ => q.OrderBy(m => m.ProjectId).ThenBy(m => m.CreatedAt).ThenBy(m => m.Id)
        };

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<MemoListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new PagedResultDto<MemoListItemDto>(
            items, page, pageSize, total, totalPages, page > 1, page < totalPages));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MemoDetailDto>> GetMemo(int id)
    {
        var dto = await _context.Memos.AsNoTracking()
            .Where(m => m.Id == id)
            .ProjectTo<MemoDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<MemoDetailDto>> PostMemo(CreateMemoDto dto)
    {
        var entity = _mapper.Map<Memo>(dto);

        // Set CreatedById from the authenticated user
        entity.CreatedById = GetUserId();

        _context.Memos.Add(entity);
        await _context.SaveChangesAsync();

        var created = await _context.Memos.AsNoTracking()
            .Where(m => m.Id == entity.Id)
            .ProjectTo<MemoDetailDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        return CreatedAtAction(nameof(GetMemo), new { id = created.Id }, created);
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> PatchMemo(int id, UpdateMemoDto dto)
    {
        var entity = await _context.Memos.FindAsync(id);
        if (entity is null) return NotFound();

        _mapper.Map(dto, entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMemo(int id)
    {
        var entity = await _context.Memos.FindAsync(id);
        if (entity is null) return NotFound();

        _context.Memos.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
