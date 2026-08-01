/**
 * Shift Management API Client
 * Endpoints for managing cashier register shifts and cash drawer reconciliations.
 */

export interface OpenShiftPayload {
  opening_balance: number;
  notes?: string;
}

export interface CloseShiftPayload {
  actual_cash: number;
  notes?: string;
}

export interface ApiShift {
  id: number;
  user_id: number;
  branch_id: number;
  opening_balance: number;
  expected_cash?: number | null;
  actual_cash?: number | null;
  difference?: number | null;
  status: "open" | "closed";
  notes?: string | null;
  opened_at: string;
  closed_at?: string | null;
  user?: { id: number; name: string };
  branch?: { id: number; name: string };
}

export interface ApiShiftMetrics {
  total_transactions: number;
  cash_sales: number;
  card_sales: number;
  mobile_money_sales: number;
  bank_transfer_sales: number;
  total_revenue: number;
  opening_balance: number;
  expected_cash: number;
}

export interface CurrentShiftResponse {
  shift: ApiShift;
  metrics: ApiShiftMetrics;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://pharmaet-api.test/api/v1";

/**
 * 1. Open a new register shift
 * POST /v1/shifts/open
 */
export async function openShift(payload: OpenShiftPayload, token?: string): Promise<{ data: ApiShift; message: string }> {
  const response = await fetch(`${API_BASE}/shifts/open`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to open shift" }));
    throw new Error(error.message || "Failed to open shift");
  }

  return response.json();
}

/**
 * 2. Get active shift details and live drawer totals
 * GET /v1/shifts/current
 */
export async function getCurrentShift(token?: string): Promise<{ data: CurrentShiftResponse | null }> {
  const response = await fetch(`${API_BASE}/shifts/current`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    if (response.status === 404) return { data: null };
    throw new Error("Failed to fetch active shift");
  }

  return response.json();
}

/**
 * 3. Close shift & reconcile cash drawer
 * POST /v1/shifts/close
 */
export async function closeShift(payload: CloseShiftPayload, token?: string): Promise<{ data: ApiShift; message: string }> {
  const response = await fetch(`${API_BASE}/shifts/close`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to close shift" }));
    throw new Error(error.message || "Failed to close shift");
  }

  return response.json();
}
