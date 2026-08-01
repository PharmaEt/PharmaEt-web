"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockStock } from "@/lib/mock-data";
import type { ApiStock } from "@/lib/mock-data";

function getProductName(stock: ApiStock): string {
  const p = stock.product;
  if ("strength" in p && p.strength) return `${p.name} ${p.strength}`;
  return p.name;
}

function getProductDetail(stock: ApiStock): string {
  const p = stock.product;
  if ("dosage_form" in p) return `${p.strength} · ${p.dosage_form}`;
  if ("product_type" in p) return p.product_type;
  return "";
}

export default function StockDetailPage() {
  const router = useRouter();
  const params = useParams();
  const stock = mockStock.find((s) => s.id === Number(params.id));

  if (!stock) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Stock Not Found</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">The requested stock item does not exist</p>
          </div>
        </div>
        <Link
          href="/stock"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const isLow = stock.quantity <= stock.product.min_stock_alert;
  const daysLeft = stock.expiry_date
    ? Math.ceil((new Date(stock.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{getProductName(stock)}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Stock details</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Stock Information</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-neutral-500">Product</p>
            <p className="text-sm font-medium">{stock.product.name}</p>
            <p className="text-xs text-neutral-500">{getProductDetail(stock)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Branch</p>
            <p className="text-sm font-medium">{stock.branch.name}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Supplier</p>
            <p className="text-sm font-medium">{stock.supplier?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Quantity</p>
            <p className={`text-sm font-semibold ${isLow ? "text-red-600 dark:text-red-400" : ""}`}>
              {stock.quantity}
              {isLow && (
                <span className="ml-1.5 text-[10px] font-medium text-red-600 bg-red-50 px-1 py-0.5 rounded dark:bg-red-950 dark:text-red-400">
                  LOW
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Min Stock Alert</p>
            <p className="text-sm">{stock.product.min_stock_alert}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Batch Number</p>
            <p className="text-sm font-mono">{stock.batch_number ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Expiry Date</p>
            <p className={`text-sm ${daysLeft !== null && daysLeft <= 90 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}>
              {stock.expiry_date ?? "—"}
              {daysLeft !== null && (
                <span className="ml-1.5 text-xs text-neutral-500">({daysLeft} days left)</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Purchase Cost</p>
            <p className="text-sm">ETB {stock.purchase_cost}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Selling Price</p>
            <p className="text-sm font-medium">ETB {stock.selling_price}</p>
          </div>
          {stock.profit_pct !== null && (
            <div>
              <p className="text-xs text-neutral-500">Profit Margin</p>
              <p className="text-sm">{stock.profit_pct}%</p>
            </div>
          )}
          <div>
            <p className="text-xs text-neutral-500">Received</p>
            <p className="text-sm">{new Date(stock.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
