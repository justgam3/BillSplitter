# BillSplitter Mobile App

React Native mobile application for BillSplitter, built with Expo and Material Design.

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Native Paper** for Material Design components
- **Axios** for API calls
- **React Hook Form** for form management
- **Zod** for validation
- **AsyncStorage** for local storage

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- OR Android Studio/Xcode for emulator

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL:**
   - Open `src/config/api.config.ts`
   - Update `API_BASE_URL` based on your environment:
     - **Android Emulator**: `http://10.0.2.2:5001/api`
     - **iOS Simulator**: `http://localhost:5001/api`
     - **Physical Device**: `http://YOUR_COMPUTER_IP:5001/api`

3. **Ensure backend is running:**
   - The backend API must be running on the configured URL
   - See backend README for setup instructions

## Running the App

### Start Development Server

```bash
npm start
```

This will start the Expo development server and show a QR code.

### Run on Android

```bash
npm run android
```

### Run on iOS (macOS only)

```bash
npm run ios
```

### Run on Web (for testing)

```bash
npm run web
```

### Run on Physical Device

1. Install the **Expo Go** app on your device
2. Scan the QR code shown in the terminal
3. Make sure your device is on the same network as your computer

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── CodeInput.tsx
│   │   ├── LoadingButton.tsx
│   │   ├── PasswordInput.tsx
│   │   └── PasswordStrengthIndicator.tsx
│   └── auth/            # Auth-specific components
├── screens/
│   ├── auth/            # Authentication screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── EmailVerificationScreen.tsx
│   └── MainScreen.tsx   # Main app screen
├── navigation/
│   └── types.ts         # Navigation type definitions
├── services/
│   └── api/
│       ├── apiClient.ts      # Axios configuration
│       ├── authService.ts    # Auth API calls
│       └── tokenService.ts   # Token management
├── utils/
│   └── passwordValidator.ts  # Password strength validation
├── types/
│   └── auth.types.ts         # Type definitions
├── theme/
│   └── theme.ts              # Material Design theme
└── config/
    └── api.config.ts         # API configuration
```

## Features Implemented

### Authentication Flow

1. **Welcome Screen** - Entry point with Sign Up/Login buttons
2. **Sign Up** - User registration with:
   - Email validation
   - Password strength indicator
   - Real-time validation
3. **Email Verification** - 6-digit code input with:
   - 15-minute expiration timer
   - Resend functionality (30-second cooldown)
   - Auto-submit on completion
4. **Login** - User authentication with:
   - Email/password fields
   - Error handling
   - Resend verification option
5. **Main Screen** - Post-login landing page

### UI/UX Features

- Material Design 3 theme with monochrome color scheme
- Password strength indicator (Low/Medium/High)
- Real-time form validation
- Loading states on buttons
- Error snackbars
- Smooth navigation transitions

## API Integration

The app communicates with the BillSplitter backend API:

- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification code
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (authenticated)

JWT tokens are stored in AsyncStorage and automatically included in API requests.

## Development Notes

### Android HTTPS Issues

If using HTTPS with self-signed certificates in development, you may need to add network security configuration for Android.

### iOS Network Configuration

For iOS, ensure your computer's firewall allows incoming connections from the iOS simulator/device.

### Hot Reload

Expo supports hot reload. Changes to your code will automatically refresh the app.

## Testing

To test the complete flow:

1. Start the backend API
2. Start the Expo dev server
3. Open the app on your device/emulator
4. Test the registration flow:
   - Register with a valid email
   - Check for verification email (if Resend is configured in backend)
   - Enter the 6-digit code
   - Login with credentials

## Troubleshooting

### Cannot connect to backend

- Check that `API_BASE_URL` is correctly configured
- Ensure backend is running
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, ensure both device and computer are on same network

### Verification email not received

- Check backend configuration for Resend API key
- Check backend logs for email sending errors
- For development, you can check the backend console for the verification code

### App crashes on launch

- Clear Expo cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Next Steps

- Add password reset functionality
- Implement refresh tokens
- Add biometric authentication
- Implement expense management features
- Add group management
- Add push notifications

## License

Private - BillSplitter Project
