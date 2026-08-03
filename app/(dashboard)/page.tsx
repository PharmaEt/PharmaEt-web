"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/context/auth-context";
import { getDashboard, type DashboardResponse } from "@/lib/api/dashboard";
import { getBranches } from "@/lib/api/branches";
import type { ApiBranch, ApiSale } from "@/lib/mock-data";

const saleColumns = [
  {
    key: "time",
    header: "Time",
    render: (item: ApiSale) => (
      <span className="text-sm font-medium">
        {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    ),
  },
  {
    key: "items",
    header: "Items",
    render: (item: ApiSale) => (
      <span className="text-neutral-500 text-sm">{(item.items || []).length} items</span>
    ),
    hideOnMobile: true,
  },
  {
    key: "total",
    header: "Total",
    render: (item: ApiSale) => (
      <span className="font-medium text-sm">ETB {Number(item.total).toLocaleString()}</span>
    ),
  },
  {
    key: "payment",
    header: "Payment",
    render: (item: ApiSale) => (
      <span className="text-neutral-500 text-sm capitalize">
        {(item.payment_type || "cash").replace(/_/g, " ")}
      </span>
    ),
    hideOnMobile: true,
  },
  {
    key: "served_by",
    header: "Served By",
    render: (item: ApiSale) => (
      <span className="text-neutral-500 text-sm">{item.served_by?.name ?? "—"}</span>
    ),
    hideOnMobile: true,
  },
];

const branchColumns = [
  {
    key: "name",
    header: "Branch",
    render: (item: ApiBranch) => (
      <div>
        <p className="font-medium text-sm">{item.name}</p>
        <p className="text-xs text-neutral-500">{item.location || "Main Location"}</p>
      </div>
    ),
  },
  {
    key: "manager",
    header: "Manager",
    render: (item: ApiBranch) => {
      const manager = (item.users || []).find((u) => u.role === "manager");
      return <span className="text-neutral-500 text-sm">{manager?.name ?? "—"}</span>;
    },
    hideOnMobile: true,
  },
  {
    key: "staff",
    header: "Staff",
    render: (item: ApiBranch) => (
      <span className="text-neutral-500 text-sm">{(item.users || []).length} members</span>
    ),
    hideOnMobile: true,
  },
];

export default function DashboardPage() {
  const { isOwner, user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse["data"] | null>(null);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      if (isOwner) {
        try {
          const res = await getBranches();
          const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
          setBranches(list);
        } catch {
          // Silent
        }
      }
    }
    loadInitialData();
  }, [isOwner]);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const res = await getDashboard({ branch_id: selectedBranch || undefined });
        setDashboard(res.data);
      } catch {
        // Silent
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [selectedBranch]);

  const todayRevenue = dashboard?.today?.revenue ?? 0;
  const todaySalesCount = dashboard?.today?.sales_count ?? 0;
  const monthRevenue = dashboard?.month_revenue ?? 0;
  const totalStock = dashboard?.total_stock ?? 0;
  const lowStockCount = dashboard?.alerts?.low_stock ?? 0;
  const expiringCount = dashboard?.alerts?.expiring_soon ?? 0;
  const expiredCount = dashboard?.alerts?.expired ?? 0;
  const recentSales = dashboard?.recent_sales ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {isOwner && (
        <div className="flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900 border border-border p-3 sm:p-4 rounded-lg">
          <div>
            <h2 className="text-sm font-semibold">Dashboard Branch Filter</h2>
            <p className="text-xs text-neutral-500">Select branch to view performance stats</p>
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-xs font-medium focus:outline-none"
          >
            <option value="">All Operating Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Today's Revenue" value={`${todayRevenue.toLocaleString()} ETB`} description={`${todaySalesCount} transactions today`} />
        <StatsCard title="This Month Revenue" value={`${monthRevenue.toLocaleString()} ETB`} description="Month-to-date sales total" />
        <StatsCard title="Active Stock Batches" value={totalStock} description="Product items in inventory" />
        <StatsCard title="Low Stock Alerts" value={lowStockCount} description="Items needing reorder" />
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Today's Transactions" value={todaySalesCount} description="Completed receipts" />
        <StatsCard title="Expiring Soon" value={expiringCount} description="Expiring within alert window" />
        <StatsCard title="Expired Batches" value={expiredCount} description="Expired stock batches" />
        <StatsCard title="Recent Sales Count" value={recentSales.length} description="Latest sales history" />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-medium">Recent Sales</h2>
            <a href="/sales" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              View all
            </a>
          </div>
          <DataTable columns={saleColumns} data={recentSales} />
        </div>

        {isOwner && (
          <div className="rounded-lg border border-border">
            <div className="border-b border-border px-4 sm:px-5 py-3">
              <h2 className="text-sm font-medium">Active Branches</h2>
            </div>
            <DataTable columns={branchColumns} data={branches} />
          </div>
        )}
      </div>
    </div>
  );
}
