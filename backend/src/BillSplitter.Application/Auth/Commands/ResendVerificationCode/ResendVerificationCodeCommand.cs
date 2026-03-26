using MediatR;

namespace BillSplitter.Application.Auth.Commands.ResendVerificationCode;

public record ResendVerificationCodeCommand(string Email) : IRequest<ResendVerificationCodeResult>;

public record ResendVerificationCodeResult(string Message);
