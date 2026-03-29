using BillSplitter.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Application.Buddies.Commands.UpdateBuddyNickname;

public class UpdateBuddyNicknameCommandHandler : IRequestHandler<UpdateBuddyNicknameCommand, BuddyNicknameResult>
{
    private readonly IApplicationDbContext _context;

    public UpdateBuddyNicknameCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BuddyNicknameResult> Handle(UpdateBuddyNicknameCommand request, CancellationToken cancellationToken)
    {
        var buddy = await _context.Buddies
            .FirstOrDefaultAsync(b => b.Id == request.BuddyId && b.OwnerId == request.OwnerId, cancellationToken);

        if (buddy == null)
            throw new InvalidOperationException("Buddy not found.");

        buddy.UpdateNickname(request.Nickname);
        await _context.SaveChangesAsync(cancellationToken);

        return new BuddyNicknameResult(buddy.Id, buddy.Email, buddy.Nickname);
    }
}
