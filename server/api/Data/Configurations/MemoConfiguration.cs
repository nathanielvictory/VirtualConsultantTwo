using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations;

public class MemoConfiguration : IEntityTypeConfiguration<Memo>
{
    public void Configure(EntityTypeBuilder<Memo> e)
    {
        e.HasKey(m => m.Id);

        e.Property(m => m.Name).IsRequired();

        e.HasOne(m => m.Project)
            .WithMany(p => p.Memos)
            .HasForeignKey(m => m.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        e.HasOne(m => m.CreatedBy)
            .WithMany()
            .HasForeignKey(m => m.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        e.HasIndex(m => m.ProjectId);

        e.Property(m => m.CreatedAt).HasDefaultValueSql("now() at time zone 'utc'");
        e.Property(m => m.UpdatedAt).HasDefaultValueSql("now() at time zone 'utc'");
    }
}