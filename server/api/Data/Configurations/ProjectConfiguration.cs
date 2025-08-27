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

        // Column requirements / sizes
        e.Property(p => p.Kbid).IsRequired();
        e.Property(p => p.Name).IsRequired();
        e.Property(p => p.OrganizationId).IsRequired();

        // Helpful indexes
        e.HasIndex(p => p.Kbid).IsUnique();  // prevent duplicate external IDs

        // Booleans with defaults
        e.Property(p => p.IsActive).HasDefaultValue(true);
        e.Property(p => p.HasData).HasDefaultValue(false);

        // Timestamps (database-side defaults; UTC)
        e.Property(p => p.CreatedAt)
            .HasDefaultValueSql("now() at time zone 'utc'");
        e.Property(p => p.UpdatedAt)
            .HasDefaultValueSql("now() at time zone 'utc'");

        // Optional timestamp; timestamptz is explicit in PG
        e.Property(p => p.LastRefreshed)
            .HasColumnType("timestamp with time zone");
    }
}