using MediatR;

namespace BillSplitter.Application.Expenses.Queries.GetExpenseTimeline;

public record GetExpenseTimelineQuery(Guid CurrentUserId, int Days = 7) : IRequest<List<DailyExpenseEntry>>;

public record DailyExpenseEntry(DateOnly Date, decimal OwedToMe, decimal IOwe);
