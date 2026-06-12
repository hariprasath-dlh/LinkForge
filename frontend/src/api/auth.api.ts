/**
 * Auth API functions for OTP-based authentication flow.
 * Uses the apiFetch wrapper from axios.ts.
 */
import { API_BASE_URL } from "./axios";

interface AuthResponse {
  success: boolean;
  message: string;
  pendingVerification?: boolean;
  email?: string;
  token?: string;
  user?: { id: string; name: string; email: string };
}

async function authFetch<T = unknown>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data as T;
}

// Register user — returns pendingVerification, no token yet
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) => authFetch<AuthResponse>("/api/auth/register", data);

// Login user — returns pendingVerification, no token yet
export const loginUser = (data: { email: string; password: string }) =>
  authFetch<AuthResponse>("/api/auth/login", data);

// Verify OTP after signup — returns token + user
export const verifySignupOTP = (data: { email: string; otp: string }) =>
  authFetch<AuthResponse>("/api/auth/verify-signup-otp", data);

// Verify OTP after login — returns token + user
export const verifyLoginOTP = (data: { email: string; otp: string }) =>
  authFetch<AuthResponse>("/api/auth/verify-login-otp", data);

// Resend OTP
export const resendOTP = (data: { email: string; type: "signup" | "login" }) =>
  authFetch<AuthResponse>("/api/auth/resend-otp", data);
