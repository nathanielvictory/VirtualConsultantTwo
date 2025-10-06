using System.ComponentModel.DataAnnotations;

namespace api.Dtos;


public record CreateUserDto(
    [Required] string Username,
    [Required] string Password,
    string? OrganizationId,  
    string[]? Roles    
);

public record UpdateUserDto(
    string? Username,
    string? Password,
    string? OrganizationId,
    string[]? Roles
);
