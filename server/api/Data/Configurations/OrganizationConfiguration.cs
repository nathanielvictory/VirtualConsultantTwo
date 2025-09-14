using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Data.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> e)
    {
        // Primary key
        e.HasKey(o => o.Id);

        // Required columns
        e.Property(o => o.Id).IsRequired();
        e.Property(o => o.Name).IsRequired();

        // Helpful index
        e.HasIndex(o => o.Name);
    }
}