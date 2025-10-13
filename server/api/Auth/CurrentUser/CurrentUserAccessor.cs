// Security/CurrentUserAccessor.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace api.Auth.CurrentUser;

public sealed class CurrentUserAccessor : ICurrentUserAccessor
{
    private readonly IHttpContextAccessor _http;

    public CurrentUserAccessor(IHttpContextAccessor http) => _http = http;

    public int? UserId
    {
        get
        {
            var user = _http.HttpContext?.User;
            if (user is null || !user.Identity?.IsAuthenticated == true) return null;

            var raw = user.FindFirstValue(ClaimTypes.NameIdentifier) 
                      ?? user.FindFirstValue("sub");
            return int.TryParse(raw, out var id) ? id : null;
        }
    }

    public bool IsAdmin
    {
        get
        {
            var user = _http.HttpContext?.User;
            if (user is null || !user.Identity?.IsAuthenticated == true) return false;
            return user.IsInRole("Admin");
        }
    }
}