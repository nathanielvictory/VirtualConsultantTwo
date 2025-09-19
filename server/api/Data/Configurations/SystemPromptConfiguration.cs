using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations;

public class SystemPromptConfiguration : IEntityTypeConfiguration<SystemPrompt>
{
    public void Configure(EntityTypeBuilder<SystemPrompt> e)
    {
        e.Property(p => p.Prompt)
            .HasColumnType("text");

        e.HasIndex(p => p.PromptType);
        e.HasIndex(p => new { p.PromptType, p.CreatedAt });

        e.Property(p => p.CreatedAt)
            .HasDefaultValueSql("now() at time zone 'utc'");
    }
}