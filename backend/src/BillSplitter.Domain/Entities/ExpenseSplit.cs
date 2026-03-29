using BillSplitter.Domain.Common;

namespace BillSplitter.Domain.Entities;

public class ExpenseSplit : BaseEntity
{
    public Guid ExpenseId { get; private set; }
    public Guid? UserId { get; private set; }
    public Guid? BuddyId { get; private set; }
    public decimal Amount { get; private set; }

    // Navigation properties
    public Expense Expense { get; private set; } = null!;
    public User? User { get; private set; }
    public Buddy? Buddy { get; private set; }

    private ExpenseSplit() { }

    public static ExpenseSplit ForUser(Guid expenseId, Guid userId, decimal amount)
    {
        return new ExpenseSplit
        {
            Id = Guid.NewGuid(),
            ExpenseId = expenseId,
            UserId = userId,
            BuddyId = null,
            Amount = amount,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static ExpenseSplit ForBuddy(Guid expenseId, Guid buddyId, decimal amount)
    {
        return new ExpenseSplit
        {
            Id = Guid.NewGuid(),
            ExpenseId = expenseId,
            UserId = null,
            BuddyId = buddyId,
            Amount = amount,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
