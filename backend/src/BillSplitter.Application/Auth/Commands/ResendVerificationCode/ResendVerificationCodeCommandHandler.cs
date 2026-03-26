using BillSplitter.Application.Common.Interfaces;
using BillSplitter.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace BillSplitter.Application.Auth.Commands.ResendVerificationCode;

public class ResendVerificationCodeCommandHandler : IRequestHandler<ResendVerificationCodeCommand, ResendVerificationCodeResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IDateTimeProvider _dateTimeProvider;

    public ResendVerificationCodeCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _emailService = emailService;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<ResendVerificationCodeResult> Handle(ResendVerificationCodeCommand request, CancellationToken cancellationToken)
    {
        // Find user
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (user.IsEmailVerified)
        {
            throw new InvalidOperationException("Email already verified");
        }

        // Get latest verification
        var latestVerification = await _context.EmailVerifications
            .Where(ev => ev.UserId == user.Id)
            .OrderByDescending(ev => ev.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        // Check cooldown
        if (latestVerification != null && !latestVerification.CanResend(_dateTimeProvider.UtcNow))
        {
            throw new InvalidOperationException("Please wait before requesting a new code");
        }

        // Generate new code
        var verificationCode = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var expiresAt = _dateTimeProvider.UtcNow.AddMinutes(15);

        var newVerification = EmailVerification.Create(user.Id, verificationCode, expiresAt);
        _context.EmailVerifications.Add(newVerification);

        await _context.SaveChangesAsync(cancellationToken);

        // Send email
        await _emailService.SendVerificationEmailAsync(user.Email, verificationCode);

        return new ResendVerificationCodeResult("Verification code resent successfully.");
    }
}
