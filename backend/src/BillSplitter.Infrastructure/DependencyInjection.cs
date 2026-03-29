using BillSplitter.Application.Common.Interfaces;
using BillSplitter.Infrastructure.Authentication;
using BillSplitter.Infrastructure.Email;
using BillSplitter.Infrastructure.Persistence;
using BillSplitter.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BillSplitter.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<BillSplitterDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .UseSnakeCaseNamingConvention());

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<BillSplitterDbContext>());

        // Authentication & Security
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        // Email
        services.AddHttpClient<IEmailService, ResendEmailService>();

        return services;
    }
}
