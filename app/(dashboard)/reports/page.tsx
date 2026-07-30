"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { mockMedicines, mockCategories } from "@/lib/mock-data";

const mockSales = [
  { id: "SALE-001", date: "2026-07-28", time: "10:30 AM", items: 3, subtotal: 450, discount: 0, tax: 67.5, total: 517.5 },
  { id: "SALE-002", date: "2026-07-28", time: "11:15 AM", items: 1, subtotal: 120, discount: 10, tax: 16.5, total: 126.5 },
  { id: "SALE-003", date: "2026-07-28", time: "11:45 AM", items: 5, subtotal: 890, discount: 0, tax: 133.5, total: 1023.5 },
  { id: "SALE-004", date: "2026-07-27", time: "12:20 PM", items: 2, subtotal: 340, discount: 20, tax: 48, total: 368 },
  { id: "SALE-005", date: "2026-07-27", time: "01:00 PM", items: 4, subtotal: 670, discount: 0, tax: 100.5, total: 770.5 },
  { id: "SALE-006", date: "2026-07-26", time: "01:30 PM", items: 1, subtotal: 85, discount: 0, tax: 12.75, total: 97.75 },
  { id: "SALE-007", date: "2026-07-26", time: "02:15 PM", items: 6, subtotal: 1200, discount: 50, tax: 172.5, total: 1322.5 },
  { id: "SALE-008", date: "2026-07-25", time: "02:45 PM", items: 2, subtotal: 290, discount: 0, tax: 43.5, total: 333.5 },
];

const mockExpiry = [
  { medicine: "Paracetamol", batch: "BN-2026A", expiry: "2026-10-01", qty: 49, daysLeft: 63 },
  { medicine: "Amoxicillin", batch: "BN-2026B", expiry: "2026-11-01", qty: 50, daysLeft: 94 },
  { medicine: "Omeprazole", batch: "BN-2025C", expiry: "2026-08-15", qty: 30, daysLeft: 17 },
  { medicine: "Cetirizine", batch: "BN-2026D", expiry: "2026-12-01", qty: 25, daysLeft: 124 },
  { medicine: "Amlodipine", batch: "BN-2026E", expiry: "2027-01-20", qty: 20, daysLeft: 174 },
];

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("2026-07-01");
  const [dateTo, setDateTo] = useState("2026-07-30");

  const filteredSales = mockSales.filter((s) => s.date >= dateFrom && s.date <= dateTo);

  const totalCount = filteredSales.length;
  const totalSubtotal = filteredSales.reduce((s, sale) => s + sale.subtotal, 0);
  const totalDiscount = filteredSales.reduce((s, sale) => s + sale.discount, 0);
  const totalTax = filteredSales.reduce((s, sale) => s + sale.tax, 0);
  const totalTotal = filteredSales.reduce((s, sale) => s + sale.total, 0);

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
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-neutral-500">Business analytics and inventory reports</p>
      </div>

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
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
          Apply
        </button>
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
          <button className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900">
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
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Time</th>
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
                    <td className="px-4 py-2.5 text-sm font-medium">{sale.id}</td>
                    <td className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-400">{sale.date}</td>
                    <td className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-400">{sale.time}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{sale.items}</td>
                    <td className="px-4 py-2.5 text-sm text-right">{sale.subtotal.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-red-600 dark:text-red-400">{sale.discount > 0 ? sale.discount.toFixed(2) : "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-right">{sale.tax.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm text-right font-medium">{sale.total.toFixed(2)}</td>
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
          <h2 className="text-sm font-medium uppercase tracking-wide">Expiry Report (Next 180 Days)</h2>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900">
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Medicine</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Batch</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Expiry</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Qty</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {mockExpiry.map((item, index) => (
                <tr key={index} className="border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="px-4 py-2.5 text-sm font-medium">{item.medicine}</td>
                  <td className="px-4 py-2.5 text-sm text-neutral-500 font-mono">{item.batch}</td>
                  <td className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-400">{item.expiry}</td>
                  <td className="px-4 py-2.5 text-sm text-right">{item.qty}</td>
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

      {/* Inventory Report */}
      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide">Low Stock Report</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">{inventoryData.length} items below minimum · Estimated value: {inventoryValue.toLocaleString()} ETB</p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900">
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
