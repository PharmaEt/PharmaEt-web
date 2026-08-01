"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Receipt } from "@/components/ui/receipt";
import { mockSales } from "@/lib/mock-data";
import type { ApiSale } from "@/lib/mock-data";

function getProductName(item: ApiSale["items"][0]): string {
  const p = item.product;
  if ("strength" in p && p.strength) return `${p.name} ${p.strength} ${("dosage_form" in p) ? p.dosage_form : ""}`;
  return p.name;
}

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
        <Link
          href="/sales"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const subtotal = parseFloat(sale.subtotal);
  const discount = parseFloat(sale.discount);
  const tax = parseFloat(sale.tax);
  const total = parseFloat(sale.total);
  const saleDate = new Date(sale.created_at);
  const dateStr = saleDate.toLocaleDateString();
  const timeStr = saleDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const paymentLabel = sale.payment_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

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
            {dateStr} at {timeStr}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Served By</p>
          <p className="mt-1 text-sm font-medium">{sale.served_by.name}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Payment</p>
          <p className="mt-1 text-sm font-medium">{paymentLabel}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Items</p>
          <p className="mt-1 text-sm font-medium">{sale.items.length} products</p>
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
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Product</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Qty</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Price</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5 text-sm font-medium">{getProductName(item)}</td>
                  <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{parseFloat(item.selling_price).toLocaleString()} ETB</td>
                  <td className="px-4 py-2.5 text-sm text-right font-medium">{parseFloat(item.total).toLocaleString()} ETB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span>{subtotal.toLocaleString()} ETB</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Discount</span>
              <span className="text-red-600 dark:text-red-400">-{discount.toLocaleString()} ETB</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Tax</span>
            <span>{tax.toLocaleString()} ETB</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>{total.toLocaleString()} ETB</span>
          </div>
        </div>
      </div>

      {/* Receipt Section */}
      <div className="rounded-lg border border-border bg-white p-5 dark:bg-[#0A0A0A]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">Receipt</h2>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Receipt
          </button>
        </div>
        <Receipt
          data={{
            saleId: `SALE-${String(sale.id).padStart(3, "0")}`,
            date: dateStr,
            time: timeStr,
            cashier: sale.served_by.name,
            paymentMethod: paymentLabel,
            items: sale.items.map((item) => ({
              name: getProductName(item),
              qty: item.quantity,
              price: parseFloat(item.selling_price),
              total: parseFloat(item.total),
            })),
            subtotal,
            discount,
            tax,
            total,
          }}
        />
      </div>
    </div>
  );
}


