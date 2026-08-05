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
import { getCosmetics, deleteCosmetic } from "@/lib/api/cosmetics";
import { getCategories } from "@/lib/api/categories";
import { extractListData, extractPaginationMeta } from "@/lib/api/client";
import { Pagination } from "@/components/ui/pagination";

export default function CosmeticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOwner, canManageCatalog } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cosmetics, setCosmetics] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 });

  const fetchCosmetics = async () => {
    setIsLoading(true);
    try {
      const [cosRes, catRes] = await Promise.all([
        getCosmetics({ search, category_id: categoryFilter !== "all" ? categoryFilter : undefined, page, per_page: perPage }),
        getCategories({ type: "cosmetic" }).catch(() => ({ data: [] })),
      ]);
      const list = extractListData<ApiProduct>(cosRes);
      setCosmetics(list);
      setMeta(extractPaginationMeta(cosRes, list.length));

      const catList = extractListData<ApiCategory>(catRes);
      if (catList.length > 0) {
        setCategories(catList.filter((c) => c.type === "cosmetic"));
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load cosmetics catalog", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCosmetics();
  }, [search, categoryFilter, page, perPage]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCosmetic(deleteId);
      toast("Cosmetic deleted successfully", "success");
      setDeleteId(null);
      fetchCosmetics();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to delete cosmetic", "error");
    }
  };

  const filtered = cosmetics.filter((c) => {
    const brandName = c.name ?? "";
    return brandName.toLowerCase().includes(search.toLowerCase());
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
      header: "Cosmetic Name",
      render: (item: ApiProduct) => (
        <span className="font-medium text-sm">{item.name}</span>
      ),
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
      key: "type",
      header: "Type / Size",
      render: (item: ApiProduct) => {
        const details = (item as any).details || (item as any).productable;
        const pType = details?.product_type ?? "—";
        const size = details?.size ?? "";
        const unit = details?.unit ?? "";
        return <span className="text-sm text-neutral-600 dark:text-neutral-400">{pType} {size} {unit}</span>;
      },
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: ApiProduct) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/cosmetics/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {canManageCatalog && (
            <button
              onClick={() => router.push(`/cosmetics/${item.id}/edit`)}
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
        title="Cosmetics Catalog"
        subtitle="Manage skincare, personal care, and beauty products"
        action={canManageCatalog ? { label: "Add Cosmetic", icon: Plus, href: "/cosmetics/new" } : undefined}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search cosmetics..."
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
          <option value="all">All Cosmetic Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading cosmetics catalog..." : "No cosmetics found"} />
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
        title="Delete cosmetic?"
        description="This will permanently remove this cosmetic from inventory."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
