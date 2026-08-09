import { apiFetch } from "./client";
import { type ApiBranch } from "@/lib/types";

export interface BranchPayload {
  name: string;
  location?: string | null;
  founded_year?: number | null;
  manager_id?: number | null;
  phone?: string | null;
}

export interface BranchesListResponse {
  data: ApiBranch[];
}

export interface SingleBranchResponse {
  data: ApiBranch;
  message?: string;
}

export async function getBranches(params?: { search?: string; page?: number; per_page?: number }): Promise<BranchesListResponse | any> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", String(params.page));
  if (params?.per_page) query.append("per_page", String(params.per_page));

  const queryString = query.toString();
  return apiFetch<BranchesListResponse | any>(`/branches${queryString ? `?${queryString}` : ""}`);
}

export async function getBranch(id: number | string): Promise<SingleBranchResponse> {
  return apiFetch<SingleBranchResponse>(`/branches/${id}`);
}

export async function createBranch(payload: BranchPayload): Promise<SingleBranchResponse> {
  return apiFetch<SingleBranchResponse>("/branches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateBranch(id: number | string, payload: BranchPayload): Promise<SingleBranchResponse> {
  return apiFetch<SingleBranchResponse>(`/branches/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteBranch(id: number | string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/branches/${id}`, {
    method: "DELETE",
  });
}
