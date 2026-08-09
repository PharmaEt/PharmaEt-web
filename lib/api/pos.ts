import { apiFetch } from "./client";

export interface PosProduct {
  product_id: number;
  name: string;
  category: { id: number; name: string } | null;
  type: "Medicine" | "Cosmetic";
  available_quantity: number;
  selling_price: number;
  pack_size: number;
  pack_selling_price: number;
  fefo_stock_id: number;
  earliest_expiry_date: string | null;
  details?: any;
}

export interface ApiSaleItem {
  id: number;
  sale_id: number;
  stock_id: number;
  product_id: number;
  quantity: number;
  selling_price: number;
  total: number;
  product?: any;
}

export interface ApiSale {
  id: number;
  branch_id: number;
  shift_id?: number | null;
  served_by: any;
  prescription_image?: string | null;
  payment_type: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  cash_given: number;
  change: number;
  created_at: string;
  items: ApiSaleItem[];
  branch?: any;
}

export async function getPosProducts(params?: {
  search?: string;
  category_id?: string | number;
  type?: string;
}): Promise<{ data: PosProduct[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.category_id) query.append("category_id", String(params.category_id));
  if (params?.type) query.append("type", params.type);

  const queryString = query.toString();
  return apiFetch<{ data: PosProduct[] }>(`/pos/products${queryString ? `?${queryString}` : ""}`);
}

export async function createSale(payload: {
  payment_type: string;
  cash_given?: number;
  tax?: number;
  tax_rate?: number;
  discount?: number;
  discount_rate?: number;
  prescription_image?: string;
  items: { product_id?: number; stock_id?: number; quantity: number }[];
}): Promise<{ message: string; data: ApiSale }> {
  return apiFetch<{ message: string; data: ApiSale }>("/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSales(params?: {
  payment_type?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
}): Promise<{ data: ApiSale[] | { data: ApiSale[]; total?: number } }> {
  const query = new URLSearchParams();
  if (params?.payment_type) query.append("payment_type", params.payment_type);
  if (params?.from_date) query.append("from_date", params.from_date);
  if (params?.to_date) query.append("to_date", params.to_date);
  if (params?.page) query.append("page", String(params.page));

  const queryString = query.toString();
  return apiFetch<{ data: ApiSale[] | { data: ApiSale[]; total?: number } }>(`/sales${queryString ? `?${queryString}` : ""}`);
}

export async function getSale(id: number | string): Promise<{ data: ApiSale }> {
  return apiFetch<{ data: ApiSale }>(`/sales/${id}`);
}

export async function voidSale(id: number | string): Promise<{ message: string; data: ApiSale }> {
  return apiFetch<{ message: string; data: ApiSale }>(`/sales/${id}/void`, {
    method: "POST",
  });
}
