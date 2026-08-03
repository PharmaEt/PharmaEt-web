"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Ban, PackageCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  getPurchaseOrder,
  sendPurchaseOrder,
  cancelPurchaseOrder,
  type ApiPurchaseOrder,
} from "@/lib/api/purchase-orders";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
  ordered: { label: "Ordered", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  partially_received: { label: "Partially Received", className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  received: { label: "Received", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [po, setPo] = useState<ApiPurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<"send" | "cancel" | null>(null);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await getPurchaseOrder(params.id as string);
      setPo(res.data);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load purchase order", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  const handleSendOrder = async () => {
    if (!po) return;
    setIsProcessing(true);
    try {
      await sendPurchaseOrder(po.id);
      toast(`Purchase order PO-${String(po.id).padStart(3, "0")} sent to supplier via Telegram!`, "success");
      fetchDetail();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to send purchase order", "error");
    } finally {
      setIsProcessing(false);
      setActiveModal(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!po) return;
    setIsProcessing(true);
    try {
      await cancelPurchaseOrder(po.id);
      toast(`Purchase order PO-${String(po.id).padStart(3, "0")} cancelled`, "success");
      fetchDetail();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to cancel purchase order", "error");
    } finally {
      setIsProcessing(false);
      setActiveModal(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-sm text-neutral-500">Loading purchase order details...</div>;

  if (!po) return <div className="p-8 text-center text-sm text-neutral-500">Purchase Order not found.</div>;

  const config = statusConfig[po.status] || statusConfig.draft;
  const poNumber = po.order_number || `PO-${String(po.id).padStart(3, "0")}`;
  const totalCost = (po.items || []).reduce(
    (sum, item) => sum + (item.quantity_pack || 0) * (parseFloat(String(item.cost_per_pack)) || 0),
    0
  );

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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{poNumber}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Order Date: {formatDate(po.order_date || po.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {po.status === "draft" && (
            <button
              disabled={isProcessing}
              onClick={() => setActiveModal("send")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Send to Supplier
            </button>
          )}

          {(po.status === "ordered" || po.status === "partially_received") && (
            <Link
              href={`/purchase-orders/${po.id}/receive`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Receive Delivery
            </Link>
          )}

          {po.status === "draft" && (
            <button
              disabled={isProcessing}
              onClick={() => setActiveModal("cancel")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-neutral-800 dark:text-red-400 dark:hover:bg-red-950 disabled:opacity-50"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Status</p>
          <span className={`mt-1 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${config.className}`}>
            {config.label}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Supplier</p>
          <p className="mt-1 text-sm font-medium">{po.supplier?.name ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Branch</p>
          <p className="mt-1 text-sm font-medium">{po.branch?.name ?? "Central Store"}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Total Order Cost</p>
          <p className="mt-1 text-sm font-semibold">{totalCost.toLocaleString()} ETB</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Order Items & Delivery Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Product</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Ordered (Packs)</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Cost / Pack</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {po.items && po.items.length > 0 ? (
                po.items.map((item) => {
                  const costPerPack = parseFloat(String(item.cost_per_pack)) || 0;
                  const lineTotal = (item.quantity_pack || 0) * costPerPack;
                  return (
                    <tr key={item.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-2.5 text-sm font-medium">{item.product?.name ?? `Product #${item.product_id}`}</td>
                      <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{item.quantity_pack}</td>
                      <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{costPerPack.toLocaleString()} ETB</td>
                      <td className="px-4 py-2.5 text-sm text-right font-medium">{lineTotal.toLocaleString()} ETB</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-neutral-400">
                    No items in this purchase order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={activeModal === "send"}
        title="Send Purchase Order to Supplier?"
        description={`This will update order status to 'Ordered' and send an automated Telegram purchase alert to ${po.supplier?.name ?? "the supplier"}.`}
        confirmLabel={isProcessing ? "Sending..." : "Send via Telegram"}
        onConfirm={handleSendOrder}
        onCancel={() => setActiveModal(null)}
      />

      <ConfirmDialog
        open={activeModal === "cancel"}
        title="Cancel Purchase Order?"
        description="Are you sure you want to cancel this order? This action will mark the purchase order as cancelled."
        confirmLabel={isProcessing ? "Cancelling..." : "Cancel Order"}
        onConfirm={handleCancelOrder}
        onCancel={() => setActiveModal(null)}
      />
    </div>
  );
}
