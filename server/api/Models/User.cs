using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace api.Models;

public class User : IdentityUser<int>
{
    public List<OrganizationMembership> OrganizationMemberships { get; set; } = new();
}