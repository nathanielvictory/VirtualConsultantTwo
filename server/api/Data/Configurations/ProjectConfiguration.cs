using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> e)
    {
        // Primary key
        e.HasKey(p => p.Id);

        // Required columns
        e.Property(p => p.Kbid).IsRequired();
        e.Property(p => p.Name).IsRequired();
        e.Property(p => p.OrganizationId).IsRequired();

        // Helpful indexes
        e.HasIndex(p => p.Kbid).IsUnique();

        // Booleans with defaults
        e.Property(p => p.IsActive).HasDefaultValue(true);

        // Timestamps (database-side defaults; UTC)
        e.Property(p => p.CreatedAt).HasDefaultValueSql("now() at time zone 'utc'");
        e.Property(p => p.UpdatedAt).HasDefaultValueSql("now() at time zone 'utc'");

        // Optional timestamp; explicit TZ type retained from your style
        e.Property(p => p.LastRefreshed).HasColumnType("timestamp with time zone");
        
        e.HasOne(p => p.Organization)
            .WithMany(o => o.Projects)
            .HasForeignKey(p => p.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}