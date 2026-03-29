using BillSplitter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BillSplitter.Infrastructure.Persistence.Configurations;

public class EmailVerificationConfiguration : IEntityTypeConfiguration<EmailVerification>
{
    public void Configure(EntityTypeBuilder<EmailVerification> builder)
    {
        builder.HasKey(ev => ev.Id);

        builder.Property(ev => ev.Id)
            .ValueGeneratedNever();

        builder.Property(ev => ev.UserId)
            .IsRequired();

        builder.Property(ev => ev.VerificationCode)
            .HasMaxLength(6)
            .IsRequired();

        builder.Property(ev => ev.ExpiresAt)
            .IsRequired();

        builder.Property(ev => ev.IsUsed)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(ev => ev.CreatedAt)
            .IsRequired();

        builder.Property(ev => ev.UpdatedAt)
            .IsRequired();

        builder.HasIndex(ev => ev.UserId)
            .HasDatabaseName("idx_email_verifications_user_id");

        builder.HasIndex(ev => ev.VerificationCode)
            .HasDatabaseName("idx_email_verifications_code");
    }
}
