"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Ban } from "lucide-react";
import { Receipt } from "@/components/ui/receipt";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { getSale, voidSale, type ApiSale } from "@/lib/api/pos";
import { formatDate } from "@/lib/utils";

export default function SaleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { isManager, isOwner } = useAuth();
  const [sale, setSale] = useState<ApiSale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoiding, setIsVoiding] = useState(false);

  const fetchSale = async () => {
    setIsLoading(true);
    try {
      const res = await getSale(params.id as string);
      setSale(res.data);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load sale details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchSale();
    }
  }, [params.id]);

  const handleVoidSale = async () => {
    if (!sale) return;
    if (!confirm(`Are you sure you want to void SALE-${String(sale.id).padStart(4, "0")}? This will restore stock inventory quantities.`)) return;

    setIsVoiding(true);
    try {
      await voidSale(sale.id);
      toast("Sale voided and inventory restored successfully", "success");
      await fetchSale();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to void sale", "error");
    } finally {
      setIsVoiding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-neutral-500">
        Loading sale receipt details...
      </div>
    );
  }

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
            <p className="mt-0.5 text-sm text-neutral-500">The requested sale does not exist</p>
          </div>
        </div>
        <Link
          href="/sales"
          className="inline-flex rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to sales history
        </Link>
      </div>
    );
  }

  const subtotal = Number(sale.subtotal);
  const discount = Number(sale.discount);
  const tax = Number(sale.tax);
  const total = Number(sale.total);
  const dateStr = formatDate(sale.created_at);
  const paymentLabel = sale.payment_type ? sale.payment_type.replace(/_/g, " ") : "—";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
              SALE-{String(sale.id).padStart(4, "0")}
            </h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              {dateStr}
            </p>
          </div>
        </div>

        {(isManager || isOwner) && (
          <button
            disabled={isVoiding}
            onClick={handleVoidSale}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
          >
            <Ban className="h-3.5 w-3.5" />
            {isVoiding ? "Voiding..." : "Void Sale & Restore Stock"}
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Served By</p>
          <p className="mt-1 text-sm font-medium">{sale.served_by?.name ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Payment Method</p>
          <p className="mt-1 text-sm font-medium capitalize">{paymentLabel}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Total Items</p>
          <p className="mt-1 text-sm font-medium">{sale.items?.length ?? 0} line items</p>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-medium">Items Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 text-left dark:border-neutral-800">
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Product</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Qty</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Price</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(sale.items || []).map((item) => (
                <tr key={item.id} className="border-b border-neutral-200 last:border-b-0 dark:border-neutral-800">
                  <td className="px-4 py-2.5 text-sm font-medium">{item.product?.name ?? `Product #${item.product_id}`}</td>
                  <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{item.quantity} units</td>
                  <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{Number(item.selling_price).toLocaleString()} ETB</td>
                  <td className="px-4 py-2.5 text-sm text-right font-medium">{Number(item.total).toLocaleString()} ETB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
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
          <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-2 text-sm font-semibold dark:border-neutral-800">
            <span>Total</span>
            <span>{total.toLocaleString()} ETB</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">Thermal Receipt Printout</h2>
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
            saleId: `SALE-${String(sale.id).padStart(4, "0")}`,
            date: dateStr,
            time: new Date(sale.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            cashier: sale.served_by?.name ?? "Cashier",
            paymentMethod: paymentLabel,
            items: (sale.items || []).map((item) => ({
              name: item.product?.name ?? `Product #${item.product_id}`,
              qty: item.quantity,
              price: Number(item.selling_price),
              total: Number(item.total),
              unit: (item.product as any)?.pack_size > 1 ? "pack" : "single",
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


