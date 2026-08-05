import { apiFetch } from "./client";
import { type ApiSupplier } from "@/lib/mock-data";

export interface SupplierPayload {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contact_person?: string | null;
  telegram_chat_id?: string | null;
}

export interface SuppliersListResponse {
  data: ApiSupplier[];
}

export interface SingleSupplierResponse {
  data: ApiSupplier;
  message?: string;
}

export async function getSuppliers(params?: { search?: string; page?: number; per_page?: number }): Promise<SuppliersListResponse | any> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", String(params.page));
  if (params?.per_page) query.append("per_page", String(params.per_page));

  const queryString = query.toString();
  return apiFetch<SuppliersListResponse | any>(`/suppliers${queryString ? `?${queryString}` : ""}`);
}

export async function getSupplier(id: number | string): Promise<SingleSupplierResponse> {
  return apiFetch<SingleSupplierResponse>(`/suppliers/${id}`);
}

export async function createSupplier(payload: SupplierPayload): Promise<SingleSupplierResponse> {
  return apiFetch<SingleSupplierResponse>("/suppliers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSupplier(id: number | string, payload: Partial<SupplierPayload>): Promise<SingleSupplierResponse> {
  return apiFetch<SingleSupplierResponse>(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteSupplier(id: number | string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/suppliers/${id}`, {
    method: "DELETE",
  });
}
