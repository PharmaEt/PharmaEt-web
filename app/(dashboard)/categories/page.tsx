"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiCategory } from "@/lib/types";
import { getCategories, deleteCategory } from "@/lib/api/categories";
import { extractListData, extractPaginationMeta } from "@/lib/api/client";
import { Pagination } from "@/components/ui/pagination";

export default function CategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { canManageCatalog } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await getCategories({ page, per_page: perPage });
      const list = extractListData<ApiCategory>(res);
      setCategories(list);
      setMeta(extractPaginationMeta(res, list.length));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, perPage]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteCategory(deleteId);
      toast(res.message || "Category deleted successfully", "success");
      setDeleteId(null);
      fetchCategories();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to delete category", "error");
    }
  };

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: ApiCategory, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{(page - 1) * perPage + index + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Category Name",
      render: (item: ApiCategory) => (
        <span className="font-medium text-sm">{item.name}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item: ApiCategory) => (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 capitalize">
          {item.type}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: ApiCategory) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/categories/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {canManageCatalog && (
            <button
              onClick={() => router.push(`/categories/${item.id}/edit`)}
              aria-label="Edit"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {canManageCatalog && (
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
        title="Product Categories"
        subtitle="Manage medicine and cosmetic classification categories"
        action={canManageCatalog ? { label: "Add Category", icon: Plus, href: "/categories/new" } : undefined}
      />

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        />
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading categories..." : "No categories found"} />
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
        title="Delete category?"
        description="This will permanently remove this category. Products in this category may be affected."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
