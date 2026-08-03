import { apiFetch } from "./client";
import { type ApiBranch } from "@/lib/mock-data";

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

export async function getBranches(): Promise<BranchesListResponse> {
  return apiFetch<BranchesListResponse>("/branches");
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
