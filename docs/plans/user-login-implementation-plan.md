# User Login Feature - Implementation Plan

## Overview
This document outlines the implementation plan for the user authentication system in BillSplitter, including email/password signup, email verification, and login functionality.

---

## 🎯 Feature Requirements

### Core Functionality
- User signup with email and password
- Email verification via verification code (15-minute expiry)
- User login with email and password
- JWT-based authentication
- Display user email on main page after successful login
- Resend verification code with 30-second cooldown

### Technical Requirements
- Backend: .NET 10 with Clean Architecture
- Database: PostgreSQL (with database provider abstraction)
- Email Provider: Resend
- Authentication: JWT tokens
- Frontend: React Native with Material Design
- Password Policy: Strength indicator (only Medium/High allowed)

### Future Extensibility
- Architecture must support SSO integration (OAuth providers) in the future
- Database provider should be swappable

---

## 📐 Architecture Design

### Backend Architecture

```
BillSplitter.API
  └── Controllers/
      └── AuthController.cs

BillSplitter.Application
  ├── Auth/
  │   ├── Commands/
  │   │   ├── RegisterUser/
  │   │   │   ├── RegisterUserCommand.cs
  │   │   │   ├── RegisterUserCommandHandler.cs
  │   │   │   └── RegisterUserCommandValidator.cs
  │   │   ├── VerifyEmail/
  │   │   │   ├── VerifyEmailCommand.cs
  │   │   │   ├── VerifyEmailCommandHandler.cs
  │   │   │   └── VerifyEmailCommandValidator.cs
  │   │   ├── ResendVerificationCode/
  │   │   │   ├── ResendVerificationCodeCommand.cs
  │   │   │   └── ResendVerificationCodeCommandHandler.cs
  │   │   └── Login/
  │   │       ├── LoginCommand.cs
  │   │       ├── LoginCommandHandler.cs
  │   │       └── LoginCommandValidator.cs
  │   └── Queries/
  │       └── GetCurrentUser/
  │           ├── GetCurrentUserQuery.cs
  │           └── GetCurrentUserQueryHandler.cs
  ├── Common/
  │   ├── Interfaces/
  │   │   ├── IEmailService.cs
  │   │   ├── IJwtTokenGenerator.cs
  │   │   ├── IPasswordHasher.cs
  │   │   └── IDateTimeProvider.cs
  │   └── Models/
  │       └── AuthenticationResult.cs

BillSplitter.Domain
  ├── Entities/
  │   ├── User.cs
  │   └── EmailVerification.cs
  └── Common/
      └── BaseEntity.cs

BillSplitter.Infrastructure
  ├── Authentication/
  │   ├── JwtTokenGenerator.cs
  │   └── PasswordHasher.cs
  ├── Email/
  │   └── ResendEmailService.cs
  ├── Persistence/
  │   ├── BillSplitterDbContext.cs
  │   ├── Configurations/
  │   │   ├── UserConfiguration.cs
  │   │   └── EmailVerificationConfiguration.cs
  │   └── Repositories/
  │       └── (if needed)
  └── Services/
      └── DateTimeProvider.cs
```

### Database Provider Abstraction Strategy
- Use Entity Framework Core with provider-agnostic code
- Configuration-based provider selection
- Repository pattern (if needed for complex queries)
- Keep all EF Core code in Infrastructure layer

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### Email Verifications Table
```sql
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    last_resent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_email_verifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_code ON email_verifications(verification_code);
```

### Entity Definitions (C#)

**User.cs**
```csharp
public class User : BaseEntity
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public bool IsEmailVerified { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // Navigation properties
    public ICollection<EmailVerification> EmailVerifications { get; private set; } = new List<EmailVerification>();

    // Factory method
    public static User Create(string email, string passwordHash)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = passwordHash,
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void VerifyEmail()
    {
        IsEmailVerified = true;
        UpdatedAt = DateTime.UtcNow;
    }
}
```

**EmailVerification.cs**
```csharp
public class EmailVerification : BaseEntity
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string VerificationCode { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public bool IsUsed { get; private set; }
    public DateTime? LastResentAt { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;

    public static EmailVerification Create(Guid userId, string code, DateTime expiresAt)
    {
        return new EmailVerification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            VerificationCode = code,
            ExpiresAt = expiresAt,
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    public bool IsExpired(DateTime currentTime) => currentTime > ExpiresAt;

    public bool CanResend(DateTime currentTime, int cooldownSeconds = 30)
    {
        if (LastResentAt == null) return true;
        return (currentTime - LastResentAt.Value).TotalSeconds >= cooldownSeconds;
    }

    public void MarkAsResent(DateTime currentTime)
    {
        LastResentAt = currentTime;
    }

    public void MarkAsUsed()
    {
        IsUsed = true;
    }
}
```

---

## 🔌 API Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "message": "Registration successful. Please check your email for verification code."
}
```

**Error Responses:**
- 400: Weak password or invalid email
- 409: Email already exists

---

### 2. Verify Email
**POST** `/api/auth/verify-email`

**Request Body:**
```json
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "expiresAt": "2026-03-27T10:30:00Z"
}
```

**Error Responses:**
- 400: Invalid or expired code
- 404: User not found

---

### 3. Resend Verification Code
**POST** `/api/auth/resend-verification`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Verification code resent successfully."
}
```

**Error Responses:**
- 400: User already verified
- 429: Cooldown period active (must wait 30 seconds)
- 404: User not found

---

### 4. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "expiresAt": "2026-03-27T10:30:00Z"
}
```

**Error Responses:**
- 401: Invalid credentials
- 403: Email not verified

---

### 5. Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "isEmailVerified": true
}
```

**Error Responses:**
- 401: Unauthorized (invalid or expired token)

---

## 🔒 Security Specifications

### Password Policy
**Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Strength Levels:**
- **Low**: Meets minimum requirements only
- **Medium**: 8-11 characters with all requirements + no common patterns
- **High**: 12+ characters with all requirements + high entropy

**Validation:** Only Medium and High strength passwords are accepted.

### Password Hashing
- Use BCrypt with work factor of 12
- Implemented via `BCrypt.Net-Next` package

### JWT Token Configuration
```json
{
  "Jwt": {
    "Secret": "{generated-secret-key}",
    "Issuer": "BillSplitter",
    "Audience": "BillSplitter-Mobile",
    "ExpiryMinutes": 1440
  }
}
```

**Token Claims:**
- `sub`: User ID (Guid)
- `email`: User email
- `jti`: Token ID (for future revocation support)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

### Verification Code Generation
- 6-digit numeric code
- Cryptographically secure random generation
- 15-minute expiration
- One active code per user (invalidate old codes on new generation)

---

## 📱 Frontend Design

### Screen Flow
```
1. Welcome Screen (Entry Point)
   ├─→ Sign Up Screen
   │   └─→ Email Verification Screen
   │       └─→ Main Screen (Success)
   └─→ Login Screen
       └─→ Main Screen (Success)
```

### Screens & Components

#### 1. Welcome Screen
**Purpose:** Entry point with branding

**Components:**
- App logo and name
- Tagline: "Split bills, share fairly"
- Two action buttons:
  - "Sign Up" (Primary button - filled)
  - "Log In" (Secondary button - outlined)

**Material Design Elements:**
- Card elevation for button container
- Material 3 color scheme
- Smooth transitions

---

#### 2. Sign Up Screen
**Purpose:** User registration

**Components:**
- Header: "Create Account"
- Email input field
  - Material TextField
  - Email validation indicator
  - Helper text for errors
- Password input field
  - Material TextField with show/hide toggle
  - Password strength indicator (progress bar)
  - Real-time strength feedback
  - Helper text: Requirements list
- "Create Account" button (disabled until valid)
- "Already have an account? Log in" link

**Validation:**
- Email: Valid format, not already registered
- Password: Real-time strength calculation
- Show inline errors below fields

**Material Design Elements:**
- Floating labels
- Error states with red color
- Success states with green indicators
- Linear progress indicator for password strength
- Touch ripple effects

---

#### 3. Email Verification Screen
**Purpose:** Verify email with code

**Components:**
- Header: "Verify Your Email"
- Subtitle: "We sent a code to {email}"
- 6-digit code input (6 individual boxes)
  - Auto-focus next box on digit entry
  - Auto-submit on complete
- Timer display: "Code expires in 14:30"
- "Resend Code" button
  - Disabled with countdown: "Resend in 28s"
  - Enabled after cooldown
- "Verify" button
- "Change email" link (go back)

**States:**
- Loading (during verification)
- Error (invalid code with shake animation)
- Success (checkmark animation)

**Material Design Elements:**
- Material TextFields for code boxes
- Chip for timer display
- Snackbar for resend confirmation
- Progress indicator during verification
- Success animation with Material icons

---

#### 4. Login Screen
**Purpose:** User authentication

**Components:**
- Header: "Welcome Back"
- Email input field
- Password input field (with show/hide toggle)
- "Log In" button
- "Don't have an account? Sign up" link
- (Future: SSO buttons placeholder)

**Error Handling:**
- Invalid credentials message
- Email not verified message with "Resend" option

**Material Design Elements:**
- Consistent with Sign Up screen
- Error states
- Loading state on button

---

#### 5. Main Screen (Post-Login)
**Purpose:** Landing page after successful authentication

**Components:**
- App bar with:
  - App name/logo
  - User menu icon
- Welcome message: "Welcome, {email}"
- Empty state illustration
- Message: "Your expense groups will appear here"
- Floating Action Button (FAB) - "Add Expense" (disabled/placeholder)

**Material Design Elements:**
- Material 3 App Bar
- FAB with Material elevation
- Empty state illustration
- User menu (for future logout)

---

### UI/UX Specifications

**Color Scheme (Material Design 3):**

| Role             | Color                     | Notes                                                         |
| ---------------- | ------------------------- | ------------------------------------------------------------- |
| **Primary**      | Dark Grey (#212121)       | Main accent for buttons, app bars, and important UI elements. |
| **Secondary**    | Light Grey (#BDBDBD)      | Subtle accent for secondary buttons, icons, and labels.       |
| **Error**        | Red (#D32F2F)             | Stands out on monochrome backgrounds; standard error color.   |
| **Surface**      | White (#FFFFFF)           | Default surface for cards, dialogs, sheets in light mode.     |
| **Background**   | Very Light Grey (#F5F5F5) | Keeps content readable and separates surface layers.          |
| **On Primary**   | White (#FFFFFF)           | Text/icons on dark primary areas.                             |
| **On Secondary** | Black (#000000)           | Text/icons on secondary light grey elements.                  |

**Typography:**
- Font Family: Roboto
- Headlines: Roboto Medium, 24sp
- Body: Roboto Regular, 16sp
- Captions: Roboto Regular, 12sp

**Spacing:**
- Consistent 8dp grid
- Input field margins: 16dp
- Button padding: 16dp vertical, 32dp horizontal

**Animations:**
- Screen transitions: 300ms
- Button states: 150ms
- Error shake: 400ms
- Success checkmark: 500ms

---

## 🔄 User Flows

### Registration Flow
```
User opens app
  → Welcome Screen
  → Taps "Sign Up"
  → Enters email
  → Enters password (sees strength indicator)
  → If password weak: Shows error, can't proceed
  → If password medium/high: Taps "Create Account"
  → API call to register
  → If email exists: Shows error
  → If success: Navigate to Email Verification Screen
  → Email sent with code
  → User enters 6-digit code
  → If wrong: Shows error, try again
  → If expired: Shows message, option to resend
  → If correct: API returns JWT token
  → Token stored securely
  → Navigate to Main Screen
  → Shows user email
```

### Login Flow
```
User opens app (or logged out)
  → Welcome Screen
  → Taps "Log In"
  → Enters email and password
  → Taps "Log In"
  → API call to login
  → If credentials wrong: Shows error
  → If email not verified: Shows error + "Resend verification" button
  → If success: API returns JWT token
  → Token stored securely
  → Navigate to Main Screen
  → Shows user email
```

### Resend Code Flow
```
User on Email Verification Screen
  → Code expired or not received
  → Taps "Resend Code"
  → If within 30s cooldown: Button disabled with countdown
  → If cooldown passed: API call to resend
  → New code generated and sent
  → Shows success message (Snackbar)
  → Timer resets to 15 minutes
```

---

## 🛠️ Implementation Plan

### Phase 1: Backend Implementation

#### Step 1: Project Setup & Structure
**Tasks:**
1. Create solution with Clean Architecture structure
   ```
   BillSplitter.sln
   ├── src/
   │   ├── BillSplitter.API/
   │   ├── BillSplitter.Application/
   │   ├── BillSplitter.Domain/
   │   └── BillSplitter.Infrastructure/
   └── tests/
       ├── BillSplitter.Application.Tests/
       └── BillSplitter.Infrastructure.Tests/
   ```

2. Install NuGet packages:
   - **API**: `Microsoft.AspNetCore.Authentication.JwtBearer`
   - **Application**: `MediatR`, `FluentValidation`, `FluentValidation.DependencyInjection`
   - **Infrastructure**:
     - `Npgsql.EntityFrameworkCore.PostgreSQL`
     - `BCrypt.Net-Next`
     - `System.IdentityModel.Tokens.Jwt`
   - **Testing**: `xUnit`, `FluentAssertions`, `Moq`

3. Setup dependency injection in each project
4. Configure connection strings and settings

**Deliverable:** Working project structure with dependencies

---

#### Step 2: Domain Layer
**Tasks:**
1. Create `BaseEntity.cs`
2. Create `User.cs` entity with factory methods
3. Create `EmailVerification.cs` entity with business logic
4. Add domain validation rules

**Deliverable:** Complete domain entities with business logic

---

#### Step 3: Application Layer - Interfaces
**Tasks:**
1. Create `IEmailService.cs` interface
2. Create `IJwtTokenGenerator.cs` interface
3. Create `IPasswordHasher.cs` interface
4. Create `IDateTimeProvider.cs` interface
5. Create `AuthenticationResult.cs` model
6. Create common DTOs

**Deliverable:** All service interfaces and common models

---

#### Step 4: Infrastructure Layer - Database
**Tasks:**
1. Create `BillSplitterDbContext.cs`
2. Create entity configurations:
   - `UserConfiguration.cs`
   - `EmailVerificationConfiguration.cs`
3. Create initial migration
4. Setup database connection
5. Test connection and migration

**Deliverable:** Working database with tables created

---

#### Step 5: Infrastructure Layer - Services
**Tasks:**
1. Implement `PasswordHasher.cs` using BCrypt
2. Implement `JwtTokenGenerator.cs`
3. Implement `DateTimeProvider.cs`
4. Implement `ResendEmailService.cs`
5. Configure services in DI container

**Testing:**
- Unit test password hashing and verification
- Unit test JWT token generation and validation
- Test email service with Resend API

**Deliverable:** All infrastructure services implemented and tested

---

#### Step 6: Application Layer - Commands & Handlers
**Tasks:**
1. Implement `RegisterUserCommand` with handler and validator
   - Check email uniqueness
   - Validate password strength
   - Hash password
   - Create user
   - Generate verification code
   - Send email
2. Implement `VerifyEmailCommand` with handler and validator
   - Validate code
   - Check expiration
   - Mark as verified
   - Generate JWT token
3. Implement `ResendVerificationCodeCommand` with handler
   - Check cooldown
   - Generate new code
   - Send email
4. Implement `LoginCommand` with handler and validator
   - Verify credentials
   - Check email verified
   - Generate JWT token
5. Implement `GetCurrentUserQuery` with handler

**Testing:**
- Unit test each handler with mocked dependencies
- Test validation rules
- Test error scenarios

**Deliverable:** All CQRS commands/queries implemented with tests

---

#### Step 7: API Layer - Controllers
**Tasks:**
1. Create `AuthController.cs`
2. Implement all endpoints:
   - `POST /api/auth/register`
   - `POST /api/auth/verify-email`
   - `POST /api/auth/resend-verification`
   - `POST /api/auth/login`
   - `GET /api/auth/me` (with [Authorize] attribute)
3. Configure JWT authentication middleware
4. Add error handling middleware
5. Configure CORS for mobile app

**Testing:**
- Integration tests for each endpoint
- Test authentication flow end-to-end
- Test error responses

**Deliverable:** Complete API with authentication working

---

#### Step 8: Configuration & Documentation
**Tasks:**
1. Setup `appsettings.json` and `appsettings.Development.json`
2. Configure Resend API key
3. Configure JWT settings
4. Create API documentation (Swagger)
5. Create README for backend setup
6. Document environment variables

**Deliverable:** Configured backend ready for deployment

---

### Phase 2: Frontend Implementation

#### Step 9: Project Setup
**Tasks:**
1. Initialize React Native project with TypeScript
2. Setup folder structure:
   ```
   src/
   ├── components/
   │   ├── common/
   │   └── auth/
   ├── screens/
   │   └── auth/
   ├── navigation/
   ├── services/
   │   └── api/
   ├── hooks/
   ├── utils/
   ├── types/
   └── theme/
   ```
3. Install dependencies:
   - `@react-navigation/native` and stack navigator
   - `react-native-paper` (Material Design)
   - `axios` (API calls)
   - `@react-native-async-storage/async-storage` (token storage)
   - `react-hook-form` (form management)
   - `zod` (validation)
4. Configure Material Design theme

**Deliverable:** Working React Native project with navigation

---

#### Step 10: API Service Layer
**Tasks:**
1. Create `apiClient.ts` with axios configuration
2. Create `authService.ts` with methods:
   - `register(email, password)`
   - `verifyEmail(email, code)`
   - `resendVerification(email)`
   - `login(email, password)`
   - `getCurrentUser()`
3. Create `tokenService.ts` for token management:
   - `saveToken(token)`
   - `getToken()`
   - `removeToken()`
4. Setup axios interceptors for token injection

**Testing:**
- Test API calls with backend
- Test token storage

**Deliverable:** Complete API service layer

---

#### Step 11: Shared Components
**Tasks:**
1. Create `PasswordStrengthIndicator.tsx`
   - Visual progress bar
   - Strength text (Low/Medium/High)
   - Color coding
2. Create `PasswordInput.tsx`
   - Show/hide toggle
   - Strength indicator integration
3. Create `CodeInput.tsx`
   - 6 individual boxes
   - Auto-focus logic
   - Auto-submit on complete
4. Create `LoadingButton.tsx`
   - Material button with loading state

**Deliverable:** Reusable form components

---

#### Step 12: Password Validation Logic
**Tasks:**
1. Create `passwordValidator.ts` utility
2. Implement strength calculation algorithm:
   - Check length
   - Check character types
   - Check for common patterns
   - Calculate entropy
3. Return strength level (low/medium/high)
4. Create validation schema with Zod

**Testing:**
- Test various password combinations
- Verify strength levels are correct

**Deliverable:** Password validation utility with strength calculator

---

#### Step 13: Welcome Screen
**Tasks:**
1. Create `WelcomeScreen.tsx`
2. Design with Material components
3. Add branding elements
4. Implement navigation to Sign Up and Login
5. Add animations for screen entry

**Deliverable:** Polished Welcome Screen

---

#### Step 14: Sign Up Screen
**Tasks:**
1. Create `SignUpScreen.tsx`
2. Implement form with react-hook-form:
   - Email field with validation
   - Password field with strength indicator
   - Real-time validation feedback
3. Integrate with API service
4. Handle errors and success
5. Navigate to Email Verification on success
6. Add loading states

**Testing:**
- Test form validation
- Test API integration
- Test error handling
- Test navigation

**Deliverable:** Complete Sign Up Screen with validation

---

#### Step 15: Email Verification Screen
**Tasks:**
1. Create `EmailVerificationScreen.tsx`
2. Implement 6-digit code input
3. Add countdown timer (15 minutes)
4. Implement resend logic with cooldown
5. Integrate with API service
6. Handle verification success (save token, navigate)
7. Add animations for success/error states

**Testing:**
- Test code input behavior
- Test timer countdown
- Test resend cooldown
- Test verification flow

**Deliverable:** Complete Email Verification Screen

---

#### Step 16: Login Screen
**Tasks:**
1. Create `LoginScreen.tsx`
2. Implement form:
   - Email field
   - Password field
3. Integrate with API service
4. Handle errors:
   - Invalid credentials
   - Email not verified (with resend option)
5. Navigate to Main Screen on success
6. Add loading states

**Testing:**
- Test login flow
- Test error handling
- Test navigation

**Deliverable:** Complete Login Screen

---

#### Step 17: Main Screen
**Tasks:**
1. Create `MainScreen.tsx`
2. Implement Material App Bar
3. Display user email (from token or API)
4. Add empty state placeholder
5. Add placeholder FAB
6. Implement logout (for testing)

**Testing:**
- Test token retrieval
- Test user data display
- Test logout

**Deliverable:** Main Screen displaying user info

---

#### Step 18: Navigation & Auth Flow
**Tasks:**
1. Setup navigation structure:
   - Auth Stack (Welcome, SignUp, Login, Verification)
   - App Stack (Main, future screens)
2. Implement auth state management
3. Add authentication check on app launch
4. Redirect logic based on token presence
5. Add screen transitions

**Testing:**
- Test navigation flow
- Test auth persistence
- Test app restart behavior

**Deliverable:** Complete navigation with auth flow

---

#### Step 19: Polish & Testing
**Tasks:**
1. Add screen loading states
2. Implement error boundaries
3. Add haptic feedback for interactions
4. Optimize performance
5. Test on iOS and Android
6. Fix UI inconsistencies
7. Ensure Material Design compliance
8. Add accessibility features

**Testing:**
- End-to-end testing of complete flow
- Test on different screen sizes
- Test keyboard handling
- Test edge cases

**Deliverable:** Polished, production-ready UI

---

#### Step 20: Documentation & Deployment
**Tasks:**
1. Create README for mobile app
2. Document setup instructions
3. Document API configuration
4. Create user flow documentation
5. Prepare for deployment (if needed)

**Deliverable:** Complete documentation

---

## ✅ Testing Strategy

### Backend Testing
**Unit Tests:**
- Domain entity logic
- Command/query handlers
- Validators
- Services (password hashing, JWT generation)

**Integration Tests:**
- API endpoints
- Database operations
- Email service integration
- End-to-end authentication flow

**Test Coverage Target:** 80%+

### Frontend Testing
**Component Tests:**
- Form validation logic
- Password strength calculator
- Code input behavior

**Integration Tests:**
- API service calls
- Navigation flow
- Token management

**Manual Testing:**
- UI/UX on both iOS and Android
- Different screen sizes
- Edge cases

---

## 🚀 Future Extensibility Considerations

### SSO Integration Support
**Architecture Design:**
1. Abstract authentication in Application layer
2. Create `IAuthenticationProvider` interface:
   ```csharp
   public interface IAuthenticationProvider
   {
       Task<AuthenticationResult> AuthenticateAsync(AuthenticationRequest request);
       string ProviderName { get; }
   }
   ```
3. Implement providers:
   - `EmailPasswordAuthProvider` (current)
   - `GoogleAuthProvider` (future)
   - `AppleAuthProvider` (future)
   - `FacebookAuthProvider` (future)

**Database Schema:**
- Add `auth_provider` field to users table (default: "email")
- Add `external_provider_id` field (nullable)
- Keep password_hash nullable for SSO users

**API Changes:**
- Modify registration/login to accept provider type
- Add SSO callback endpoints

**Frontend Changes:**
- Add SSO buttons to Welcome/Login screens
- Implement OAuth flow for each provider
- Maintain existing email/password flow

### Database Provider Flexibility
**Current Design:**
- Use EF Core abstractions (IQueryable, DbContext)
- Avoid PostgreSQL-specific features in business logic
- Keep all database code in Infrastructure layer

**To Switch Providers:**
1. Change NuGet package (e.g., `Microsoft.EntityFrameworkCore.SqlServer`)
2. Update connection string
3. Generate new migrations
4. No changes needed in Application or Domain layers

---

## 📋 Definition of Done

### Phase 1 (Backend) Complete When:
- [ ] All API endpoints implemented and tested
- [ ] Database schema created and migrated
- [ ] JWT authentication working
- [ ] Email verification flow functional
- [ ] Resend integration working
- [ ] All unit tests passing (80%+ coverage)
- [ ] Integration tests passing
- [ ] API documented with Swagger
- [ ] Code reviewed and meets standards

### Phase 2 (Frontend) Complete When:
- [ ] All screens implemented with Material Design
- [ ] Navigation flow working correctly
- [ ] API integration complete
- [ ] Token management working
- [ ] Password strength validation implemented
- [ ] Email verification flow functional
- [ ] Resend cooldown working
- [ ] App tested on iOS and Android
- [ ] No console errors or warnings
- [ ] Performance optimized
- [ ] Code reviewed and meets standards

### Overall Feature Complete When:
- [ ] User can register with email/password
- [ ] User receives verification email
- [ ] User can verify email with code
- [ ] User can resend verification code (with cooldown)
- [ ] User can login after verification
- [ ] JWT token is stored and used for authentication
- [ ] User sees their email on main screen
- [ ] All error cases handled gracefully
- [ ] UI is polished and consumer-grade
- [ ] Architecture supports future SSO integration
- [ ] Documentation complete

---

## 📚 Technical References

### Backend
- [.NET Clean Architecture](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
- [MediatR Documentation](https://github.com/jbogard/MediatR)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [JWT Authentication in .NET](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
- [Resend API Documentation](https://resend.com/docs)

### Frontend
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Material Design 3](https://m3.material.io/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [React Hook Form](https://react-hook-form.com/)

---

## 🎯 Success Metrics

### Functional Metrics
- User can complete registration in < 2 minutes
- Email verification code arrives within 30 seconds
- Login response time < 1 second
- Zero authentication bypass vulnerabilities

### Technical Metrics
- API response time < 200ms (95th percentile)
- Test coverage > 80%
- Zero critical security issues
- Code follows Clean Architecture principles

### UX Metrics
- UI follows Material Design guidelines
- Smooth animations (60 FPS)
- Clear error messages
- Intuitive user flow

---

*This implementation plan provides a comprehensive roadmap for building the user authentication feature. Follow the phases sequentially, and refer back to this document for architectural decisions and specifications.*
