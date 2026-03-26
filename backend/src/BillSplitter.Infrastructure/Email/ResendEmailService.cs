using BillSplitter.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;

namespace BillSplitter.Infrastructure.Email;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _fromEmail;

    public ResendEmailService(IConfiguration configuration, HttpClient httpClient)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Resend:ApiKey"] ?? throw new InvalidOperationException("Resend API key not configured");
        _fromEmail = configuration["Resend:FromEmail"] ?? "noreply@billsplitter.com";

        _httpClient.BaseAddress = new Uri("https://api.resend.com/");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
    }

    public async Task SendVerificationEmailAsync(string toEmail, string verificationCode)
    {
        var emailData = new
        {
            from = _fromEmail,
            to = toEmail,
            subject = "BillSplitter - Verify Your Email",
            html = $@"
                <html>
                    <body>
                        <h2>Welcome to BillSplitter!</h2>
                        <p>Please use the following code to verify your email address:</p>
                        <h1 style='color: #212121; letter-spacing: 5px;'>{verificationCode}</h1>
                        <p>This code will expire in 15 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                    </body>
                </html>"
        };

        var response = await _httpClient.PostAsJsonAsync("emails", emailData);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Failed to send email: {error}");
        }
    }
}
