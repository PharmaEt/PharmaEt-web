"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, Send, Truck, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const mockPOs = [
  { id: 1, supplier: "Ethio Pharma Distribution", date: "2026-07-25", items: 5, total: 45000, status: "received" },
  { id: 2, supplier: "Hawassa Medical Supplies", date: "2026-07-26", items: 3, total: 32000, status: "ordered" },
  { id: 3, supplier: "Ethio Pharma Distribution", date: "2026-07-27", items: 2, total: 18500, status: "draft" },
  { id: 4, supplier: "Dire Dawa Pharmaceuticals", date: "2026-07-28", items: 8, total: 67000, status: "partially_received" },
  { id: 5, supplier: "Hawassa Medical Supplies", date: "2026-07-24", items: 4, total: 28000, status: "ordered" },
];

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelId, setCancelId] = useState<number | null>(null);

  const filtered = mockPOs.filter((po) => {
    const matchesSearch = po.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
    ordered: { label: "Ordered", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
    partially_received: { label: "Partially Received", className: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
    received: { label: "Received", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
    cancelled: { label: "Cancelled", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
  };

  const columns = [
    {
      key: "id",
      header: "PO Number",
      render: (item: typeof mockPOs[0]) => (
        <span className="font-medium text-sm">PO-{String(item.id).padStart(3, "0")}</span>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (item: typeof mockPOs[0]) => (
        <span className="text-sm">{item.supplier}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item: typeof mockPOs[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.date}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "items",
      header: "Items",
      render: (item: typeof mockPOs[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.items}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "total",
      header: "Total",
      render: (item: typeof mockPOs[0]) => (
        <span className="font-medium text-sm">{item.total.toLocaleString()} ETB</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: typeof mockPOs[0]) => {
        const config = statusConfig[item.status] || statusConfig.pending;
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
      render: (item: typeof mockPOs[0]) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/purchase-orders/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
            title="View"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {item.status === "draft" && (
            <button
              onClick={() => router.push(`/purchase-orders/${item.id}`)}
              aria-label="Send Order"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
              title="Send Order"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}

          {(item.status === "ordered" || item.status === "partially_received") && (
            <button
              onClick={() => router.push(`/purchase-orders/${item.id}/receive`)}
              aria-label="Receive"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950"
              title="Delivery Track"
            >
              <Truck className="h-3.5 w-3.5" />
            </button>
          )}

          {item.status !== "received" && item.status !== "cancelled" && (
            <button
              onClick={() => setCancelId(item.id)}
              aria-label="Cancel"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              title="Cancel"
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
        subtitle="Manage supplier orders"
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
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No purchase orders found" />

      <ConfirmDialog
        open={cancelId !== null}
        title="Cancel purchase order?"
        description="This will cancel the purchase order. This action cannot be undone."
        onConfirm={() => setCancelId(null)}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}
