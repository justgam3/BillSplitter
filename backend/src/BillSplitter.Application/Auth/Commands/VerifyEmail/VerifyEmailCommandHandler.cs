using BillSplitter.Application.Common.Interfaces;
using BillSplitter.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Application.Auth.Commands.VerifyEmail;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, AuthenticationResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IDateTimeProvider _dateTimeProvider;

    public VerifyEmailCommandHandler(
        IApplicationDbContext context,
        IJwtTokenGenerator tokenGenerator,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _tokenGenerator = tokenGenerator;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<AuthenticationResult> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        // Find user
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Find verification code
        var verification = await _context.EmailVerifications
            .Where(ev => ev.UserId == user.Id && ev.VerificationCode == request.VerificationCode && !ev.IsUsed)
            .OrderByDescending(ev => ev.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (verification == null)
        {
            throw new InvalidOperationException("Invalid verification code");
        }

        if (verification.IsExpired(_dateTimeProvider.UtcNow))
        {
            throw new InvalidOperationException("Verification code expired");
        }

        // Mark verification as used
        verification.MarkAsUsed();
        user.VerifyEmail();

        await _context.SaveChangesAsync(cancellationToken);

        // Generate JWT token
        var token = _tokenGenerator.GenerateToken(user.Id, user.Email);
        var expiresAt = _dateTimeProvider.UtcNow.AddMinutes(1440);

        return new AuthenticationResult(token, user.Id, user.Email, expiresAt);
    }
}
