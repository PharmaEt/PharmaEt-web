import { apiFetch } from "./client";
import { type ApiProduct } from "@/lib/types";

export interface CosmeticPayload {
  name: string;
  category_id: number;
  product_type?: string | null;
  size?: string | null;
  unit?: string | null;
  color?: string | null;
  shade?: string | null;
  ingredients?: string | null;
  branch_id?: number | null;
  pack_size?: number;
  min_stock_alert?: number;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  status?: "active" | "inactive";
}

export interface CosmeticsListResponse {
  data: ApiProduct[];
}

export interface SingleCosmeticResponse {
  data: ApiProduct;
  message?: string;
}

export async function getCosmetics(params?: { search?: string; category_id?: string | number; branch_id?: string | number; product_type?: string; page?: number; per_page?: number }): Promise<CosmeticsListResponse | any> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.category_id) query.append("category_id", String(params.category_id));
  if (params?.branch_id) query.append("branch_id", String(params.branch_id));
  if (params?.product_type) query.append("product_type", params.product_type);
  if (params?.page) query.append("page", String(params.page));
  if (params?.per_page) query.append("per_page", String(params.per_page));

  const queryString = query.toString();
  return apiFetch<CosmeticsListResponse | any>(`/cosmetics${queryString ? `?${queryString}` : ""}`);
}

export async function getCosmetic(id: number | string): Promise<SingleCosmeticResponse> {
  return apiFetch<SingleCosmeticResponse>(`/cosmetics/${id}`);
}

export async function createCosmetic(payload: CosmeticPayload): Promise<SingleCosmeticResponse> {
  return apiFetch<SingleCosmeticResponse>("/cosmetics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCosmetic(id: number | string, payload: Partial<CosmeticPayload>): Promise<SingleCosmeticResponse> {
  return apiFetch<SingleCosmeticResponse>(`/cosmetics/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCosmetic(id: number | string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/cosmetics/${id}`, {
    method: "DELETE",
  });
}
