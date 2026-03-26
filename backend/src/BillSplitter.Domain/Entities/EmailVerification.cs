using BillSplitter.Domain.Common;

namespace BillSplitter.Domain.Entities;

public class EmailVerification : BaseEntity
{
    public Guid UserId { get; private set; }
    public string VerificationCode { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public bool IsUsed { get; private set; }
    public DateTime? LastResentAt { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;

    // Private constructor for EF Core
    private EmailVerification() { }

    public static EmailVerification Create(Guid userId, string code, DateTime expiresAt)
    {
        return new EmailVerification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            VerificationCode = code,
            ExpiresAt = expiresAt,
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    public bool IsExpired(DateTime currentTime) => currentTime > ExpiresAt;

    public bool CanResend(DateTime currentTime, int cooldownSeconds = 30)
    {
        if (LastResentAt == null) return true;
        return (currentTime - LastResentAt.Value).TotalSeconds >= cooldownSeconds;
    }

    public void MarkAsResent(DateTime currentTime)
    {
        LastResentAt = currentTime;
    }

    public void MarkAsUsed()
    {
        IsUsed = true;
    }
}
