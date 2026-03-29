using BillSplitter.Application.Common.Interfaces;
using BillSplitter.Domain.Entities;
using BillSplitter.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Application.Expenses.Commands.CreateExpense;

public class CreateExpenseCommandHandler : IRequestHandler<CreateExpenseCommand, CreateExpenseResult>
{
    private readonly IApplicationDbContext _context;

    public CreateExpenseCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateExpenseResult> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        // Validate participants sum equals total amount
        var participantSum = request.Participants.Sum(p => p.Amount);
        if (Math.Abs(participantSum - request.Amount) > 0.01m)
            throw new InvalidOperationException($"Participant amounts ({participantSum}) must sum to expense total ({request.Amount}).");

        if (request.Participants.Count == 0)
            throw new InvalidOperationException("At least one participant is required.");

        if (!Enum.TryParse<SplitType>(request.SplitType, out var splitType))
            throw new InvalidOperationException($"Invalid split type: {request.SplitType}.");

        Expense expense;

        if (request.PaidBy.Type == "Me")
        {
            expense = Expense.CreatePaidByUser(
                request.CreatedByUserId,
                request.Description,
                request.Amount,
                request.CurrencyCode,
                splitType,
                request.CreatedByUserId);
        }
        else if (request.PaidBy.Type == "Buddy" && request.PaidBy.BuddyId.HasValue)
        {
            // Verify the buddy belongs to this user
            var buddy = await _context.Buddies
                .FirstOrDefaultAsync(b => b.Id == request.PaidBy.BuddyId.Value && b.OwnerId == request.CreatedByUserId, cancellationToken);

            if (buddy == null)
                throw new InvalidOperationException("Buddy not found.");

            expense = Expense.CreatePaidByBuddy(
                request.CreatedByUserId,
                request.Description,
                request.Amount,
                request.CurrencyCode,
                splitType,
                request.PaidBy.BuddyId.Value);
        }
        else
        {
            throw new InvalidOperationException("Invalid paidBy configuration.");
        }

        _context.Expenses.Add(expense);

        // Create splits
        foreach (var participant in request.Participants)
        {
            ExpenseSplit split;

            if (participant.Self)
            {
                split = ExpenseSplit.ForUser(expense.Id, request.CreatedByUserId, participant.Amount);
            }
            else if (participant.BuddyId.HasValue)
            {
                split = ExpenseSplit.ForBuddy(expense.Id, participant.BuddyId.Value, participant.Amount);
            }
            else
            {
                throw new InvalidOperationException("Each participant must either be 'self' or have a buddyId.");
            }

            _context.ExpenseSplits.Add(split);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new CreateExpenseResult(expense.Id, expense.Description, expense.Amount, expense.CurrencyCode, expense.SplitType.ToString());
    }
}
