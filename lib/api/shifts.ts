import { apiFetch } from "./client";

export interface ApiShift {
  id: number;
  branch_id: number;
  user_id: number;
  opening_balance: number;
  expected_cash?: number | null;
  actual_cash?: number | null;
  difference?: number | null;
  status: "open" | "closed";
  notes?: string | null;
  opened_at: string;
  closed_at?: string | null;
  user?: any;
  branch?: any;
  sales?: any[];
}

export interface ShiftMetrics {
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
  data: {
    shift: ApiShift;
    metrics: ShiftMetrics;
  };
}

export interface CloseShiftSummary {
  total_transactions: number;
  total_revenue: number;
  cash_sales: number;
  opening_balance: number;
  expected_cash: number;
  actual_cash: number;
  difference: number;
}

export async function openShift(payload: { opening_balance: number; notes?: string }): Promise<{ message: string; data: ApiShift }> {
  return apiFetch<{ message: string; data: ApiShift }>("/shifts/open", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentShift(): Promise<CurrentShiftResponse> {
  return apiFetch<CurrentShiftResponse>("/shifts/current");
}

export async function closeShift(payload: { actual_cash: number; notes?: string }): Promise<{ message: string; data: { shift: ApiShift; summary: CloseShiftSummary } }> {
  return apiFetch<{ message: string; data: { shift: ApiShift; summary: CloseShiftSummary } }>("/shifts/close", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getShifts(params?: {
  status?: string;
  user_id?: string | number;
  from_date?: string;
  to_date?: string;
  page?: number;
}): Promise<{ data: ApiShift[] | { data: ApiShift[]; total?: number } }> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.user_id) query.append("user_id", String(params.user_id));
  if (params?.from_date) query.append("from_date", params.from_date);
  if (params?.to_date) query.append("to_date", params.to_date);
  if (params?.page) query.append("page", String(params.page));

  const queryString = query.toString();
  return apiFetch<{ data: ApiShift[] | { data: ApiShift[]; total?: number } }>(`/shifts${queryString ? `?${queryString}` : ""}`);
}

export async function getShift(id: number | string): Promise<{ data: ApiShift }> {
  return apiFetch<{ data: ApiShift }>(`/shifts/${id}`);
}
