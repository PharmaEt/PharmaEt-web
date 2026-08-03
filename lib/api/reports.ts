import { apiFetch } from "./client";

export interface SalesReportResponse {
  data: {
    period: { from: string; to: string };
    total_sales: number;
    total_revenue: number;
    total_tax: number;
    total_discount: number;
    by_payment_type: Record<string, { payment_type: string; count: number; total: number }>;
    by_date: Array<{ date: string; count: number; total: number }>;
    top_products: Array<{ product_id: number; product_name: string; quantity_sold: number; total_revenue: number }>;
  };
}

export interface StockReportResponse {
  data: {
    total_stocks: number;
    total_value: number;
    by_branch: Array<{ branch_id: number; branch_name: string; count: number; total_quantity: number }>;
    by_product: Array<{ product_id: number; product_name: string; total_quantity: number; batches: number }>;
  };
}

export async function getSalesReport(params?: {
  from_date?: string;
  to_date?: string;
  branch_id?: string | number;
}): Promise<SalesReportResponse> {
  const query = new URLSearchParams();
  if (params?.from_date) query.append("from_date", params.from_date);
  if (params?.to_date) query.append("to_date", params.to_date);
  if (params?.branch_id) query.append("branch_id", String(params.branch_id));

  const queryString = query.toString();
  return apiFetch<SalesReportResponse>(`/reports/sales${queryString ? `?${queryString}` : ""}`);
}

export async function getStockReport(params?: {
  branch_id?: string | number;
}): Promise<StockReportResponse> {
  const query = new URLSearchParams();
  if (params?.branch_id) query.append("branch_id", String(params.branch_id));

  const queryString = query.toString();
  return apiFetch<StockReportResponse>(`/reports/stock${queryString ? `?${queryString}` : ""}`);
}
