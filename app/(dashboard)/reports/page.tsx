"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { mockSales, mockStock, mockMedicines, mockCategories } from "@/lib/mock-data";
import type { ApiSale, ApiStock } from "@/lib/mock-data";

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

function getStockProductName(stock: ApiStock): string {
  const p = stock.product;
  if ("strength" in p && p.strength) return `${p.name} ${p.strength}`;
  return p.name;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState("2026-07-01");
  const [dateTo, setDateTo] = useState("2026-07-30");

  // Sales report — filter by date from ApiSale
  const filteredSales = mockSales.filter((s) => {
    const saleDate = s.created_at.slice(0, 10);
    return saleDate >= dateFrom && saleDate <= dateTo;
  });

  const totalCount = filteredSales.length;
  const totalSubtotal = filteredSales.reduce((s, sale) => s + parseFloat(sale.subtotal), 0);
  const totalDiscount = filteredSales.reduce((s, sale) => s + parseFloat(sale.discount), 0);
  const totalTax = filteredSales.reduce((s, sale) => s + parseFloat(sale.tax), 0);
  const totalTotal = filteredSales.reduce((s, sale) => s + parseFloat(sale.total), 0);

  // Expiry report — from mockStock with expiry dates
  const expiryData = mockStock
    .filter((s) => s.expiry_date !== null)
    .map((s) => {
      const daysLeft = Math.ceil((new Date(s.expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return { ...s, daysLeft, productName: getStockProductName(s) };
    })
    .filter((s) => s.daysLeft <= 365)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Low stock report — from mockMedicines
  const inventoryData = mockMedicines
    .filter((m) => m.current_stock <= m.min_stock_alert)
    .map((m) => {
      const cat = m.category ?? mockCategories.find((c) => c.id === m.category_id);
      const estValue = m.current_stock * m.unit_price;
      return { ...m, categoryName: cat?.name ?? "—", estValue };
    });

  const inventoryValue = inventoryData.reduce((s, m) => s + m.estValue, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Reports" subtitle="Business analytics and inventory reports" />

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
          <p className="text-xs text-neutral-500">Sales Count</p>
          <p className="mt-1 text-2xl font-semibold">{totalCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Subtotal</p>
          <p className="mt-1 text-2xl font-semibold">{totalSubtotal.toFixed(2)} ETB</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Discount</p>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">{totalDiscount.toFixed(2)} ETB</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Tax</p>
          <p className="mt-1 text-2xl font-semibold">{totalTax.toFixed(2)} ETB</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Total</p>
          <p className="mt-1 text-2xl font-semibold">{totalTotal.toFixed(2)} ETB</p>
        </div>
      </div>

      {/* Sales Report */}
      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium uppercase tracking-wide">Sales Report</h2>
          <button
            onClick={() => {
              exportToCSV("sales-report.csv", filteredSales.map((s) => ({
                id: `SALE-${String(s.id).padStart(3, "0")}`,
                date: s.created_at.slice(0, 10),
                served_by: s.served_by.name,
                payment: s.payment_type,
                items: s.items.length,
                subtotal: s.subtotal,
                discount: s.discount,
                tax: s.tax,
                total: s.total,
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
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Sale ID</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Date</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Served By</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Items</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Subtotal</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Discount</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Tax</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-neutral-500">
                    No sales found for selected period.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="px-4 py-2.5 text-sm font-medium">SALE-{String(sale.id).padStart(3, "0")}</td>
                    <td className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-400">{sale.created_at.slice(0, 10)}</td>
                    <td className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-400">{sale.served_by.name}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{sale.items.length}</td>
                    <td className="px-4 py-2.5 text-sm text-right">{parseFloat(sale.subtotal).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-red-600 dark:text-red-400">{parseFloat(sale.discount) > 0 ? parseFloat(sale.discount).toFixed(2) : "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-right">{parseFloat(sale.tax).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm text-right font-medium">{parseFloat(sale.total).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expiry Report */}
      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium uppercase tracking-wide">Expiry Report</h2>
          <button
            onClick={() => {
              exportToCSV("expiry-report.csv", expiryData.map((s) => ({
                product: s.productName,
                batch: s.batch_number ?? "",
                expiry: s.expiry_date ?? "",
                quantity: s.quantity,
                days_left: s.daysLeft,
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
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Product</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Batch</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Expiry</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Qty</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {expiryData.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="px-4 py-2.5 text-sm font-medium">{item.productName}</td>
                  <td className="px-4 py-2.5 text-sm text-neutral-500 font-mono">{item.batch_number ?? "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-400">{item.expiry_date}</td>
                  <td className="px-4 py-2.5 text-sm text-right">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-sm text-right">
                    <span className={`font-medium ${
                      item.daysLeft <= 30
                        ? "text-red-600 dark:text-red-400"
                        : item.daysLeft <= 90
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}>
                      {item.daysLeft} days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Report */}
      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide">Low Stock Report</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">{inventoryData.length} items below minimum · Estimated value: {inventoryValue.toLocaleString()} ETB</p>
          </div>
          <button
            onClick={() => {
              exportToCSV("low-stock-report.csv", inventoryData.map((m) => ({
                medicine: m.name,
                strength: m.strength,
                category: m.categoryName,
                in_stock: m.current_stock,
                min_alert: m.min_stock_alert,
                est_value: m.estValue,
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
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Medicine</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">In Stock</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Min</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-[11px] text-neutral-500">{m.strength} · {m.categoryName}</p>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-right text-red-600 dark:text-red-400 font-medium">{m.current_stock}</td>
                  <td className="px-4 py-2.5 text-sm text-right text-neutral-500">{m.min_stock_alert}</td>
                  <td className="px-4 py-2.5 text-sm text-right">{m.estValue.toFixed(2)} ETB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
