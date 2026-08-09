import { apiFetch } from "./client";
import { type ApiProduct } from "@/lib/types";

export interface ProductsResponse {
  data: ApiProduct[] | { data: ApiProduct[]; total?: number; current_page?: number };
}

export async function getProducts(params?: {
  search?: string;
  type?: "medicine" | "cosmetic";
  category_id?: string | number;
  branch_id?: string | number;
  all?: boolean;
}): Promise<ProductsResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.type) query.append("type", params.type);
  if (params?.category_id) query.append("category_id", String(params.category_id));
  if (params?.branch_id) query.append("branch_id", String(params.branch_id));
  if (params?.all) query.append("all", "1");

  const queryString = query.toString();
  return apiFetch<ProductsResponse>(`/products${queryString ? `?${queryString}` : ""}`);
}

export async function getProduct(id: number | string): Promise<{ data: ApiProduct }> {
  return apiFetch<{ data: ApiProduct }>(`/products/${id}`);
}
