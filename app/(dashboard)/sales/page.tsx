"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { mockSales } from "@/lib/mock-data";
import type { ApiSale } from "@/lib/mock-data";

export default function SalesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = mockSales.filter((s) =>
    s.served_by.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      header: "Sale #",
      render: (item: ApiSale) => (
        <span className="font-medium text-sm">SALE-{String(item.id).padStart(3, "0")}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item: ApiSale) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "served_by",
      header: "Served By",
      render: (item: ApiSale) => (
        <span className="text-sm">{item.served_by.name}</span>
      ),
    },
    {
      key: "payment_type",
      header: "Payment",
      render: (item: ApiSale) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {item.payment_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "items",
      header: "Items",
      render: (item: ApiSale) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.items.length}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "total",
      header: "Total",
      render: (item: ApiSale) => (
        <span className="font-medium text-sm">
          {parseFloat(item.total).toLocaleString()} ETB
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (item: ApiSale) => (
        <button
          onClick={() => router.push(`/sales/${item.id}`)}
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
      <PageHeader title="Sales History" subtitle="View all transactions" />

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        />
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No sales found" />
    </div>
  );
}
