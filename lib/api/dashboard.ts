import { apiFetch } from "./client";
import type { ApiSale } from "@/lib/types";

export interface DashboardResponse {
  data: {
    today: {
      sales_count: number;
      revenue: number;
    };
    month_revenue: number;
    total_stock: number;
    alerts: {
      low_stock: number;
      expiring_soon: number;
      expired: number;
    };
    recent_sales: ApiSale[];
  };
}

export async function getDashboard(params?: { branch_id?: string | number }): Promise<DashboardResponse> {
  const query = new URLSearchParams();
  if (params?.branch_id) {
    query.append("branch_id", String(params.branch_id));
  }
  const queryString = query.toString();
  return apiFetch<DashboardResponse>(`/dashboard${queryString ? `?${queryString}` : ""}`);
}
