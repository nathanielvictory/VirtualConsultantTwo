// Controllers/AuthController.cs
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;                // <— ADD
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Dtos;
using api.Models;
using api.Auth;
using api.Data;                                   // <— ADD
using Swashbuckle.AspNetCore.Annotations;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
[SwaggerTag("Auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _users;
    private readonly SignInManager<User> _signIn;
    private readonly IConfiguration _config;
    private readonly AppDbContext _context;       // <— ADD

    // COOKIE SETTINGS (minimal)
    private const string RefreshCookieName = "vc.rt";
    private static readonly TimeSpan RefreshLifetime = TimeSpan.FromDays(30);

    public AuthController(
        UserManager<User> users,
        SignInManager<User> signIn,
        IConfiguration config,
        AppDbContext context)                     // <— ADD
    {
        _users = users;
        _signIn = signIn;
        _config = config;
        _context = context;                      // <— ADD
    }

    // ===== helpers (small & local to keep things minimal) =====
    private static string GenerateRawRefreshToken(int bytes = 64)
    {
        var data = RandomNumberGenerator.GetBytes(bytes);
        return Convert.ToBase64String(data);
    }

    private static string Sha256(string input)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
        return Convert.ToBase64String(bytes);
    }

    private CookieOptions BuildRefreshCookieOptions(DateTime expiresUtc)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = expiresUtc
        };
    }

    private async Task SetRefreshCookieAsync(User user)
    {
        var now = DateTime.UtcNow;
        var raw = GenerateRawRefreshToken();
        var hash = Sha256(raw);

        var rt = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash,
            CreatedAtUtc = now,
            ExpiresAtUtc = now.Add(RefreshLifetime),
            UserAgent = Request.Headers.UserAgent.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        };

        const int MaxActiveSessionsPerUser = 5;

        var active = await _context.RefreshTokens
            .Where(t => t.UserId == user.Id && t.RevokedAtUtc == null && t.ExpiresAtUtc > DateTime.UtcNow)
            .OrderBy(t => t.CreatedAtUtc) // oldest first
            .ToListAsync();

        if (active.Count >= MaxActiveSessionsPerUser)
        {
            var oldest = active.First();
            oldest.RevokedAtUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        _context.RefreshTokens.Add(rt);
        await _context.SaveChangesAsync();

        Response.Cookies.Append(RefreshCookieName, raw, BuildRefreshCookieOptions(rt.ExpiresAtUtc));
    }
    
    private async Task<RefreshToken?> FindValidRefreshTokenAsync(string raw)
    {
        var hash = Sha256(raw);
        var rt = await _context.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == hash);

        if (rt is null) return null;
        if (rt.RevokedAtUtc is not null) return null;
        if (rt.ExpiresAtUtc <= DateTime.UtcNow) return null;

        return rt;
    }
    
    private async Task<RefreshToken> RotateRefreshTokenAsync(RefreshToken current, User user)
    {
        current.RevokedAtUtc = DateTime.UtcNow;

        var now = DateTime.UtcNow;
        var raw = GenerateRawRefreshToken();
        var hash = Sha256(raw);

        var next = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash,
            CreatedAtUtc = now,
            ExpiresAtUtc = now.Add(RefreshLifetime),
            UserAgent = Request.Headers.UserAgent.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        };

        _context.RefreshTokens.Add(next);
        await _context.SaveChangesAsync();

        current.ReplacedByTokenId = next.Id;
        await _context.SaveChangesAsync();

        Response.Cookies.Append(RefreshCookieName, raw, BuildRefreshCookieOptions(next.ExpiresAtUtc));
        return next;
    }
    // ===== end helpers =====

    /// <summary>OAuth2 password grant: issues a JWT access token</summary>
    [AllowAnonymous]
    [HttpPost("token")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<ActionResult<TokenResponseDto>> Token([FromForm] TokenRequest req)
    {
        if (!string.Equals(req.grant_type, "password", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { error = "unsupported_grant_type" });

        var user = await _users.FindByNameAsync(req.username);
        if (user is null) return Unauthorized(new { error = "invalid_grant" });

        var check = await _signIn.CheckPasswordSignInAsync(user, req.password, lockoutOnFailure: false);
        if (!check.Succeeded) return Unauthorized(new { error = "invalid_grant" });

        // roles (expand later with org/perm claims if you want)
        var roles = await _users.GetRolesAsync(user);
        var claims = roles.Select(r => new Claim(ClaimTypes.Role, r)).ToList();
        claims.Add(new Claim("st", await _users.GetSecurityStampAsync(user))); // future revocation

        var jwt = _config.GetSection("Jwt");
        var (token, _expiresUtc) = JwtTokenHelper.Create(
            userId: user.Id,
            username: user.UserName!,
            issuer: jwt["Issuer"]!,
            audience: jwt["Audience"]!,
            key: jwt["Key"]!,
            lifetime: TimeSpan.FromHours(1),
            extraClaims: claims);

        // <<< NEW: issue refresh cookie >>>
        await SetRefreshCookieAsync(user);

        return Ok(new TokenResponseDto(
            AccessToken: token,
            TokenType: "Bearer",
            ExpiresIn: (int)TimeSpan.FromHours(1).TotalSeconds,
            Scope: req.scope ?? ""
        ));
    }
    
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponseDto>> Refresh()
    {
        var raw = Request.Cookies[RefreshCookieName];
        if (string.IsNullOrWhiteSpace(raw))
            return Unauthorized(new { error = "invalid_request" });

        var token = await FindValidRefreshTokenAsync(raw);
        if (token is null)
            return Unauthorized(new { error = "invalid_grant" });

        var user = token.User!;
        await RotateRefreshTokenAsync(token, user);

        var roles = await _users.GetRolesAsync(user);
        var claims = roles.Select(r => new Claim(ClaimTypes.Role, r)).ToList();
        claims.Add(new Claim("st", await _users.GetSecurityStampAsync(user)));

        var jwt = _config.GetSection("Jwt");
        var (access, _) = JwtTokenHelper.Create(
            userId: user.Id,
            username: user.UserName!,
            issuer: jwt["Issuer"]!,
            audience: jwt["Audience"]!,
            key: jwt["Key"]!,
            lifetime: TimeSpan.FromHours(1),
            extraClaims: claims);

        return Ok(new TokenResponseDto(access, "Bearer", (int)TimeSpan.FromHours(1).TotalSeconds));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var raw = Request.Cookies[RefreshCookieName];
        if (!string.IsNullOrWhiteSpace(raw))
        {
            var hash = Sha256(raw);
            var token = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash);
            if (token is not null && token.RevokedAtUtc is null)
            {
                token.RevokedAtUtc = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            Response.Cookies.Delete(RefreshCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,               // set false only for local HTTP dev
                SameSite = SameSiteMode.None
            });
        }
        return NoContent();
    }
}
