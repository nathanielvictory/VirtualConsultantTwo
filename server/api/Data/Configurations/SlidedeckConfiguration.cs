using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations;

public class SlidedeckConfiguration : IEntityTypeConfiguration<Slidedeck>
{
    public void Configure(EntityTypeBuilder<Slidedeck> e)
    {
        e.HasKey(s => s.Id);

        e.Property(s => s.Name).IsRequired();

        e.HasOne(s => s.Project)
            .WithMany(p => p.Slidedecks)
            .HasForeignKey(s => s.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        e.HasOne(s => s.CreatedBy)
            .WithMany()
            .HasForeignKey(s => s.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        e.HasIndex(s => s.ProjectId);

        e.Property(s => s.CreatedAt).HasDefaultValueSql("now() at time zone 'utc'");
        e.Property(s => s.UpdatedAt).HasDefaultValueSql("now() at time zone 'utc'");
    }
}