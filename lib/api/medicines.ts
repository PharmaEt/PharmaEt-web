import { apiFetch } from "./client";
import { type ApiProduct } from "@/lib/mock-data";

export interface MedicinePayload {
  name: string;
  category_id: number;
  generic_name?: string | null;
  dosage_form?: string | null;
  strength?: string | null;
  is_prescription_required?: boolean;
  branch_id?: number | null;
  pack_size?: number;
  min_stock_alert?: number;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  status?: "active" | "inactive";
}

export interface MedicinesListResponse {
  data: ApiProduct[];
}

export interface SingleMedicineResponse {
  data: ApiProduct;
  message?: string;
}

export async function getMedicines(params?: { search?: string; category_id?: string | number; branch_id?: string | number; is_prescription_required?: boolean; page?: number; per_page?: number }): Promise<MedicinesListResponse | any> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.category_id) query.append("category_id", String(params.category_id));
  if (params?.branch_id) query.append("branch_id", String(params.branch_id));
  if (params?.is_prescription_required !== undefined) query.append("is_prescription_required", String(params.is_prescription_required));
  if (params?.page) query.append("page", String(params.page));
  if (params?.per_page) query.append("per_page", String(params.per_page));

  const queryString = query.toString();
  return apiFetch<MedicinesListResponse | any>(`/medicines${queryString ? `?${queryString}` : ""}`);
}

export async function getMedicine(id: number | string): Promise<SingleMedicineResponse> {
  return apiFetch<SingleMedicineResponse>(`/medicines/${id}`);
}

export async function createMedicine(payload: MedicinePayload): Promise<SingleMedicineResponse> {
  return apiFetch<SingleMedicineResponse>("/medicines", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMedicine(id: number | string, payload: Partial<MedicinePayload>): Promise<SingleMedicineResponse> {
  return apiFetch<SingleMedicineResponse>(`/medicines/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMedicine(id: number | string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/medicines/${id}`, {
    method: "DELETE",
  });
}
