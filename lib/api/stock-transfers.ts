import { apiFetch } from "./client";

export interface StockTransferItemPayload {
  product_id: number;
  requested_quantity: number;
}

export interface CreateStockTransferPayload {
  from_branch_id?: number;
  to_branch_id: number;
  notes?: string;
  items: StockTransferItemPayload[];
}

export interface ApiStockTransferItem {
  id: number;
  stock_transfer_id: number;
  product_id: number;
  stock_id?: number | null;
  requested_quantity: number;
  sent_quantity?: number | null;
  received_quantity?: number | null;
  product?: {
    id: number;
    name: string;
    sku?: string;
  };
  stock?: any;
}

export interface ApiStockTransfer {
  id: number;
  transfer_number: string;
  from_branch_id: number;
  to_branch_id: number;
  requested_by: number;
  approved_by?: number | null;
  status: "requested" | "approved" | "dispatched" | "received" | "rejected";
  notes?: string | null;
  dispatched_at?: string | null;
  received_at?: string | null;
  created_at: string;
  updated_at: string;
  fromBranch?: { id: number; name: string };
  from_branch?: { id: number; name: string };
  toBranch?: { id: number; name: string };
  to_branch?: { id: number; name: string };
  requestedBy?: { id: number; name: string };
  requested_by_user?: { id: number; name: string };
  approvedBy?: { id: number; name: string };
  approved_by_user?: { id: number; name: string };
  items: ApiStockTransferItem[];
}

export async function getStockTransfers(params?: {
  status?: string;
  from_branch_id?: string | number;
  to_branch_id?: string | number;
  page?: number;
}): Promise<{ data: ApiStockTransfer[] | { data: ApiStockTransfer[]; total?: number } }> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.from_branch_id) query.append("from_branch_id", String(params.from_branch_id));
  if (params?.to_branch_id) query.append("to_branch_id", String(params.to_branch_id));
  if (params?.page) query.append("page", String(params.page));

  const queryString = query.toString();
  return apiFetch<{ data: ApiStockTransfer[] | { data: ApiStockTransfer[]; total?: number } }>(
    `/stock-transfers${queryString ? `?${queryString}` : ""}`
  );
}

export async function createStockTransfer(
  payload: CreateStockTransferPayload
): Promise<{ message: string; data: ApiStockTransfer }> {
  return apiFetch<{ message: string; data: ApiStockTransfer }>("/stock-transfers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getStockTransfer(id: number | string): Promise<{ data: ApiStockTransfer }> {
  return apiFetch<{ data: ApiStockTransfer }>(`/stock-transfers/${id}`);
}

export async function approveStockTransfer(id: number | string): Promise<{ message: string; data: ApiStockTransfer }> {
  return apiFetch<{ message: string; data: ApiStockTransfer }>(`/stock-transfers/${id}/approve`, {
    method: "PATCH",
  });
}

export async function dispatchStockTransfer(id: number | string): Promise<{ message: string; data: ApiStockTransfer }> {
  return apiFetch<{ message: string; data: ApiStockTransfer }>(`/stock-transfers/${id}/dispatch`, {
    method: "PATCH",
  });
}

export async function receiveStockTransfer(id: number | string): Promise<{ message: string; data: ApiStockTransfer }> {
  return apiFetch<{ message: string; data: ApiStockTransfer }>(`/stock-transfers/${id}/receive`, {
    method: "POST",
  });
}

export async function rejectStockTransfer(id: number | string): Promise<{ message: string; data: ApiStockTransfer }> {
  return apiFetch<{ message: string; data: ApiStockTransfer }>(`/stock-transfers/${id}/reject`, {
    method: "PATCH",
  });
}
