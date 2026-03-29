using MediatR;

namespace BillSplitter.Application.Buddies.Commands.UpdateBuddyNickname;

public record UpdateBuddyNicknameCommand(Guid OwnerId, Guid BuddyId, string Nickname) : IRequest<BuddyNicknameResult>;

public record BuddyNicknameResult(Guid Id, string Email, string? Nickname);
