"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const mockSales = [
  { id: 1, date: "2026-07-28", time: "10:30 AM", cashier: "Omar Ibrahim", payment: "Cash", prescription: false, items: [
    { name: "Paracetamol 500mg", qty: 2, price: 45, total: 90 },
    { name: "Amoxicillin 250mg", qty: 1, price: 120, total: 120 },
    { name: "Cetirizine 10mg", qty: 1, price: 35, total: 35 },
  ], subtotal: 245, discount: 0, tax: 36.75, total: 281.75 },
  { id: 2, date: "2026-07-28", time: "11:15 AM", cashier: "Omar Ibrahim", payment: "Telebirr", prescription: true, items: [
    { name: "Metformin 500mg", qty: 1, price: 120, total: 120 },
  ], subtotal: 120, discount: 10, tax: 16.5, total: 126.5 },
];

export default function SaleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sale = mockSales.find((s) => s.id === Number(params.id));

  if (!sale) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Sale Not Found</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">The requested sale does not exist</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            SALE-{String(sale.id).padStart(3, "0")}
          </h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {sale.date} at {sale.time}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Cashier</p>
          <p className="mt-1 text-sm font-medium">{sale.cashier}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Payment</p>
          <p className="mt-1 text-sm font-medium">{sale.payment}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Prescription</p>
          <p className="mt-1 text-sm font-medium">{sale.prescription ? "Required" : "Not required"}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Medicine</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Qty</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Price</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => (
                <tr key={idx} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{item.qty}</td>
                  <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{item.price.toLocaleString()} ETB</td>
                  <td className="px-4 py-2.5 text-sm text-right font-medium">{item.total.toLocaleString()} ETB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span>{sale.subtotal.toLocaleString()} ETB</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Discount</span>
              <span className="text-red-600 dark:text-red-400">-{sale.discount.toLocaleString()} ETB</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Tax (15%)</span>
            <span>{sale.tax.toLocaleString()} ETB</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>{sale.total.toLocaleString()} ETB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
