using BillSplitter.Application.Common.Interfaces;
using BillSplitter.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Application.Buddies.Commands.AddBuddy;

public class AddBuddyCommandHandler : IRequestHandler<AddBuddyCommand, BuddyResult>
{
    private readonly IApplicationDbContext _context;

    public AddBuddyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BuddyResult> Handle(AddBuddyCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.Buddies
            .FirstOrDefaultAsync(b => b.OwnerId == request.OwnerId && b.Email == request.Email, cancellationToken);

        if (existing != null)
            throw new InvalidOperationException("Buddy with this email already exists.");

        // Check if the buddy email belongs to a registered user and link it
        var linkedUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        var buddy = Buddy.Create(request.OwnerId, request.Email, request.Nickname);

        if (linkedUser != null)
            buddy.LinkToUser(linkedUser.Id);

        _context.Buddies.Add(buddy);
        await _context.SaveChangesAsync(cancellationToken);

        return new BuddyResult(buddy.Id, buddy.Email, buddy.Nickname, buddy.LinkedUserId);
    }
}
