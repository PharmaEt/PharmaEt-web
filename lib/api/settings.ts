import { apiFetch } from "./client";

export interface ApiSettings {
  id?: number;
  branch_id?: number | null;
  expiry_alert_days: number;
  created_at?: string;
  updated_at?: string;
}

export async function getSettings(params?: { branch_id?: string | number }): Promise<{ data: ApiSettings }> {
  const query = new URLSearchParams();
  if (params?.branch_id) query.append("branch_id", String(params.branch_id));

  const queryString = query.toString();
  return apiFetch<{ data: ApiSettings }>(`/settings${queryString ? `?${queryString}` : ""}`);
}

export async function updateSettings(payload: { expiry_alert_days: number; branch_id?: number | null }): Promise<{ message: string; data: ApiSettings }> {
  return apiFetch<{ message: string; data: ApiSettings }>("/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
