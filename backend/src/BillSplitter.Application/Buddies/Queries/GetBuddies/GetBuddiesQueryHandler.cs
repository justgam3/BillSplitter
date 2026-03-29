using BillSplitter.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Application.Buddies.Queries.GetBuddies;

public class GetBuddiesQueryHandler : IRequestHandler<GetBuddiesQuery, List<BuddyDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBuddiesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BuddyDto>> Handle(GetBuddiesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Buddies
            .Where(b => b.OwnerId == request.OwnerId)
            .OrderBy(b => b.Nickname ?? b.Email)
            .Select(b => new BuddyDto(b.Id, b.Email, b.Nickname, b.LinkedUserId))
            .ToListAsync(cancellationToken);
    }
}
