using BillSplitter.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Application.Expenses.Queries.GetExpenseTimeline;

public class GetExpenseTimelineQueryHandler : IRequestHandler<GetExpenseTimelineQuery, List<DailyExpenseEntry>>
{
    private readonly IApplicationDbContext _context;

    public GetExpenseTimelineQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DailyExpenseEntry>> Handle(GetExpenseTimelineQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = request.CurrentUserId;
        var since = DateTime.UtcNow.Date.AddDays(-(request.Days - 1));

        var expenses = await _context.Expenses
            .Include(e => e.ExpenseSplits)
            .Where(e => e.CreatedAt >= since &&
                        (e.PaidByUserId == currentUserId ||
                         e.ExpenseSplits.Any(s => s.UserId == currentUserId)))
            .ToListAsync(cancellationToken);

        // Group by calendar date — stay in UTC to match the date range keys below
        var grouped = expenses.GroupBy(e => DateOnly.FromDateTime(e.CreatedAt.Date));

        var resultMap = new Dictionary<DateOnly, (decimal OwedToMe, decimal IOwe)>();

        foreach (var group in grouped)
        {
            decimal owedToMe = 0;
            decimal iOwe = 0;

            foreach (var expense in group)
            {
                if (expense.PaidByUserId == currentUserId)
                {
                    // Others owe me: sum all splits that are NOT mine
                    owedToMe += expense.ExpenseSplits
                        .Where(s => s.UserId != currentUserId)
                        .Sum(s => s.Amount);
                }
                else
                {
                    // I owe: find my split
                    var mySplit = expense.ExpenseSplits.FirstOrDefault(s => s.UserId == currentUserId);
                    if (mySplit != null) iOwe += mySplit.Amount;
                }
            }

            resultMap[group.Key] = (owedToMe, iOwe);
        }

        // Build full date range (including zero-activity days)
        var entries = new List<DailyExpenseEntry>();
        for (int i = 0; i < request.Days; i++)
        {
            var date = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-(request.Days - 1 - i)));
            var (owedToMe, iOwe) = resultMap.TryGetValue(date, out var val) ? val : (0m, 0m);
            entries.Add(new DailyExpenseEntry(date, owedToMe, iOwe));
        }

        return entries;
    }
}
