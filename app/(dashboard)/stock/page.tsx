"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";

const mockStock = [
  { id: 1, medicine: "Paracetamol 500mg", supplier: "Ethio Pharma Distribution", in_stock: 120, min: 20, batch: "BN-2026A", expiry: "2026-10-01", status: "ok" },
  { id: 2, medicine: "Amoxicillin 500mg", supplier: "Hawassa Medical Supplies", in_stock: 5, min: 15, batch: "BN-2026B", expiry: "2026-11-01", status: "low" },
  { id: 3, medicine: "Omeprazole 20mg", supplier: "Ethio Pharma Distribution", in_stock: 2, min: 10, batch: "BN-2025C", expiry: "2026-08-15", status: "low" },
  { id: 4, medicine: "Cetirizine 10mg", supplier: "Dire Dawa Pharmaceuticals", in_stock: 45, min: 10, batch: "BN-2026D", expiry: "2026-12-01", status: "ok" },
  { id: 5, medicine: "Amlodipine 5mg", supplier: "Ethio Pharma Distribution", in_stock: 3, min: 12, batch: "BN-2026E", expiry: "2027-01-20", status: "low" },
  { id: 6, medicine: "Metformin 500mg", supplier: "Hawassa Medical Supplies", in_stock: 80, min: 25, batch: "BN-2026F", expiry: "2027-03-01", status: "ok" },
  { id: 7, medicine: "Loratadine 10mg", supplier: "Dire Dawa Pharmaceuticals", in_stock: 60, min: 15, batch: "BN-2026G", expiry: "2027-06-01", status: "ok" },
  { id: 8, medicine: "Ciprofloxacin 500mg", supplier: "Ethio Pharma Distribution", in_stock: 35, min: 20, batch: "BN-2026H", expiry: "2027-02-01", status: "ok" },
  { id: 9, medicine: "Salbutamol Inhaler", supplier: "Hawassa Medical Supplies", in_stock: 25, min: 10, batch: "BN-2026I", expiry: "2027-04-01", status: "ok" },
  { id: 10, medicine: "Ibuprofen 400mg", supplier: "Dire Dawa Pharmaceuticals", in_stock: 15, min: 20, batch: "BN-2026J", expiry: "2026-09-15", status: "low" },
];

export default function StockPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = mockStock.filter((s) => {
    const matchesSearch = s.medicine.toLowerCase().includes(search.toLowerCase());
    if (filter === "low") return matchesSearch && s.in_stock <= s.min;
    if (filter === "ok") return matchesSearch && s.in_stock > s.min;
    return matchesSearch;
  });

  const columns = [
    {
      key: "medicine",
      header: "Medicine",
      render: (item: typeof mockStock[0]) => (
        <span className="text-sm font-medium">{item.medicine}</span>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (item: typeof mockStock[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.supplier}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "in_stock",
      header: "In Stock (Units)",
      render: (item: typeof mockStock[0]) => {
        const isLow = item.in_stock <= item.min;
        return (
          <span className={`text-sm font-medium ${isLow ? "text-red-600 dark:text-red-400" : ""}`}>
            {item.in_stock}
          </span>
        );
      },
    },
    {
      key: "min",
      header: "Min",
      render: (item: typeof mockStock[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.min}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "batch",
      header: "Batch",
      render: (item: typeof mockStock[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">{item.batch}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "expiry",
      header: "Expiry",
      render: (item: typeof mockStock[0]) => {
        const daysLeft = Math.ceil((new Date(item.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysLeft <= 90;
        return (
          <span className={`text-sm ${isUrgent ? "text-amber-600 dark:text-amber-400" : "text-neutral-600 dark:text-neutral-400"}`}>
            {item.expiry}
          </span>
        );
      },
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (item: typeof mockStock[0]) => {
        const isLow = item.in_stock <= item.min;
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
      render: (item: typeof mockStock[0]) => (
        <button
          onClick={() => router.push(`/stock/${item.id}`)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Stock" subtitle="Current inventory levels" />

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
