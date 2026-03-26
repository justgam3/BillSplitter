using BillSplitter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<EmailVerification> EmailVerifications { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
