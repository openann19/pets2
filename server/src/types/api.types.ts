import { ApiResponse } from './express';

/**
 * Authentication request bodies
 */
export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

/**
 * 2FA setup request
 */
export interface I2FASetupRequest {
  method: 'sms' | 'email';
  phone?: string;
  email?: string;
}

/**
 * Reset password request
 */
export interface IResetPasswordRequest {
  email: string;
}

export interface IConfirmPasswordResetRequest {
  token: string;
  newPassword: string;
}

/**
 * Update password request
 */
export interface IUpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Typed API responses
 */
export type LoginResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
  user: unknown;
}>;

export type RegisterResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
  user: unknown;
}>;

export type ProfileResponse = ApiResponse<unknown>;

/**
 * Pagination query parameters
 */
export interface IPaginationQuery {
  page?: string;
  limit?: string;
}

export interface IParsedPagination {
  page: number;
  limit: number;
}

