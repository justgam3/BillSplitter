using MediatR;

namespace BillSplitter.Application.Auth.Queries.GetCurrentUser;

public record GetCurrentUserQuery(Guid UserId) : IRequest<GetCurrentUserResult>;

public record GetCurrentUserResult(Guid UserId, string Email, bool IsEmailVerified);
