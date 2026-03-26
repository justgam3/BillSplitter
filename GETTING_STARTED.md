# Getting Started with BillSplitter

## Quick Start Guide

### Prerequisites
- .NET 10 SDK
- Node.js 18+
- PostgreSQL database
- Android Studio or Xcode (for mobile testing)
- Resend API key (for email verification)

### 1. Backend Setup

```bash
cd backend

# Install EF Core tools (if not installed)
dotnet tool install --global dotnet-ef

# Create database migration (restart terminal first if dotnet-ef was just installed)
dotnet ef migrations add InitialCreate \
  --project src/BillSplitter.Infrastructure \
  --startup-project src/BillSplitter.API \
  --output-dir Persistence/Migrations

# Apply migration to database
dotnet ef database update \
  --project src/BillSplitter.Infrastructure \
  --startup-project src/BillSplitter.API

# Run the backend API
dotnet run --project src/BillSplitter.API
```

**Backend Configuration:**
- Update `src/BillSplitter.API/appsettings.json`:
  - PostgreSQL connection string
  - Resend API key (or check console for verification codes in development)

**Backend will run on:** `https://localhost:5001` (or the port shown in console)

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL
# Edit src/config/api.config.ts and set the correct API base URL:
# - Android Emulator: http://10.0.2.2:5001/api
# - iOS Simulator: http://localhost:5001/api
# - Physical Device: http://YOUR_COMPUTER_IP:5001/api

# Start development server
npm start
```

**Run on device:**
- **Android Emulator**: Press `a` in terminal or run `npm run android`
- **iOS Simulator**: Press `i` in terminal or run `npm run ios` (macOS only)
- **Physical Device**: Install Expo Go app and scan QR code

---

### 3. Testing the App

1. **Start Backend**: Ensure backend API is running
2. **Start Frontend**: Start Expo development server
3. **Open App**: Launch on emulator/device
4. **Register**: Create a new account with email and password
5. **Verify Email**:
   - Check backend console logs for the 6-digit verification code
   - Enter the code in the app
6. **Login**: Login with your credentials
7. **Success**: You should see the main screen with your email

---

## Project Structure

```
BillSplitter/
├── backend/                # .NET 10 Backend API
│   └── src/
│       ├── BillSplitter.API/
│       ├── BillSplitter.Application/
│       ├── BillSplitter.Domain/
│       └── BillSplitter.Infrastructure/
├── frontend/               # React Native Mobile App
│   └── src/
│       ├── components/
│       ├── screens/
│       ├── services/
│       ├── navigation/
│       ├── utils/
│       └── theme/
└── docs/                   # Documentation
    ├── plans/
    └── releases/
```

---

## Key Features Implemented

### Authentication Flow
✅ User registration with email/password
✅ Email verification with 6-digit code (15-min expiry)
✅ Resend verification code (30-second cooldown)
✅ User login with JWT tokens
✅ Password strength validation (Medium/High only)
✅ Persistent login across app restarts
✅ Secure token storage

### UI/UX
✅ Material Design 3 theme
✅ Password strength indicator
✅ Real-time form validation
✅ Loading states and error handling
✅ Smooth navigation transitions

---

## Troubleshooting

### Backend Issues

**Problem**: dotnet-ef command not found
**Solution**: Install EF Core tools and restart terminal
```bash
dotnet tool install --global dotnet-ef
```

**Problem**: Database connection error
**Solution**: Check PostgreSQL is running and connection string is correct

**Problem**: Email not sending
**Solution**: Check Resend API key in appsettings.json or view verification code in console logs

---

### Frontend Issues

**Problem**: Cannot connect to backend
**Solution**:
- Check API_BASE_URL in `src/config/api.config.ts`
- For Android emulator, use `http://10.0.2.2:5001/api` (not localhost)
- For physical device, use your computer's IP address
- Ensure backend is running

**Problem**: App won't start
**Solution**:
```bash
npm install
npx expo start -c  # Clear cache
```

**Problem**: TypeScript errors
**Solution**:
```bash
npx tsc --noEmit  # Check for type errors
```

---

## Next Steps

1. **Test the authentication flow** completely
2. **Configure production environment**:
   - Use proper JWT secrets
   - Restrict CORS policy
   - Add HTTPS in production
   - Configure production database
3. **Add tests** (unit, integration, E2E)
4. **Implement expense management features**
5. **Deploy to production**:
   - Backend: Azure, AWS, or your preferred cloud
   - Frontend: Build APK/IPA and deploy to app stores

---

## Documentation

- **Backend Release Notes**: `docs/releases/release-2026-03-26.md`
- **Implementation Plan**: `docs/plans/user-login-implementation-plan.md`
- **Project Overview**: `docs/plans/project-overview.md`
- **Frontend README**: `frontend/README.md`

---

## Support

For issues or questions:
1. Check the release notes and documentation
2. Review troubleshooting section
3. Check backend/frontend logs for errors

---

**Happy coding! 🚀**
