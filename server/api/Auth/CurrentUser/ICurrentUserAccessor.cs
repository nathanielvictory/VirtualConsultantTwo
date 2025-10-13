// Security/ICurrentUserAccessor.cs
namespace api.Auth.CurrentUser;

public interface ICurrentUserAccessor
{
    int? UserId { get; }   // null when unauthenticated or non-HTTP contexts
    bool IsAdmin { get; }  // true if user has the Admin role
}