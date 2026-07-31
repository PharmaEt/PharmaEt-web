"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";

const mockSales = [
  { id: 1, date: "2026-07-28", cashier: "Omar Ibrahim", payment: "Cash", prescription: "No", items: 3, total: 450 },
  { id: 2, date: "2026-07-28", cashier: "Omar Ibrahim", payment: "Telebirr", prescription: "Yes", items: 1, total: 120 },
  { id: 3, date: "2026-07-28", cashier: "Daniel Kebede", payment: "Cash", prescription: "No", items: 5, total: 890 },
  { id: 4, date: "2026-07-28", cashier: "Omar Ibrahim", payment: "CBE Birr", prescription: "No", items: 2, total: 340 },
  { id: 5, date: "2026-07-28", cashier: "Daniel Kebede", payment: "Cash", prescription: "Yes", items: 4, total: 670 },
  { id: 6, date: "2026-07-27", cashier: "Omar Ibrahim", payment: "Telebirr", prescription: "No", items: 1, total: 85 },
  { id: 7, date: "2026-07-27", cashier: "Daniel Kebede", payment: "Cash", prescription: "No", items: 6, total: 1200 },
  { id: 8, date: "2026-07-27", cashier: "Omar Ibrahim", payment: "CBE Birr", prescription: "Yes", items: 2, total: 290 },
  { id: 9, date: "2026-07-26", cashier: "Daniel Kebede", payment: "Cash", prescription: "No", items: 3, total: 520 },
  { id: 10, date: "2026-07-26", cashier: "Omar Ibrahim", payment: "Telebirr", prescription: "No", items: 1, total: 150 },
];

export default function SalesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = mockSales.filter((s) =>
    s.cashier.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      header: "Sale #",
      render: (item: typeof mockSales[0]) => (
        <span className="font-medium text-sm">SALE-{String(item.id).padStart(3, "0")}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item: typeof mockSales[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.date}</span>
      ),
    },
    {
      key: "cashier",
      header: "Cashier",
      render: (item: typeof mockSales[0]) => (
        <span className="text-sm">{item.cashier}</span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (item: typeof mockSales[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.payment}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "prescription",
      header: "Prescription",
      render: (item: typeof mockSales[0]) => (
        item.prescription === "Yes" ? (
          <span className="inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400">Rx</span>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        )
      ),
      hideOnMobile: true,
    },
    {
      key: "items",
      header: "Items",
      render: (item: typeof mockSales[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.items}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "total",
      header: "Total",
      render: (item: typeof mockSales[0]) => (
        <span className="font-medium text-sm">{item.total.toLocaleString()} ETB</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (item: typeof mockSales[0]) => (
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
          placeholder="Search by cashier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        />
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No sales found" />
    </div>
  );
}
