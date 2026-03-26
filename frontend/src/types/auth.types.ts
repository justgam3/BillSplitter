export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  message: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface AuthenticationResult {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface GetCurrentUserResponse {
  userId: string;
  email: string;
  isEmailVerified: boolean;
}

export interface ApiError {
  message: string;
}
