import { apiFetch } from "./client";
import { type ApiCategory } from "@/lib/mock-data";

export interface CategoryPayload {
  name: string;
  type: "medicine" | "cosmetic";
  slug: string;
  description?: string | null;
  branch_id?: number | null;
  status?: "active" | "inactive";
}

export interface CategoriesListResponse {
  data: ApiCategory[];
}

export interface SingleCategoryResponse {
  data: ApiCategory;
  message?: string;
}

export async function getCategories(params?: { type?: string }): Promise<CategoriesListResponse> {
  const query = new URLSearchParams();
  if (params?.type) query.append("type", params.type);
  const queryString = query.toString();
  return apiFetch<CategoriesListResponse>(`/categories${queryString ? `?${queryString}` : ""}`);
}

export async function getCategory(id: number | string): Promise<SingleCategoryResponse> {
  return apiFetch<SingleCategoryResponse>(`/categories/${id}`);
}

export async function createCategory(payload: CategoryPayload): Promise<SingleCategoryResponse> {
  return apiFetch<SingleCategoryResponse>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(id: number | string, payload: Partial<CategoryPayload>): Promise<SingleCategoryResponse> {
  return apiFetch<SingleCategoryResponse>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: number | string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/categories/${id}`, {
    method: "DELETE",
  });
}
