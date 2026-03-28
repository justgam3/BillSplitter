# Test Email Configuration for Development

## Overview

During development, BillSplitter uses **Resend's test email address** (`onboarding@resend.dev`) to send verification emails without requiring domain verification.

## Configuration

### Backend Settings

Located in: `backend/src/BillSplitter.API/appsettings.json`

```json
"Resend": {
  "ApiKey": "re_3AT8yV8n_4oZrkJgLtYGQNf5f8V8igezH",
  "FromEmail": "onboarding@resend.dev"
}
```

### What is `onboarding@resend.dev`?

- **Special test email** provided by Resend for development
- **Pre-verified** - works immediately without setup
- **Test mode only** - not suitable for production
- All emails appear to come from this address

## How to Get Verification Codes

### For Android Emulator Testing

1. **Register a new account** in the app with any email address
2. **Go to Resend Dashboard**: [resend.com](https://resend.com)
3. **Navigate to**: "Emails" section (left sidebar)
4. **Find your email**: Look for the verification email sent to your test email
5. **View the code**: Click on the email to see the 6-digit verification code
6. **Enter in app**: Copy and paste the code into your app

### What Recipients See

When testing with `test@example.com`, the email appears as:

```
From: onboarding@resend.dev
To: test@example.com
Subject: BillSplitter - Verify Your Email

Welcome to BillSplitter!
Please use the following code to verify your email address:
123456

This code will expire in 15 minutes.
```

## Alternative: Using Your Own Email

If you want verification emails delivered to your actual inbox:

### Option 1: Verify Personal Email in Resend

1. In Resend dashboard, go to **Email Addresses** section
2. Add and verify your personal email (e.g., `yourname@gmail.com`)
3. Update `appsettings.json`:
   ```json
   "FromEmail": "yourname@gmail.com"
   ```
4. Restart backend
5. Verification emails will now go to recipient's real inbox

### Option 2: Verify Custom Domain (Production Ready)

1. Purchase and own a domain (e.g., `billsplitter.com`)
2. In Resend dashboard, add your domain
3. Add DNS records provided by Resend
4. Wait for verification (usually 24-48 hours)
5. Update configuration:
   ```json
   "FromEmail": "noreply@billsplitter.com"
   ```

## Comparison Table

| From Email | Delivery | Setup Required | Use Case |
|------------|----------|----------------|----------|
| `onboarding@resend.dev` | Resend Dashboard | ✅ None | Development/Testing |
| `yourname@gmail.com` | Real inbox | ⚠️ Email verification | Personal testing |
| `noreply@yourdomain.com` | Real inbox | ⚠️ Domain ownership & DNS | Production |

## Troubleshooting

### Error: "Domain is not verified"

**Cause**: Using an unverified email address in `FromEmail`

**Solution**: 
1. Use `onboarding@resend.dev` for testing
2. Or verify your email/domain in Resend dashboard first

### Can't Find Verification Code

**Issue**: Email not in recipient's inbox

**Check**:
1. Verify backend is using `onboarding@resend.dev`
2. Check Resend dashboard → Emails section
3. Ensure backend is running when registration occurs
4. Check backend console logs for email sending errors

### API Key Invalid

**Symptoms**: 401 Unauthorized errors from Resend

**Solution**:
1. Go to Resend dashboard → API Keys
2. Generate a new API key
3. Update `appsettings.json` with new key
4. Restart backend

## Security Notes

⚠️ **Never commit API keys to version control**

Best practices:
- Use environment variables for production
- Use `appsettings.Development.json` for local development
- Add `appsettings.*.json` to `.gitignore` if it contains secrets
- Rotate API keys regularly

## Production Checklist

Before deploying to production:

- [ ] Purchase and verify custom domain
- [ ] Update `FromEmail` to professional address (e.g., `noreply@yourdomain.com`)
- [ ] Move API key to environment variable or Azure Key Vault
- [ ] Test email delivery to multiple email providers (Gmail, Outlook, etc.)
- [ ] Set up email monitoring and alerts
- [ ] Configure email rate limits in Resend dashboard

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Email Testing Guide](https://resend.com/docs/send-with-curl)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)

---

**Last Updated**: March 2026  
**Maintained By**: Development Team
