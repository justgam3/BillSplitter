using BillSplitter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BillSplitter.Infrastructure.Persistence.Configurations;

public class BuddyConfiguration : IEntityTypeConfiguration<Buddy>
{
    public void Configure(EntityTypeBuilder<Buddy> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id)
            .ValueGeneratedNever();

        builder.Property(b => b.OwnerId)
            .IsRequired();

        builder.Property(b => b.Email)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(b => b.Nickname)
            .HasMaxLength(100);

        builder.Property(b => b.LinkedUserId);

        builder.Property(b => b.CreatedAt)
            .IsRequired();

        builder.Property(b => b.UpdatedAt)
            .IsRequired();

        builder.HasIndex(b => new { b.OwnerId, b.Email })
            .HasDatabaseName("idx_buddies_owner_email")
            .IsUnique();

        builder.HasOne(b => b.Owner)
            .WithMany()
            .HasForeignKey(b => b.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(b => b.LinkedUser)
            .WithMany()
            .HasForeignKey(b => b.LinkedUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
