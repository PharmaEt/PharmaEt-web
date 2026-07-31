"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { mockMedicines, mockSuppliers, mockBranches } from "@/lib/mock-data";

const movementTypes: Array<"in" | "out" | "transfer"> = ["in", "out", "transfer"];
const movementDates = ["2026-07-28", "2026-07-27", "2026-07-26", "2026-07-25"];
const movementNotes = ["PO-001 delivery", "POS sale", "PO-002 delivery", "Inter-branch transfer", "PO-003 delivery", "PO-004 delivery"];

const mockMovements = mockMedicines.map((m, i) => {
  const type = movementTypes[i % movementTypes.length];
  const supplier = mockSuppliers[i % mockSuppliers.length];
  const branch = m.branch ?? mockBranches[0];
  return {
    id: m.id,
    medicine: `${m.name} ${m.strength}`,
    type,
    quantity: type === "out" ? Math.floor(m.current_stock * 0.05) + 1 : Math.floor(m.current_stock * 0.3) + 10,
    from: type === "out" ? branch.name : supplier.name,
    to: type === "out" ? "Sold" : type === "in" ? branch.name : mockBranches.filter((b) => b.id !== branch.id)[0]?.name ?? branch.name,
    date: movementDates[i % movementDates.length],
    note: movementNotes[i % movementNotes.length],
  };
});

export default function StockMovementsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = mockMovements.filter((m) => {
    const matchesSearch = m.medicine.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeConfig = {
    in: { label: "Stock In", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
    out: { label: "Stock Out", className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
    transfer: { label: "Transfer", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  };

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (item: typeof mockMovements[0]) => (
        <span className="text-sm">{item.date}</span>
      ),
    },
    {
      key: "medicine",
      header: "Medicine",
      render: (item: typeof mockMovements[0]) => (
        <span className="font-medium text-sm">{item.medicine}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item: typeof mockMovements[0]) => {
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
      render: (item: typeof mockMovements[0]) => (
        <span className="font-medium text-sm">{item.quantity}</span>
      ),
    },
    {
      key: "from",
      header: "From",
      render: (item: typeof mockMovements[0]) => (
        <span className="text-neutral-500 text-sm">{item.from}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "to",
      header: "To",
      render: (item: typeof mockMovements[0]) => (
        <span className="text-neutral-500 text-sm">{item.to}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "note",
      header: "Note",
      render: (item: typeof mockMovements[0]) => (
        <span className="text-neutral-500 text-xs">{item.note}</span>
      ),
      hideOnMobile: true,
    },
  ];

  const inCount = mockMovements.filter((m) => m.type === "in").length;
  const outCount = mockMovements.filter((m) => m.type === "out").length;
  const transferCount = mockMovements.filter((m) => m.type === "transfer").length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Stock Movements" subtitle="Track inventory changes" />

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {mockMovements.length} total
        </span>
        <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          {inCount} in
        </span>
        <span className="rounded bg-red-50 px-2 py-1 text-red-700 dark:bg-red-950 dark:text-red-400">
          {outCount} out
        </span>
        <span className="rounded bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
          {transferCount} transfers
        </span>
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
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No movements found" />
    </div>
  );
}
