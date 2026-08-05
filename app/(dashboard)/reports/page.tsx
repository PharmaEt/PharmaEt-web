"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { getSalesReport, getStockReport, type SalesReportResponse, type StockReportResponse } from "@/lib/api/reports";
import { formatDate } from "@/lib/utils";

import { BarChartCard, type BarChartItem } from "@/components/ui/charts/bar-chart-card";

function exportToCSV(filename: string, data: Record<string, unknown>[]) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "");
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    ),
  ];
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { toast } = useToast();
  const todayStr = new Date().toISOString().split("T")[0];
  const monthStartStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(monthStartStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const [salesReport, setSalesReport] = useState<SalesReportResponse["data"] | null>(null);
  const [stockReport, setStockReport] = useState<StockReportResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const [salesRes, stockRes] = await Promise.all([
          getSalesReport({ from_date: dateFrom, to_date: dateTo }),
          getStockReport(),
        ]);
        setSalesReport(salesRes.data);
        setStockReport(stockRes.data);
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load report analytics", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, [dateFrom, dateTo]);

  const totalSales = salesReport?.total_sales ?? 0;
  const totalRevenue = salesReport?.total_revenue ?? 0;
  const totalTax = salesReport?.total_tax ?? 0;
  const totalDiscount = salesReport?.total_discount ?? 0;

  const topProducts = salesReport?.top_products ?? [];
  const stockByBranch = stockReport?.by_branch ?? [];
  const stockByProduct = stockReport?.by_product ?? [];
  const totalStockValue = stockReport?.total_value ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Executive sales analytics, financial summaries, and inventory valuation" />

      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
          />
          <span className="text-sm text-neutral-500">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Total Transactions</p>
          <p className="mt-1 text-2xl font-semibold">{totalSales}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Total Sales Revenue</p>
          <p className="mt-1 text-2xl font-semibold">{totalRevenue.toLocaleString()} ETB</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Total Discount</p>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">{totalDiscount.toLocaleString()} ETB</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Total Tax Collected</p>
          <p className="mt-1 text-2xl font-semibold">{totalTax.toLocaleString()} ETB</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Total Inventory Valuation</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{totalStockValue.toLocaleString()} ETB</p>
        </div>
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Top Product Revenue Ranking"
          subtitle="Revenue generated by top selling items"
          items={topProducts.slice(0, 5).map((p) => ({
            label: p.product_name,
            value: Number(p.total_revenue),
            sublabel: `${p.quantity_sold} units sold`,
            color: "#3B82F6",
          }))}
          currency="ETB"
        />

        <BarChartCard
          title="Branch Stock Asset Allocation"
          subtitle="Inventory unit distribution across operating branches"
          items={stockByBranch.map((b) => ({
            label: b.branch_name,
            value: Number(b.total_quantity || 0),
            sublabel: `${b.count} batches`,
            color: "#10B981",
          }))}
          currency="Units"
        />
      </div>

      {/* Top Products Performance */}
      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium uppercase tracking-wide">Top Selling Products</h2>
          <button
            onClick={() => {
              exportToCSV("top-selling-products.csv", topProducts.map((p) => ({
                product_id: p.product_id,
                product_name: p.product_name,
                quantity_sold: p.quantity_sold,
                total_revenue: p.total_revenue,
              })));
              toast("CSV exported successfully");
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Product Name</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Units Sold</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-neutral-500">
                    No product sales found for selected period.
                  </td>
                </tr>
              ) : (
                topProducts.map((prod) => (
                  <tr key={prod.product_id} className="border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="px-4 py-2.5 text-sm font-medium">{prod.product_name}</td>
                    <td className="px-4 py-2.5 text-sm text-right font-medium">{prod.quantity_sold}</td>
                    <td className="px-4 py-2.5 text-sm text-right font-semibold">ETB {Number(prod.total_revenue).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Valuation by Branch */}
      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide">Inventory Breakdown by Branch</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">Physical inventory distribution across retail branches</p>
          </div>
          <button
            onClick={() => {
              exportToCSV("inventory-branch-valuation.csv", stockByBranch.map((b) => ({
                branch_id: b.branch_id,
                branch_name: b.branch_name,
                stock_batches: b.count,
                total_quantity: b.total_quantity,
              })));
              toast("CSV exported successfully");
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Branch Name</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Stock Batches</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Total Units</th>
              </tr>
            </thead>
            <tbody>
              {stockByBranch.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-neutral-500">No branch stock data available</td>
                </tr>
              ) : (
                stockByBranch.map((b) => (
                  <tr key={b.branch_id} className="border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="px-4 py-2.5 text-sm font-medium">{b.branch_name}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{b.count} batches</td>
                    <td className="px-4 py-2.5 text-sm text-right font-semibold">{b.total_quantity} units</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
