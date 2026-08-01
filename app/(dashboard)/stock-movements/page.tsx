"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { mockStockMovements } from "@/lib/mock-data";
import type { ApiStockMovement } from "@/lib/mock-data";

function getProductName(movement: ApiStockMovement): string {
  const p = movement.product;
  if ("strength" in p && p.strength) return `${p.name} ${p.strength}`;
  return p.name;
}

const typeConfig: Record<ApiStockMovement["type"], { label: string; className: string }> = {
  purchase: { label: "Purchase", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  sale: { label: "Sale", className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
  return: { label: "Return", className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  adjustment: { label: "Adjustment", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
  transfer_in: { label: "Transfer In", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  transfer_out: { label: "Transfer Out", className: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
};

export default function StockMovementsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = mockStockMovements.filter((m) => {
    const matchesSearch = getProductName(m).toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (item: ApiStockMovement) => (
        <span className="text-sm">{new Date(item.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (item: ApiStockMovement) => (
        <span className="font-medium text-sm">{getProductName(item)}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item: ApiStockMovement) => {
        const config = typeConfig[item.type];
        return (
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "quantity",
      header: "Qty",
      render: (item: ApiStockMovement) => (
        <span className={`font-medium text-sm ${item.type === "sale" || item.type === "transfer_out" || item.quantity < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {item.type === "sale" || item.type === "transfer_out" ? `-${item.quantity}` : item.quantity < 0 ? item.quantity : `+${item.quantity}`}
        </span>
      ),
    },
    {
      key: "user",
      header: "By",
      render: (item: ApiStockMovement) => (
        <span className="text-neutral-500 text-sm">{item.user.name}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "branch",
      header: "Branch",
      render: (item: ApiStockMovement) => (
        <span className="text-neutral-500 text-sm">{item.stock.branch.name}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "notes",
      header: "Notes",
      render: (item: ApiStockMovement) => (
        <span className="text-neutral-500 text-xs">{item.notes ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
  ];

  const purchaseCount = mockStockMovements.filter((m) => m.type === "purchase").length;
  const saleCount = mockStockMovements.filter((m) => m.type === "sale").length;
  const returnCount = mockStockMovements.filter((m) => m.type === "return").length;
  const transferCount = mockStockMovements.filter((m) => m.type === "transfer_in" || m.type === "transfer_out").length;
  const adjustmentCount = mockStockMovements.filter((m) => m.type === "adjustment").length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Stock Movements" subtitle="Track inventory changes" />

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {mockStockMovements.length} total
        </span>
        <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          {purchaseCount} purchases
        </span>
        <span className="rounded bg-red-50 px-2 py-1 text-red-700 dark:bg-red-950 dark:text-red-400">
          {saleCount} sales
        </span>
        {returnCount > 0 && (
          <span className="rounded bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            {returnCount} returns
          </span>
        )}
        {transferCount > 0 && (
          <span className="rounded bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
            {transferCount} transfers
          </span>
        )}
        {adjustmentCount > 0 && (
          <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {adjustmentCount} adjustments
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search movements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        >
          <option value="all">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="sale">Sale</option>
          <option value="return">Return</option>
          <option value="adjustment">Adjustment</option>
          <option value="transfer_in">Transfer In</option>
          <option value="transfer_out">Transfer Out</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No stock movements found"
          description="Try clearing your search query or selecting a different movement type."
        />
      ) : (
        <>
          <DataTable columns={columns} data={paginatedData} emptyMessage="No movements found" />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}
    </div>
  );
}


