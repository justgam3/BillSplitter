using BillSplitter.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Application.Expenses.Queries.GetBalances;

public class GetBalancesQueryHandler : IRequestHandler<GetBalancesQuery, BalanceSummaryResult>
{
    private readonly IApplicationDbContext _context;

    public GetBalancesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BalanceSummaryResult> Handle(GetBalancesQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = request.CurrentUserId;

        // Get all buddies owned by the current user
        var buddies = await _context.Buddies
            .Where(b => b.OwnerId == currentUserId)
            .ToListAsync(cancellationToken);

        // Get all expenses involving the current user (as creator or participant)
        var expenses = await _context.Expenses
            .Include(e => e.ExpenseSplits)
            .Where(e => e.CreatedByUserId == currentUserId ||
                        e.ExpenseSplits.Any(s => s.UserId == currentUserId))
            .ToListAsync(cancellationToken);

        var balances = new List<BuddyBalanceDto>();

        foreach (var buddy in buddies)
        {
            decimal theyOweMe = 0;
            decimal iOweThem = 0;

            foreach (var expense in expenses)
            {
                bool iPaid = expense.PaidByUserId == currentUserId;
                bool buddyPaid = expense.PaidByBuddyId == buddy.Id ||
                                 (buddy.LinkedUserId.HasValue && expense.PaidByUserId == buddy.LinkedUserId);

                if (iPaid)
                {
                    // Find buddy's split in this expense
                    var buddySplit = expense.ExpenseSplits
                        .FirstOrDefault(s => s.BuddyId == buddy.Id ||
                                             (buddy.LinkedUserId.HasValue && s.UserId == buddy.LinkedUserId));

                    if (buddySplit != null)
                        theyOweMe += buddySplit.Amount;
                }
                else if (buddyPaid)
                {
                    // Find my split in this expense
                    var mySplit = expense.ExpenseSplits
                        .FirstOrDefault(s => s.UserId == currentUserId);

                    if (mySplit != null)
                        iOweThem += mySplit.Amount;
                }
            }

            var net = theyOweMe - iOweThem;
            var direction = net > 0 ? "TheyOweMe" : net < 0 ? "IOwe" : "Settled";

            balances.Add(new BuddyBalanceDto(
                buddy.Id,
                buddy.Email,
                buddy.Nickname,
                Math.Abs(net),
                direction));
        }

        var totalOwedToMe = balances.Where(b => b.Direction == "TheyOweMe").Sum(b => b.NetAmount);
        var totalIOwe = balances.Where(b => b.Direction == "IOwe").Sum(b => b.NetAmount);

        return new BalanceSummaryResult(totalOwedToMe, totalIOwe, balances);
    }
}
