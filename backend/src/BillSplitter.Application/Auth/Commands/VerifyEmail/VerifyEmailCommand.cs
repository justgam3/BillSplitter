using BillSplitter.Application.Common.Models;
using MediatR;

namespace BillSplitter.Application.Auth.Commands.VerifyEmail;

public record VerifyEmailCommand(string Email, string VerificationCode) : IRequest<AuthenticationResult>;
