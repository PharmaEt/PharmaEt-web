"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { mockStock } from "@/lib/mock-data";
import type { ApiStock } from "@/lib/mock-data";

function getProductName(stock: ApiStock): string {
  const p = stock.product;
  if ("strength" in p && p.strength) return `${p.name} ${p.strength}`;
  return p.name;
}

function getProductForm(stock: ApiStock): string {
  const p = stock.product;
  if ("dosage_form" in p) return p.dosage_form;
  if ("product_type" in p) return p.product_type;
  return "—";
}

export default function StockPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = mockStock.filter((s) => {
    const name = getProductName(s).toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    if (filter === "low") return matchesSearch && s.quantity <= s.product.min_stock_alert;
    if (filter === "ok") return matchesSearch && s.quantity > s.product.min_stock_alert;
    return matchesSearch;
  });

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (item: ApiStock) => (
        <span className="text-sm font-medium">{getProductName(item)}</span>
      ),
    },
    {
      key: "form",
      header: "Form",
      render: (item: ApiStock) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{getProductForm(item)}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (item: ApiStock) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.supplier?.name ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "quantity",
      header: "In Stock",
      render: (item: ApiStock) => {
        const isLow = item.quantity <= item.product.min_stock_alert;
        return (
          <span className={`text-sm font-medium ${isLow ? "text-red-600 dark:text-red-400" : ""}`}>
            {item.quantity}
          </span>
        );
      },
    },
    {
      key: "min",
      header: "Min",
      render: (item: ApiStock) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.product.min_stock_alert}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "batch",
      header: "Batch",
      render: (item: ApiStock) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">{item.batch_number ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "expiry",
      header: "Expiry",
      render: (item: ApiStock) => {
        if (!item.expiry_date) return <span className="text-sm text-neutral-400">—</span>;
        const daysLeft = Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysLeft <= 90;
        return (
          <span className={`text-sm ${isUrgent ? "text-amber-600 dark:text-amber-400" : "text-neutral-600 dark:text-neutral-400"}`}>
            {item.expiry_date}
          </span>
        );
      },
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (item: ApiStock) => {
        const isLow = item.quantity <= item.product.min_stock_alert;
        return (
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
            isLow
              ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          }`}>
            {isLow ? "LOW" : "OK"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (item: ApiStock) => (
        <button
          onClick={() => router.push(`/stock/${item.id}`)}
          aria-label="View"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Stock"
        subtitle="Current inventory levels"
        action={{ label: "Add Stock", icon: Plus, href: "/stock/new" }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        >
          <option value="all">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="ok">Normal Stock</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No stock data found" />
    </div>
  );
}
