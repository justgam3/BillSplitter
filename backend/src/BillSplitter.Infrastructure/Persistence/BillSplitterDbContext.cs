using BillSplitter.Application.Common.Interfaces;
using BillSplitter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace BillSplitter.Infrastructure.Persistence;

public class BillSplitterDbContext : DbContext, IApplicationDbContext
{
    public BillSplitterDbContext(DbContextOptions<BillSplitterDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<EmailVerification> EmailVerifications => Set<EmailVerification>();
    public DbSet<Buddy> Buddies => Set<Buddy>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ExpenseSplit> ExpenseSplits => Set<ExpenseSplit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}
