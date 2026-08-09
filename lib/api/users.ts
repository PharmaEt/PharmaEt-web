import { apiFetch } from "./client";
import { type ApiUser } from "@/lib/types";
export type { ApiUser };

export interface UserPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer";
  branch_id?: number | null;
  telegram_chat_id?: string | null;
  status?: "active" | "inactive";
}

export interface UsersListResponse {
  data: ApiUser[];
}

export interface SingleUserResponse {
  data: ApiUser;
  message?: string;
}

export async function getUsers(params?: { search?: string; role?: string; branch_id?: string | number; page?: number; per_page?: number }): Promise<UsersListResponse | any> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.role) query.append("role", params.role);
  if (params?.branch_id) query.append("branch_id", String(params.branch_id));
  if (params?.page) query.append("page", String(params.page));
  if (params?.per_page) query.append("per_page", String(params.per_page));

  const queryString = query.toString();
  return apiFetch<UsersListResponse | any>(`/users${queryString ? `?${queryString}` : ""}`);
}

export async function getUser(id: number | string): Promise<SingleUserResponse> {
  return apiFetch<SingleUserResponse>(`/users/${id}`);
}

export async function createUser(payload: UserPayload): Promise<SingleUserResponse> {
  return apiFetch<SingleUserResponse>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id: number | string, payload: Partial<UserPayload>): Promise<SingleUserResponse> {
  return apiFetch<SingleUserResponse>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: number | string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/users/${id}`, {
    method: "DELETE",
  });
}
