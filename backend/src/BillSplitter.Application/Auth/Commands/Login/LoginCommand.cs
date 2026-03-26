using BillSplitter.Application.Common.Models;
using MediatR;

namespace BillSplitter.Application.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthenticationResult>;
