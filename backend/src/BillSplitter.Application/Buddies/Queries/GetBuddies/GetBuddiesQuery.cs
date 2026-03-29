using MediatR;

namespace BillSplitter.Application.Buddies.Queries.GetBuddies;

public record GetBuddiesQuery(Guid OwnerId) : IRequest<List<BuddyDto>>;

public record BuddyDto(Guid Id, string Email, string? Nickname, Guid? LinkedUserId);
