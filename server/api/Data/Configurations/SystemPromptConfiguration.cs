using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations;

public class SystemPromptConfiguration : IEntityTypeConfiguration<SystemPrompt>
{
    public void Configure(EntityTypeBuilder<SystemPrompt> e)
    {
        e.HasKey(p => p.Id);

        // Store enum as string (e.g., "ResearchAgent")
        e.Property(p => p.PromptType)
            .HasConversion<string>()
            .IsRequired();

        // Prefer TEXT in Postgres to avoid length limits
        e.Property(p => p.Prompt)
            .IsRequired()
            .HasColumnType("text");

        e.HasIndex(p => p.PromptType);
        e.HasIndex(p => new { p.PromptType, p.CreatedAt });

        e.Property(p => p.CreatedAt)
            .HasDefaultValueSql("now() at time zone 'utc'");
    }
}