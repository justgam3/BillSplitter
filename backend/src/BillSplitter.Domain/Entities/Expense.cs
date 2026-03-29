using BillSplitter.Domain.Common;
using BillSplitter.Domain.Enums;

namespace BillSplitter.Domain.Entities;

public class Expense : BaseEntity
{
    public Guid CreatedByUserId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public string CurrencyCode { get; private set; } = "MYR";
    public SplitType SplitType { get; private set; }
    public Guid? PaidByUserId { get; private set; }
    public Guid? PaidByBuddyId { get; private set; }

    // Navigation properties
    public User CreatedByUser { get; private set; } = null!;
    public User? PaidByUser { get; private set; }
    public Buddy? PaidByBuddy { get; private set; }
    public ICollection<ExpenseSplit> ExpenseSplits { get; private set; } = new List<ExpenseSplit>();

    private Expense() { }

    public static Expense CreatePaidByUser(
        Guid createdByUserId,
        string description,
        decimal amount,
        string currencyCode,
        SplitType splitType,
        Guid paidByUserId)
    {
        return new Expense
        {
            Id = Guid.NewGuid(),
            CreatedByUserId = createdByUserId,
            Description = description,
            Amount = amount,
            CurrencyCode = currencyCode,
            SplitType = splitType,
            PaidByUserId = paidByUserId,
            PaidByBuddyId = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static Expense CreatePaidByBuddy(
        Guid createdByUserId,
        string description,
        decimal amount,
        string currencyCode,
        SplitType splitType,
        Guid paidByBuddyId)
    {
        return new Expense
        {
            Id = Guid.NewGuid(),
            CreatedByUserId = createdByUserId,
            Description = description,
            Amount = amount,
            CurrencyCode = currencyCode,
            SplitType = splitType,
            PaidByUserId = null,
            PaidByBuddyId = paidByBuddyId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
