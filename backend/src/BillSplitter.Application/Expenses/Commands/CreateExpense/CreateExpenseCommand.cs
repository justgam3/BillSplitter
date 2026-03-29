using MediatR;

namespace BillSplitter.Application.Expenses.Commands.CreateExpense;

public record PaidByDto(string Type, Guid? BuddyId);  // Type: "Me" | "Buddy"

public record ParticipantDto(Guid? BuddyId, bool Self, decimal Amount);

public record CreateExpenseCommand(
    Guid CreatedByUserId,
    string Description,
    decimal Amount,
    string CurrencyCode,
    string SplitType,
    PaidByDto PaidBy,
    List<ParticipantDto> Participants
) : IRequest<CreateExpenseResult>;

public record CreateExpenseResult(Guid Id, string Description, decimal Amount, string CurrencyCode, string SplitType);
