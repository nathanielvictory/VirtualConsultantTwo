// Controllers/InsightsController.cs
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
[Authorize]
[ApiController]
[SwaggerTag("Insights")]
public class InsightsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public InsightsController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    private async Task RenumberProjectInsightsAsync(int projectId, CancellationToken ct = default)
    {
        // Get current order, stable on Id to break ties
        var insights = await _context.Insights
            .Where(i => i.ProjectId == projectId)
            .OrderBy(i => i.OrderIndex)
            .ThenBy(i => i.Id)
            .ToListAsync(ct);

        var expected = 1;
        var anyChanged = false;

        foreach (var ins in insights)
        {
            if (ins.OrderIndex != expected)
            {
                ins.OrderIndex = expected;
                // Only mark OrderIndex as modified to minimize UPDATEs
                _context.Entry(ins).Property(x => x.OrderIndex).IsModified = true;
                anyChanged = true;
            }
            expected++;
        }

        if (anyChanged)
        {
            await _context.SaveChangesAsync(ct);
        }
    }
    
    // GET: api/Insights
    // Optional filter by projectId
    // Controllers/InsightsController.cs (replace the GET list action)
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<InsightListItemDto>>> GetInsights(
        [FromQuery] int? projectId = null,
        [FromQuery] InsightSource? source = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string sort = "ProjectId,OrderIndex" // default multi-key asc
    )
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var q = _context.Insights.AsNoTracking().AsQueryable();

        // filtering
        if (projectId is not null) q = q.Where(i => i.ProjectId == projectId);
        if (source is not null)    q = q.Where(i => i.Source == source);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var like = $"%{search}%";
            q = q.Where(i => EF.Functions.ILike(i.Content, like));
        }

        // sorting (support a few friendly tokens)
        q = sort switch
        {
            "OrderIndex"        => q.OrderBy(i => i.OrderIndex).ThenBy(i => i.Id),
            "-OrderIndex"       => q.OrderByDescending(i => i.OrderIndex).ThenByDescending(i => i.Id),
            "ProjectId"         => q.OrderBy(i => i.ProjectId).ThenBy(i => i.OrderIndex).ThenBy(i => i.Id),
            "-ProjectId"        => q.OrderByDescending(i => i.ProjectId).ThenByDescending(i => i.OrderIndex).ThenByDescending(i => i.Id),
            "Id"                => q.OrderBy(i => i.Id),
            "-Id"               => q.OrderByDescending(i => i.Id),
            "ProjectId,OrderIndex"  => q.OrderBy(i => i.ProjectId).ThenBy(i => i.OrderIndex).ThenBy(i => i.Id),
            "-ProjectId,-OrderIndex" => q.OrderByDescending(i => i.ProjectId).ThenByDescending(i => i.OrderIndex).ThenByDescending(i => i.Id),
            _                   => q.OrderBy(i => i.ProjectId).ThenBy(i => i.OrderIndex).ThenBy(i => i.Id)
        };

        var total = await q.CountAsync();

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<InsightListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);

        return Ok(new PagedResultDto<InsightListItemDto>(
            Items: items,
            Page: page,
            PageSize: pageSize,
            TotalCount: total,
            TotalPages: totalPages,
            HasPrevious: page > 1,
            HasNext: page < totalPages
        ));
    }


    // GET: api/Insights/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<InsightDetailDto>> GetInsight(int id)
    {
        var dto = await _context.Insights
            .AsNoTracking()
            .Where(i => i.Id == id)
            .ProjectTo<InsightDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null ? NotFound() : Ok(dto);
    }

    // POST: api/Insights
    [HttpPost]
    public async Task<ActionResult<InsightDetailDto>> PostInsight(CreateInsightDto dto)
    {
        var entity = _mapper.Map<api.Models.Insight>(dto);

        if (dto.OrderIndex == null)
        {
            var maxOrder = await _context.Insights
                .Where(i => i.ProjectId == dto.ProjectId)
                .MaxAsync(i => (int?)i.OrderIndex) ?? 0;

            entity.OrderIndex = maxOrder + 1;
        }

        _context.Insights.Add(entity);
        await _context.SaveChangesAsync();

        // Ensure sequence 1..N with stable sort (OrderIndex, Id)
        await RenumberProjectInsightsAsync(entity.ProjectId);

        var created = await _context.Insights
            .AsNoTracking()
            .Where(i => i.Id == entity.Id)
            .ProjectTo<InsightDetailDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        return CreatedAtAction(nameof(GetInsight), new { id = created.Id }, created);
    }

    // PATCH: api/Insights/5
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> PatchInsight(int id, UpdateInsightDto dto, CancellationToken ct)
    {
        var entity = await _context.Insights.FindAsync(new object?[] { id }, ct);
        if (entity is null) return NotFound();

        var projectId = entity.ProjectId;

        // --- One-step swap to avoid thrashing ---
        if (dto.OrderIndex != null &&
            dto.OrderIndex != entity.OrderIndex &&
            Math.Abs(dto.OrderIndex.Value - entity.OrderIndex) == 1)
        {
            var targetIndex = dto.OrderIndex.Value;

            var neighbor = await _context.Insights
                .FirstOrDefaultAsync(i =>
                    i.ProjectId == projectId &&
                    i.OrderIndex == targetIndex &&
                    i.Id != entity.Id, ct);

            if (neighbor is not null)
            {
                // Swap: neighbor takes current slot, entity moves into target slot
                var current = entity.OrderIndex;
                entity.OrderIndex = targetIndex;
                neighbor.OrderIndex = current;

                // Explicitly mark only OrderIndex as modified for both
                _context.Entry(entity).Property(x => x.OrderIndex).IsModified = true;
                _context.Entry(neighbor).Property(x => x.OrderIndex).IsModified = true;

                // Other dto fields (Content/Source) will still be applied below.
                // We'll reassert entity.OrderIndex afterward to prevent overwrite.
            }
        }

        // Map remaining fields; optional fields respected per your profile
        _mapper.Map(dto, entity);

        await _context.SaveChangesAsync(ct);

        // Normalize to 1..N and keep deterministic ordering
        await RenumberProjectInsightsAsync(projectId, ct);

        return NoContent();
    }


    // DELETE: api/Insights/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteInsight(int id)
    {
        var entity = await _context.Insights.FindAsync(id);
        if (entity is null) return NotFound();

        var projectId = entity.ProjectId; // capture before remove
        _context.Insights.Remove(entity);
        await _context.SaveChangesAsync();

        await RenumberProjectInsightsAsync(projectId);
        return NoContent();
    }
}
