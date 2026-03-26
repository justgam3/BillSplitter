import apiClient from './apiClient';
import { tokenService } from './tokenService';
import {
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  AuthenticationResult,
  LoginRequest,
  ResendVerificationRequest,
  ResendVerificationResponse,
  GetCurrentUserResponse,
} from '../../types/auth.types';

export const authService = {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<AuthenticationResult> {
    const response = await apiClient.post<AuthenticationResult>('/auth/verify-email', data);
    const result = response.data;

    // Save token and user data
    await tokenService.saveToken(result.token);
    await tokenService.saveUserData({
      email: result.email,
      userId: result.userId,
    });

    return result;
  },

  async resendVerification(data: ResendVerificationRequest): Promise<ResendVerificationResponse> {
    const response = await apiClient.post<ResendVerificationResponse>('/auth/resend-verification', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthenticationResult> {
    const response = await apiClient.post<AuthenticationResult>('/auth/login', data);
    const result = response.data;

    // Save token and user data
    await tokenService.saveToken(result.token);
    await tokenService.saveUserData({
      email: result.email,
      userId: result.userId,
    });

    return result;
  },

  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    const response = await apiClient.get<GetCurrentUserResponse>('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await tokenService.removeToken();
  },
};
