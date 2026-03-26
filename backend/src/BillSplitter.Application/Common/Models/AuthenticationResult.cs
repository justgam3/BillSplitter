namespace BillSplitter.Application.Common.Models;

public record AuthenticationResult(
    string Token,
    Guid UserId,
    string Email,
    DateTime ExpiresAt
);
