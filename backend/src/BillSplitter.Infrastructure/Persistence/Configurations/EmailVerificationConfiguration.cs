using BillSplitter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BillSplitter.Infrastructure.Persistence.Configurations;

public class EmailVerificationConfiguration : IEntityTypeConfiguration<EmailVerification>
{
    public void Configure(EntityTypeBuilder<EmailVerification> builder)
    {
        builder.ToTable("email_verifications");

        builder.HasKey(ev => ev.Id);

        builder.Property(ev => ev.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(ev => ev.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(ev => ev.VerificationCode)
            .HasColumnName("verification_code")
            .HasMaxLength(6)
            .IsRequired();

        builder.Property(ev => ev.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.Property(ev => ev.IsUsed)
            .HasColumnName("is_used")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(ev => ev.LastResentAt)
            .HasColumnName("last_resent_at");

        builder.Property(ev => ev.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(ev => ev.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        builder.HasIndex(ev => ev.UserId)
            .HasDatabaseName("idx_email_verifications_user_id");

        builder.HasIndex(ev => ev.VerificationCode)
            .HasDatabaseName("idx_email_verifications_code");
    }
}
