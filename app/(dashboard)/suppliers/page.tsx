"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { mockSuppliers } from "@/lib/mock-data";

export default function SuppliersPage() {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = mockSuppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_person ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (item: typeof mockSuppliers[0]) => (
        <span className="font-medium text-sm">{item.id}</span>
      ),
    },
    {
      key: "name",
      header: "Company",
      render: (item: typeof mockSuppliers[0]) => (
        <div>
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-[11px] text-neutral-500">{item.address ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (item: typeof mockSuppliers[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.phone ?? "—"}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (item: typeof mockSuppliers[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.email ?? "—"}</span>
      ),
    },
    {
      key: "contact_person",
      header: "Contact",
      render: (item: typeof mockSuppliers[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.contact_person ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: (item: typeof mockSuppliers[0]) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/suppliers/${item.id}`)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteId(item.id)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage pharmaceutical suppliers"
        action={{ label: "Add Supplier", icon: Plus, href: "/suppliers/new" }}
      />

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        />
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No suppliers found" />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete supplier?"
        description="This will permanently remove this supplier. This cannot be undone."
        onConfirm={() => setDeleteId(null)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
