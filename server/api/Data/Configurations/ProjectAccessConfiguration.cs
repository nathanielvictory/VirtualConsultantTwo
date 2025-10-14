using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations;

public class ProjectAccessConfiguration : IEntityTypeConfiguration<ProjectAccess>
{
    public void Configure(EntityTypeBuilder<ProjectAccess> b)
    {
        // Composite PK
        b.HasKey(x => new { x.UserId, x.ProjectId });

        // Relationships
        b.HasOne(x => x.Project)
            .WithMany(p => p.ProjectAccesses)
            .HasForeignKey(x => x.ProjectId)
            .IsRequired(false)                      // <- optional fixes the warning
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.User)
            .WithMany()                             // no nav on User; simple
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Helpful indexes (optional)
        b.HasIndex(x => x.UserId);
        b.HasIndex(x => x.ProjectId);
        // If you’re on Postgres and this grows large, you can consider partial indexes later.
    }
}