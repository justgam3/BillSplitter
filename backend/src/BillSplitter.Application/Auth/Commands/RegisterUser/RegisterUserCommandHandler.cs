using BillSplitter.Application.Common.Interfaces;
using BillSplitter.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace BillSplitter.Application.Auth.Commands.RegisterUser;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, RegisterUserResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailService _emailService;
    private readonly IDateTimeProvider _dateTimeProvider;

    public RegisterUserCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IEmailService emailService,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<RegisterUserResult> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already registered");
        }

        // Hash password
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        // Create user
        var user = User.Create(request.Email, passwordHash);

        _context.Users.Add(user);

        // Generate 6-digit verification code
        var verificationCode = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var expiresAt = _dateTimeProvider.UtcNow.AddMinutes(15);

        var emailVerification = EmailVerification.Create(user.Id, verificationCode, expiresAt);
        _context.EmailVerifications.Add(emailVerification);

        await _context.SaveChangesAsync(cancellationToken);

        // Send verification email
        await _emailService.SendVerificationEmailAsync(user.Email, verificationCode);

        return new RegisterUserResult(
            user.Id,
            user.Email,
            "Registration successful. Please check your email for verification code."
        );
    }
}
