import { apiFetch } from "./client";

export interface ApiSettings {
  id?: number;
  branch_id?: number | null;
  expiry_alert_days: number;
  telegram_bot_token?: string;
  telegram_bot_username?: string;
  created_at?: string;
  updated_at?: string;
}

function getResolvedBranchId(providedId?: string | number | null): number {
  if (providedId !== undefined && providedId !== null) {
    const parsed = Number(providedId);
    if (!isNaN(parsed)) return parsed;
  }

  if (typeof window !== "undefined") {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user && typeof user.branch_id === "number") {
          return user.branch_id;
        }
      }
    } catch {
      // ignore JSON parse or localStorage errors
    }
  }
  return 1;
}

export async function getSettings(params?: { branch_id?: string | number }): Promise<{ data: ApiSettings }> {
  const resolvedBranchId = getResolvedBranchId(params?.branch_id);
  const query = new URLSearchParams();
  query.append("branch_id", String(resolvedBranchId));

  return apiFetch<{ data: ApiSettings }>(`/settings?${query.toString()}`);
}

export async function updateSettings(
  payload: { expiry_alert_days: number; branch_id?: number | null; telegram_bot_token?: string; telegram_bot_username?: string },
  params?: { branch_id?: string | number }
): Promise<{ message: string; data: ApiSettings }> {
  const resolvedBranchId = getResolvedBranchId(params?.branch_id ?? payload.branch_id);
  const query = new URLSearchParams();
  query.append("branch_id", String(resolvedBranchId));

  const updatedPayload = {
    ...payload,
    branch_id: resolvedBranchId,
  };

  return apiFetch<{ message: string; data: ApiSettings }>(`/settings?${query.toString()}`, {
    method: "PUT",
    body: JSON.stringify(updatedPayload),
  });
}
