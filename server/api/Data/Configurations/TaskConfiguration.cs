using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations;

public class TaskConfiguration : IEntityTypeConfiguration<TaskJob>
{
    public void Configure(EntityTypeBuilder<TaskJob> e)
    {
        e.HasKey(t => t.Id);

        e.Property(t => t.JobType).IsRequired();
        e.Property(t => t.JobStatus).IsRequired();
        e.Property(t => t.PayloadJson).HasDefaultValue("{}").IsRequired();

        // Indexes
        e.HasIndex(t => new { t.ProjectId, t.CreatedAt });
        e.HasIndex(t => t.CreatedByUserId);

        // Defaults for timestamps
        e.Property(t => t.CreatedAt).HasDefaultValueSql("now() at time zone 'utc'");
        e.Property(t => t.UpdatedAt).HasDefaultValueSql("now() at time zone 'utc'");

        // Relationships
        e.HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        e.HasOne(t => t.CreatedByUser)
            .WithMany() // if you want: .WithMany(u => u.Tasks) later
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        e.HasMany(t => t.Artifacts)
            .WithOne(a => a.Task)
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class TaskArtifactConfiguration : IEntityTypeConfiguration<TaskArtifact>
{
    public void Configure(EntityTypeBuilder<TaskArtifact> e)
    {
        e.HasKey(a => a.Id);

        e.Property(a => a.ResourceType).IsRequired();
        e.Property(a => a.ResourceId).IsRequired();
        e.Property(a => a.Action).IsRequired();

        e.Property(a => a.CreatedAt).HasDefaultValueSql("now() at time zone 'utc'");

        e.HasIndex(a => new { a.TaskId, a.CreatedAt });
    }
}