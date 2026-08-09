"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiProduct, type ApiCategory } from "@/lib/types";
import { getMedicines, deleteMedicine } from "@/lib/api/medicines";
import { getCategories } from "@/lib/api/categories";

import { extractListData, extractPaginationMeta } from "@/lib/api/client";
import { Pagination } from "@/components/ui/pagination";

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

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 });

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const [medRes, catRes] = await Promise.all([
        getMedicines({ search, category_id: categoryFilter !== "all" ? categoryFilter : undefined, page, per_page: perPage }),
        getCategories({ type: "medicine" }).catch(() => ({ data: [] })),
      ]);
      const list = extractListData<ApiProduct>(medRes);
      setMedicines(list);
      setMeta(extractPaginationMeta(medRes, list.length));

      const catList = extractListData<ApiCategory>(catRes);
      if (catList.length > 0) {
        setCategories(catList.filter((c) => c.type === "medicine"));
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load medicines catalog", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search, categoryFilter, page, perPage]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMedicine(deleteId);
      toast("Medicine deleted successfully", "success");
      setDeleteId(null);
      fetchMedicines();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to delete medicine", "error");
    }
  };

  const filtered = medicines.filter((m) => {
    const details = (m as any).details || (m as any).productable;
    const genericName = details?.generic_name ?? "";
    const brandName = m.name ?? "";
    const matchesSearch = brandName.toLowerCase().includes(search.toLowerCase()) || genericName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: ApiProduct, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{(page - 1) * perPage + index + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Medicine Name",
      render: (item: ApiProduct) => {
        const details = (item as any).details || (item as any).productable;
        return (
          <div>
            <p className="font-medium text-sm">{item.name}</p>
            {details?.generic_name && (
              <p className="text-xs text-neutral-400 font-mono">{details.generic_name}</p>
            )}
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Category",
      render: (item: ApiProduct) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{(item as any).category?.name ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "dosage",
      header: "Form / Strength",
      render: (item: ApiProduct) => {
        const details = (item as any).details || (item as any).productable;
        const form = details?.dosage_form ?? "—";
        const strength = details?.strength ?? "";
        return <span className="text-sm text-neutral-600 dark:text-neutral-400">{form} {strength}</span>;
      },
      hideOnMobile: true,
    },
    {
      key: "pack_size",
      header: "Pack Size",
      render: (item: ApiProduct) => (
        <span className="text-sm font-medium">{(item as any).pack_size ?? 1} Units/Pack</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "prescription",
      header: "Prescription",
      render: (item: ApiProduct) => {
        const details = (item as any).details || (item as any).productable;
        const isRx = details?.is_prescription_required;
        return (
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
            isRx ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
          }`}>
            {isRx ? "Rx Required" : "OTC"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: ApiProduct) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/medicines/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {canManageCatalog && (
            <button
              onClick={() => router.push(`/medicines/${item.id}/edit`)}
              aria-label="Edit"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => setDeleteId(item.id)}
              aria-label="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
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
        title="Medicines Catalog"
        subtitle="Manage pharmaceutical catalog, generic names, and dosage forms"
        action={canManageCatalog ? { label: "Add Medicine", icon: Plus, href: "/medicines/new" } : undefined}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading medicines catalog..." : "No medicines found"} />
      <Pagination
        currentPage={meta.currentPage}
        lastPage={meta.lastPage}
        total={meta.total}
        perPage={meta.perPage}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setPage(1);
        }}
      />

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
