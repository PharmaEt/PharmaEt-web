import { apiFetch } from "./client";
import { type ApiUser } from "@/lib/types";

export interface LoginPayload {
  phone?: string;
  email?: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: ApiUser;
}

export interface ApiResponseData<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponseData> {
  return apiFetch<LoginResponseData>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface SelfProfileResponse {
  user: ApiUser;
}

export async function getSelfProfile(): Promise<SelfProfileResponse> {
  return apiFetch<SelfProfileResponse>("/auth/me");
}

export interface UpdateProfilePayload {
  name: string;
  email?: string;
  phone?: string;
  telegram_chat_id?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: ApiUser;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  return apiFetch<UpdateProfileResponse>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export async function updatePassword(payload: UpdatePasswordPayload): Promise<UpdatePasswordResponse> {
  return apiFetch<UpdatePasswordResponse>("/auth/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export interface ForgotPasswordPayload {
  phone?: string;
  email?: string;
}

export interface ForgotPasswordResponse {
  message: string;
  telegram_sent: boolean;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
  return apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface ResetPasswordPayload {
  phone?: string;
  email?: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
  return apiFetch<ResetPasswordResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutUser(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export async function testTelegram(telegram_chat_id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/test-telegram", {
    method: "POST",
    body: JSON.stringify({ telegram_chat_id }),
  });
}
