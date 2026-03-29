using MediatR;

namespace BillSplitter.Application.Expenses.Queries.GetBalances;

public record GetBalancesQuery(Guid CurrentUserId) : IRequest<BalanceSummaryResult>;

public record BuddyBalanceDto(
    Guid BuddyId,
    string Email,
    string? Nickname,
    decimal NetAmount,
    string Direction   // "TheyOweMe" | "IOwe" | "Settled"
);

public record BalanceSummaryResult(
    decimal TotalOwedToMe,
    decimal TotalIOwe,
    List<BuddyBalanceDto> Balances
);
