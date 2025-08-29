// Auth/JwtTokenHelper.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace api.Auth;

public static class JwtTokenHelper
{
    public static (string token, DateTime expiresUtc) Create(
        int userId, string username, string issuer, string audience, string key, TimeSpan lifetime,
        IEnumerable<Claim>? extraClaims = null)
    {
        var now = DateTime.UtcNow;
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        if (extraClaims is not null) claims.AddRange(extraClaims);

        var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var jwt = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: now,
            expires: now.Add(lifetime),
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(jwt), jwt.ValidTo);
    }
}