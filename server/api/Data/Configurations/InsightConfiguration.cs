using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations;

public class InsightConfiguration : IEntityTypeConfiguration<Insight>
{
    public void Configure(EntityTypeBuilder<Insight> e)
    {
        e.HasKey(i => i.Id);

        // Required fields
        e.Property(i => i.Content).IsRequired();
        e.Property(i => i.Source).IsRequired();      // "llm" or "user"
        e.Property(i => i.OrderIndex).HasDefaultValue(0);


        e.HasOne(i => i.Project)
            .WithMany(p => p.Insights)
            .HasForeignKey(i => i.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // Helpful composite index for ordered retrieval within a project
        e.HasIndex(i => new { i.ProjectId, i.OrderIndex });
    }
}