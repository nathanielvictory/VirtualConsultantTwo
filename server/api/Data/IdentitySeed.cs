// Data/IdentitySeed.cs
using Microsoft.AspNetCore.Identity;
using api.Models;

namespace api.Data;

public static class IdentitySeed
{
    public static async Task EnsureAdminAsync(IServiceProvider sp, IConfiguration cfg)
    {
        using var scope = sp.CreateScope();
        var roleMgr = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
        var userMgr = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

        // Ensure Admin role
        if (!await roleMgr.RoleExistsAsync("Admin"))
            await roleMgr.CreateAsync(new IdentityRole<int>("Admin"));

        var adminUserName = cfg["Admin:Username"] ?? "nathaniel@victorymodeling.com";
        var adminPassword = cfg["Admin:Password"] ?? "changedpassword";

        var admin = await userMgr.FindByNameAsync(adminUserName);
        if (admin is null)
        {
            admin = new User { UserName = adminUserName };
            var created = await userMgr.CreateAsync(admin, adminPassword);
            if (created.Succeeded)
                await userMgr.AddToRoleAsync(admin, "Admin");
        }
    }
}