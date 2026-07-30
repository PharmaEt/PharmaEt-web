"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { mockMedicines, mockBranches } from "@/lib/mock-data";

const mockStockHistory = [
  { id: 1, date: "2026-07-28", type: "in", quantity: 200, reference: "PO-001", notes: "Initial stock received" },
  { id: 2, date: "2026-07-28", type: "out", quantity: 15, reference: "SALE-042", notes: "Retail sale" },
  { id: 3, date: "2026-07-27", type: "out", quantity: 10, reference: "SALE-039", notes: "Retail sale" },
  { id: 4, date: "2026-07-27", type: "in", quantity: 50, reference: "PO-002", notes: "Restock order" },
  { id: 5, date: "2026-07-26", type: "out", quantity: 8, reference: "SALE-035", notes: "Retail sale" },
  { id: 6, date: "2026-07-25", type: "out", quantity: 12, reference: "SALE-031", notes: "Bulk order" },
];

export default function StockDetailPage() {
  const router = useRouter();
  const params = useParams();
  const medicine = mockMedicines.find((m) => m.id === Number(params.id));

  if (!medicine) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Stock Not Found</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">The requested stock item does not exist</p>
          </div>
        </div>
      </div>
    );
  }

  const branch = medicine.branch ?? mockBranches.find((b) => b.id === medicine.branch_id);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{medicine.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Stock details</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Stock Information</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-neutral-500">Medicine</p>
            <p className="text-sm font-medium">{medicine.name}</p>
            <p className="text-xs text-neutral-500">{medicine.strength} · {medicine.dosage_form}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Branch</p>
            <p className="text-sm font-medium">{branch?.name ?? "All Branches"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Current Stock</p>
            <p className={`text-sm font-semibold ${
              medicine.current_stock <= medicine.min_stock_alert
                ? "text-red-600 dark:text-red-400"
                : ""
            }`}>
              {medicine.current_stock}
              {medicine.current_stock <= medicine.min_stock_alert && (
                <span className="ml-1.5 text-[10px] font-medium text-red-600 bg-red-50 px-1 py-0.5 rounded dark:bg-red-950 dark:text-red-400">
                  LOW
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Min Stock Alert</p>
            <p className="text-sm">{medicine.min_stock_alert}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Pack Size</p>
            <p className="text-sm">{medicine.pack_size}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Pack Price</p>
            <p className="text-sm">ETB {medicine.pack_price}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Unit Price</p>
            <p className="text-sm">ETB {medicine.unit_price}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Stock History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-neutral-500">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Quantity</th>
                <th className="pb-2 font-medium">Reference</th>
                <th className="pb-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {mockStockHistory.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 text-neutral-500">{entry.date}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      entry.type === "in"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                    }`}>
                      {entry.type === "in" ? "IN" : "OUT"}
                    </span>
                  </td>
                  <td className="py-2.5 font-medium">{entry.quantity}</td>
                  <td className="py-2.5 text-neutral-500 font-mono text-xs">{entry.reference}</td>
                  <td className="py-2.5 text-neutral-500">{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Back to Stock
        </button>
      </div>
    </div>
  );
}
