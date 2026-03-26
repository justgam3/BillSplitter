using BillSplitter.Application.Common.Models;
using MediatR;

namespace BillSplitter.Application.Auth.Commands.RegisterUser;

public record RegisterUserCommand(string Email, string Password) : IRequest<RegisterUserResult>;

public record RegisterUserResult(Guid UserId, string Email, string Message);
