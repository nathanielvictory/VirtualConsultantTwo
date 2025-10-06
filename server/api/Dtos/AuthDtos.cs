// Dtos/AuthDtos.cs
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.Dtos;


// OAuth2 "password" grant request (form-encoded)
public class TokenRequest
{
    public string grant_type { get; set; } = "password";

    [Required] public string username { get; set; } = string.Empty;
    [Required] public string password { get; set; } = string.Empty;

    // Optional fields; keep for compatibility
    public string? scope { get; set; }
    public string? client_id { get; set; }
    public string? client_secret { get; set; }
}

// OAuth2 token response (standard field names)
public record TokenResponseDto(
    [property: JsonPropertyName("access_token")] string AccessToken,
    [property: JsonPropertyName("token_type")]   string TokenType,
    [property: JsonPropertyName("expires_in")]   int ExpiresIn,
    [property: JsonPropertyName("scope")]        string Scope = "",
    [property: JsonPropertyName("role_label")]   string RoleLabel = "User"
);