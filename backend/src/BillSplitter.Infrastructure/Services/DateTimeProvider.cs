using BillSplitter.Application.Common.Interfaces;

namespace BillSplitter.Infrastructure.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
