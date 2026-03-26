using BillSplitter.Domain.Common;

namespace BillSplitter.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public bool IsEmailVerified { get; private set; }

    // Navigation properties
    public ICollection<EmailVerification> EmailVerifications { get; private set; } = new List<EmailVerification>();

    // Private constructor for EF Core
    private User() { }

    // Factory method
    public static User Create(string email, string passwordHash)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = passwordHash,
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void VerifyEmail()
    {
        IsEmailVerified = true;
        UpdatedAt = DateTime.UtcNow;
    }
}
