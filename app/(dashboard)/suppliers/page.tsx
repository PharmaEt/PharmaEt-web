"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiSupplier } from "@/lib/mock-data";
import { getSuppliers, deleteSupplier } from "@/lib/api/suppliers";

export default function SuppliersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOwner, canManageCatalog } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await getSuppliers();
      setSuppliers(res.data || []);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load suppliers", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteSupplier(deleteId);
      toast(res.message || "Supplier deleted successfully", "success");
      setSuppliers((prev) => prev.filter((s) => s.id !== deleteId));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to delete supplier", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_person ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: ApiSupplier, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{index + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Company",
      render: (item: ApiSupplier) => (
        <div>
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-[11px] text-neutral-500">{item.address ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (item: ApiSupplier) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.phone ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "email",
      header: "Email",
      render: (item: ApiSupplier) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.email ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "contact_person",
      header: "Contact",
      render: (item: ApiSupplier) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.contact_person ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: ApiSupplier) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/suppliers/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {canManageCatalog && (
            <button
              onClick={() => router.push(`/suppliers/${item.id}`)}
              aria-label="Edit"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => setDeleteId(item.id)}
              aria-label="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage pharmaceutical suppliers"
        action={canManageCatalog ? { label: "Add Supplier", icon: Plus, href: "/suppliers/new" } : undefined}
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

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading suppliers..." : "No suppliers found"} />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete supplier?"
        description="This will permanently remove this supplier. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
