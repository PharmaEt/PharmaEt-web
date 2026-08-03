"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiProduct, type ApiCategory } from "@/lib/mock-data";
import { getMedicines, deleteMedicine } from "@/lib/api/medicines";
import { getCategories } from "@/lib/api/categories";

export default function MedicinesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOwner, canManageCatalog } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [medicines, setMedicines] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const [medRes, catRes] = await Promise.all([
        getMedicines({ search, category_id: categoryFilter !== "all" ? categoryFilter : undefined }),
        getCategories({ type: "medicine" }).catch(() => ({ data: [] })),
      ]);
      setMedicines(medRes.data || []);
      if (catRes.data) {
        setCategories(catRes.data.filter((c) => c.type === "medicine"));
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load medicines catalog", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [categoryFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteMedicine(deleteId);
      toast(res.message || "Medicine deleted successfully", "success");
      setMedicines((prev) => prev.filter((m) => m.id !== deleteId));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to delete medicine", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = medicines.filter((m) => {
    const medicineDetails = m.productable as { generic_name?: string } | undefined;
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (medicineDetails?.generic_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || String(m.category_id) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: ApiProduct, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{index + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Medicine",
      render: (item: ApiProduct) => {
        const medicineDetails = item.productable as { generic_name?: string; strength?: string; dosage_form?: string; is_prescription_required?: boolean } | undefined;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium">{item.name}</span>
              {medicineDetails?.is_prescription_required && (
                <span className="inline-flex items-center rounded bg-red-50 px-1 py-0.2 text-[9px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">
                  Rx
                </span>
              )}
            </div>
            {medicineDetails?.generic_name && (
              <p className="text-[11px] text-neutral-500">{medicineDetails.generic_name}</p>
            )}
          </div>
        );
      },
    },
    {
      key: "dosage_form",
      header: "Form & Strength",
      render: (item: ApiProduct) => {
        const medicineDetails = item.productable as { strength?: string; dosage_form?: string } | undefined;
        const formStr = [medicineDetails?.dosage_form, medicineDetails?.strength].filter(Boolean).join(" - ");
        return <span className="text-sm text-neutral-600 dark:text-neutral-400">{formStr || "—"}</span>;
      },
      hideOnMobile: true,
    },
    {
      key: "category",
      header: "Category",
      render: (item: ApiProduct) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.category?.name ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "pack_size",
      header: "Pack Size",
      render: (item: ApiProduct) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.pack_size ?? 1}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "min_stock_alert",
      header: "Min Alert",
      render: (item: ApiProduct) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.min_stock_alert ?? 10}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: ApiProduct) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/medicines/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {canManageCatalog && (
            <button
              onClick={() => router.push(`/medicines/${item.id}`)}
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
        title="Medicines"
        subtitle="Manage pharmaceutical products"
        action={canManageCatalog ? { label: "Add Medicine", icon: Plus, href: "/medicines/new" } : undefined}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading medicines catalog..." : "No medicines found"} />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete medicine?"
        description="This will permanently remove this medicine from inventory."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
