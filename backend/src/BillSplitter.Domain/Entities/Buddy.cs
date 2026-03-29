using BillSplitter.Domain.Common;

namespace BillSplitter.Domain.Entities;

public class Buddy : BaseEntity
{
    public Guid OwnerId { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string? Nickname { get; private set; }
    public Guid? LinkedUserId { get; private set; }

    // Navigation properties
    public User Owner { get; private set; } = null!;
    public User? LinkedUser { get; private set; }

    private Buddy() { }

    public static Buddy Create(Guid ownerId, string email, string? nickname = null)
    {
        return new Buddy
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Email = email,
            Nickname = nickname,
            LinkedUserId = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void UpdateNickname(string nickname)
    {
        Nickname = nickname;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToUser(Guid userId)
    {
        LinkedUserId = userId;
        UpdatedAt = DateTime.UtcNow;
    }
}
