"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, Ban, PackageCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { mockPurchaseOrders } from "@/lib/mock-data";
import type { ApiPurchaseOrder } from "@/lib/mock-data";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  ordered: { label: "Ordered", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  partially_received: { label: "Partially Received", className: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  received: { label: "Received", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
};

function getProductName(item: ApiPurchaseOrder["items"][0]): string {
  const p = item.product;
  if ("strength" in p && p.strength) return `${p.name} ${p.strength}`;
  return p.name;
}

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const po = mockPurchaseOrders.find((p) => p.id === Number(params.id));
  const [status, setStatus] = useState(po?.status ?? "draft");
  const [sending, setSending] = useState(false);

  if (!po) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Order Not Found</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">The requested purchase order does not exist</p>
          </div>
        </div>
        <Link
          href="/purchase-orders"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const handleSendToSupplier = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStatus("ordered");
      toast(`Purchase Order PO-${String(po.id).padStart(3, "0")} sent to ${po.supplier.name} via Telegram!`, "success");
    }, 700);
  };

  const handleCancelOrder = () => {
    setStatus("cancelled");
    toast(`Purchase Order PO-${String(po.id).padStart(3, "0")} cancelled`, "error");
  };

  const subtotal = po.items.reduce((sum, item) => sum + item.total_cost, 0);
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">PO-{String(po.id).padStart(3, "0")}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Purchase order details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "draft" || status === "pending" ? (
            <button
              onClick={handleSendToSupplier}
              disabled={sending}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? "Sending..." : "Send to Supplier"}
            </button>
          ) : null}

          {status === "ordered" || status === "partially_received" ? (
            <Link
              href={`/purchase-orders/${po.id}/receive`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Receive Items
            </Link>
          ) : null}

          {status !== "cancelled" && status !== "received" && (
            <button
              onClick={handleCancelOrder}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-neutral-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-neutral-500">Supplier</p>
            <p className="text-sm font-medium">{po.supplier.name}</p>
            <p className="text-xs text-neutral-500">{po.supplier.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Branch</p>
            <p className="text-sm font-medium">{po.branch.name}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Status</p>
            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${config.className}`}>
              {config.label}
            </span>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Order Date</p>
            <p className="text-sm">{po.order_date}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Created By</p>
            <p className="text-sm">{po.created_by.name}</p>
          </div>
          {po.note && (
            <div>
              <p className="text-xs text-neutral-500">Note</p>
              <p className="text-sm">{po.note}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-neutral-500">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium text-right">Qty (Packs)</th>
                <th className="pb-2 font-medium text-right">Cost/Pack</th>
                <th className="pb-2 font-medium text-right">Total Cost</th>
                <th className="pb-2 font-medium text-right">Received</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-medium">{getProductName(item)}</td>
                  <td className="py-2.5 text-right">{item.quantity_pack}</td>
                  <td className="py-2.5 text-right">ETB {item.cost_per_pack.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-medium">ETB {item.total_cost.toLocaleString()}</td>
                  <td className="py-2.5 text-right">
                    <span className={item.received_quantity >= item.quantity_pack ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500"}>
                      {item.received_quantity} / {item.quantity_pack}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1">
            <div className="flex justify-between border-t border-border pt-1 text-sm font-medium">
              <span>Total</span>
              <span>ETB {subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

