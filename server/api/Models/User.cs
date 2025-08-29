using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace api.Models;

public class AppUser : IdentityUser<int>
{

}