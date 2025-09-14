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
[SwaggerTag("Organizations")]
[Authorize]
[ApiController]
public class OrganizationsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public OrganizationsController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<OrganizationListItemDto>>> GetOrganizations(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string sort = "Name")
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

        var q = _context.Organizations.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var like = $"%{search}%";
            q = q.Where(o => EF.Functions.ILike(o.Name, like) || EF.Functions.ILike(o.Id, like));
        }

        q = sort switch
        {
            "Name" => q.OrderBy(o => o.Name).ThenBy(o => o.Id),
            "-Name" => q.OrderByDescending(o => o.Name).ThenByDescending(o => o.Id),
            _ => q.OrderBy(o => o.Name).ThenBy(o => o.Id)
        };

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<OrganizationListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new PagedResultDto<OrganizationListItemDto>(
            items, page, pageSize, total, totalPages, page > 1, page < totalPages));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrganizationDetailDto>> GetOrganization(string id)
    {
        var dto = await _context.Organizations.AsNoTracking()
            .Where(o => o.Id == id)
            .ProjectTo<OrganizationDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<OrganizationDetailDto>> PostOrganization(CreateOrganizationDto dto)
    {
        var entity = _mapper.Map<Organization>(dto);
        _context.Organizations.Add(entity);
        await _context.SaveChangesAsync();

        var created = await _context.Organizations.AsNoTracking()
            .Where(o => o.Id == entity.Id)
            .ProjectTo<OrganizationDetailDto>(_mapper.ConfigurationProvider)
            .FirstAsync();

        return CreatedAtAction(nameof(GetOrganization), new { id = created.Id }, created);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchOrganization(string id, UpdateOrganizationDto dto)
    {
        var entity = await _context.Organizations.FindAsync(id);
        if (entity is null) return NotFound();

        _mapper.Map(dto, entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrganization(string id)
    {
        var entity = await _context.Organizations.FindAsync(id);
        if (entity is null) return NotFound();

        _context.Organizations.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
