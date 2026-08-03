import { apiFetch } from "./client";
import { type ApiStock } from "@/lib/mock-data";

export interface StockPayload {
  product_id: number;
  supplier_id?: number | null;
  branch_id?: number | null;
  batch_number: string;
  expiry_date?: string | null;
  purchase_cost: number;
  selling_price: number;
  quantity: number;
}

export interface AdjustStockPayload {
  quantity: number;
  type: "damaged" | "expired" | "stolen" | "correction";
  notes?: string;
}

export interface StockAlertsResponse {
  data: {
    low_stock: Array<{ branch_id: number; product: any; quantity: number; min_stock_alert: number }>;
    expiring_soon: ApiStock[];
    expired: ApiStock[];
  };
}

export interface StockMovementsResponse {
  data: Array<{
    id: number;
    stock_id: number;
    branch_id: number;
    product_id: number;
    type: string;
    quantity: number;
    reference_id?: number;
    reference_type?: string;
    created_at: string;
    product?: any;
    stock?: any;
    created_by_user?: any;
  }> | { data: any[] };
}

export async function getStockBatches(params?: {
  search?: string;
  product_id?: string | number;
  branch_id?: string | number;
  supplier_id?: string | number;
  batch_number?: string;
}): Promise<{ data: ApiStock[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.product_id) query.append("product_id", String(params.product_id));
  if (params?.branch_id) query.append("branch_id", String(params.branch_id));
  if (params?.supplier_id) query.append("supplier_id", String(params.supplier_id));
  if (params?.batch_number) query.append("batch_number", params.batch_number);

  const queryString = query.toString();
  return apiFetch<{ data: ApiStock[] }>(`/stock${queryString ? `?${queryString}` : ""}`);
}

export async function getStockBatch(id: number | string): Promise<{ data: ApiStock }> {
  return apiFetch<{ data: ApiStock }>(`/stock/${id}`);
}

export async function createStockBatch(payload: StockPayload): Promise<{ message: string; data: { id: number } }> {
  return apiFetch<{ message: string; data: { id: number } }>("/stock", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStockBatch(id: number | string, payload: Partial<StockPayload>): Promise<{ data: ApiStock }> {
  return apiFetch<{ data: ApiStock }>(`/stock/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function adjustStockBatch(id: number | string, payload: AdjustStockPayload): Promise<{ message: string; data: any }> {
  return apiFetch<{ message: string; data: any }>(`/stock/${id}/adjust`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getStockAlerts(): Promise<StockAlertsResponse> {
  return apiFetch<StockAlertsResponse>("/stock/alerts");
}

export async function getStockMovements(params?: {
  search?: string;
  type?: string;
  product_id?: string | number;
  stock_id?: string | number;
}): Promise<StockMovementsResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.type) query.append("type", params.type);
  if (params?.product_id) query.append("product_id", String(params.product_id));
  if (params?.stock_id) query.append("stock_id", String(params.stock_id));

  const queryString = query.toString();
  return apiFetch<StockMovementsResponse>(`/stock-movements${queryString ? `?${queryString}` : ""}`);
}
