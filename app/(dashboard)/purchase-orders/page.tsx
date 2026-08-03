"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, Send, PackageCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { getPurchaseOrders, cancelPurchaseOrder, type ApiPurchaseOrder } from "@/lib/api/purchase-orders";
import { formatDate } from "@/lib/utils";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pos, setPos] = useState<ApiPurchaseOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await getPurchaseOrders({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
      setPos(list);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load purchase orders", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await cancelPurchaseOrder(cancelId);
      toast("Purchase order cancelled successfully", "success");
      fetchOrders();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to cancel purchase order", "error");
    } finally {
      setCancelId(null);
    }
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
    ordered: { label: "Ordered", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
    partially_received: { label: "Partially Received", className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
    received: { label: "Received", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
    cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
  };

  const columns = [
    {
      key: "id",
      header: "PO Number",
      render: (item: ApiPurchaseOrder) => (
        <span className="font-medium text-sm font-mono">{item.order_number || `PO-${String(item.id).padStart(3, "0")}`}</span>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (item: ApiPurchaseOrder) => (
        <span className="text-sm font-medium">{item.supplier?.name ?? "—"}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item: ApiPurchaseOrder) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{formatDate(item.order_date || item.created_at)}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "items",
      header: "Items",
      render: (item: ApiPurchaseOrder) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{(item.items || []).length} items</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "total",
      header: "Total",
      render: (item: ApiPurchaseOrder) => {
        const total = (item.items || []).reduce(
          (sum, i) => sum + (i.quantity_pack || 0) * (parseFloat(String(i.cost_per_pack)) || 0),
          0
        );
        const displayTotal = item.total_amount ? parseFloat(String(item.total_amount)) : total;
        return (
          <span className="font-medium text-sm">ETB {(isNaN(displayTotal) ? 0 : displayTotal).toLocaleString()}</span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (item: ApiPurchaseOrder) => {
        const config = statusConfig[item.status] || statusConfig.draft;
        return (
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: ApiPurchaseOrder) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/purchase-orders/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {item.status === "draft" && (
            <button
              onClick={() => router.push(`/purchase-orders/${item.id}`)}
              aria-label="Send Order"
              className="flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              title="Send Order to Supplier"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}

          {(item.status === "ordered" || item.status === "partially_received") && (
            <button
              onClick={() => router.push(`/purchase-orders/${item.id}/receive`)}
              aria-label="Receive"
              className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              title="Receive Delivery"
            >
              <PackageCheck className="h-3.5 w-3.5" />
            </button>
          )}

          {item.status === "draft" && (
            <button
              onClick={() => setCancelId(item.id)}
              aria-label="Cancel"
              className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              title="Cancel Order"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage supplier purchase orders and stock intakes"
        action={{ label: "New Order", icon: Plus, href: "/purchase-orders/new" }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="ordered">Ordered</option>
          <option value="partially_received">Partially Received</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable columns={columns} data={pos} emptyMessage="No purchase orders found" />

      <ConfirmDialog
        open={cancelId !== null}
        title="Cancel purchase order?"
        description="This will cancel the purchase order and notify the supplier via Telegram if ordered. This action cannot be undone."
        variant="danger"
        confirmLabel="Cancel Order"
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}
