using BillSplitter.Application.Common.Interfaces;
using BillSplitter.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Application.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthenticationResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IDateTimeProvider _dateTimeProvider;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator tokenGenerator,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<AuthenticationResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Find user
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Verify password
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Check if email is verified
        if (!user.IsEmailVerified)
        {
            throw new InvalidOperationException("Email not verified");
        }

        // Generate JWT token
        var token = _tokenGenerator.GenerateToken(user.Id, user.Email);
        var expiresAt = _dateTimeProvider.UtcNow.AddMinutes(1440);

        return new AuthenticationResult(token, user.Id, user.Email, expiresAt);
    }
}
