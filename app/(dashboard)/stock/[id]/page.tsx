"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getStockBatch } from "@/lib/api/stock";
import { formatDate } from "@/lib/utils";
import type { ApiStock } from "@/lib/types";

function getProductName(stock: ApiStock): string {
  const p = stock.product as any;
  if (!p) return "—";
  const details = p.productable;
  if (details?.strength) return `${p.name} ${details.strength}`;
  if (p.strength) return `${p.name} ${p.strength}`;
  return p.name;
}

export default function StockDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [stock, setStock] = useState<ApiStock | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStock() {
      setIsLoading(true);
      try {
        const res = await getStockBatch(params.id as string);
        setStock(res.data);
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load stock details", "error");
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) {
      fetchStock();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-500">
        Loading stock details...
      </div>
    );
  }

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

  const minAlert = stock.product?.min_stock_alert ?? 10;
  const isLow = stock.quantity <= minAlert;
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
          <p className="mt-0.5 text-sm text-muted-foreground">Stock batch details</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Stock Information</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-neutral-500">Product</p>
            <p className="text-sm font-medium">{stock.product?.name}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Branch</p>
            <p className="text-sm font-medium">{stock.branch?.name ?? "Global / Network Wide"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Supplier</p>
            <p className="text-sm font-medium">{stock.supplier?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Quantity</p>
            <p className={`text-sm font-semibold ${isLow ? "text-red-600 dark:text-red-400" : ""}`}>
              {stock.quantity} units
              {isLow && (
                <span className="ml-1.5 text-[10px] font-medium text-red-600 bg-red-50 px-1 py-0.5 rounded dark:bg-red-950 dark:text-red-400">
                  LOW
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Min Stock Alert</p>
            <p className="text-sm">{minAlert}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Batch Number</p>
            <p className="text-sm font-mono">{stock.batch_number ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Expiry Date</p>
            <p className={`text-sm ${daysLeft !== null && daysLeft <= 90 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}>
              {formatDate(stock.expiry_date)}
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
        </div>
      </div>
    </div>
  );
}
