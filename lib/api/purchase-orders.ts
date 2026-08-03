import { apiFetch } from "./client";
import type { ApiSupplier, ApiBranch, ApiProduct } from "@/lib/mock-data";

export interface ApiPurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity_pack: number;
  cost_per_pack: string | number;
  total_cost: string | number;
  product?: ApiProduct | null;
}

export interface ApiPurchaseOrder {
  id: number;
  order_number?: string;
  supplier_id: number;
  branch_id: number;
  created_by: number;
  status: "draft" | "pending" | "ordered" | "partially_received" | "received" | "cancelled";
  order_date: string;
  note: string | null;
  total_amount?: string | number;
  supplier?: ApiSupplier | null;
  branch?: ApiBranch | null;
  items?: ApiPurchaseOrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface StorePurchaseOrderPayload {
  supplier_id: number;
  branch_id?: number | null;
  order_date: string;
  note?: string | null;
  items: Array<{
    product_id: number;
    quantity_pack: number;
    cost_per_pack: number;
  }>;
}

export interface ReceivePurchaseOrderPayload {
  items: Array<{
    purchase_order_item_id: number;
    quantity_pack: number;
    batch_number?: string;
    expiry_date?: string;
  }>;
}

export async function getPurchaseOrders(params?: {
  search?: string;
  status?: string;
  supplier_id?: string | number;
  branch_id?: string | number;
}): Promise<{ data: ApiPurchaseOrder[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  if (params?.supplier_id) query.append("supplier_id", String(params.supplier_id));
  if (params?.branch_id) query.append("branch_id", String(params.branch_id));

  const queryString = query.toString();
  return apiFetch<{ data: ApiPurchaseOrder[] }>(`/purchase-orders${queryString ? `?${queryString}` : ""}`);
}

export async function getPurchaseOrder(id: number | string): Promise<{ data: ApiPurchaseOrder }> {
  return apiFetch<{ data: ApiPurchaseOrder }>(`/purchase-orders/${id}`);
}

export async function createPurchaseOrder(payload: StorePurchaseOrderPayload): Promise<{ message: string; data: ApiPurchaseOrder }> {
  return apiFetch<{ message: string; data: ApiPurchaseOrder }>("/purchase-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendPurchaseOrder(id: number | string): Promise<{ message: string; data: ApiPurchaseOrder }> {
  return apiFetch<{ message: string; data: ApiPurchaseOrder }>(`/purchase-orders/${id}/send`, {
    method: "PATCH",
  });
}

export async function receivePurchaseOrder(id: number | string, payload: ReceivePurchaseOrderPayload): Promise<{ message: string; data: ApiPurchaseOrder }> {
  return apiFetch<{ message: string; data: ApiPurchaseOrder }>(`/purchase-orders/${id}/receive`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelPurchaseOrder(id: number | string): Promise<{ message: string; data: ApiPurchaseOrder }> {
  return apiFetch<{ message: string; data: ApiPurchaseOrder }>(`/purchase-orders/${id}/cancel`, {
    method: "PATCH",
  });
}
