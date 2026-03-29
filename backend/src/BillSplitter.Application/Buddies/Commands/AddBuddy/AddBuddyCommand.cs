using MediatR;

namespace BillSplitter.Application.Buddies.Commands.AddBuddy;

public record AddBuddyCommand(Guid OwnerId, string Email, string? Nickname) : IRequest<BuddyResult>;

public record BuddyResult(Guid Id, string Email, string? Nickname, Guid? LinkedUserId);
