// Controllers/UsersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using api.Dtos;
using api.Models;

namespace api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _users;
    private readonly RoleManager<IdentityRole<int>> _roles;

    public UsersController(UserManager<User> users, RoleManager<IdentityRole<int>> roles)
    {
        _users = users; _roles = roles;
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create(CreateUserDto dto)
    {
        var user = new User { UserName = dto.Username };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            foreach (var e in result.Errors) ModelState.AddModelError(e.Code, e.Description);
            return ValidationProblem(ModelState);
        }

        if (!string.IsNullOrWhiteSpace(dto.OrganizationId))
            await _users.AddClaimAsync(user, new Claim("org", dto.OrganizationId));

        if (dto.Roles?.Length > 0)
        {
            // ensure roles exist
            foreach (var r in dto.Roles)
                if (!await _roles.RoleExistsAsync(r))
                    await _roles.CreateAsync(new IdentityRole<int>(r));

            await _users.AddToRolesAsync(user, dto.Roles);
        }

        return CreatedAtAction(nameof(Get), new { id = user.Id }, new { user.Id, user.UserName });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<object>> Get(int id)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();
        var roles = await _users.GetRolesAsync(user);
        var claims = await _users.GetClaimsAsync(user);
        return Ok(new { user.Id, user.UserName, Roles = roles, Claims = claims.Select(c => new { c.Type, c.Value }) });
    }
}
