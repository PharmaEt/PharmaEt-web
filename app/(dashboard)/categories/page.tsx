"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiCategory } from "@/lib/mock-data";
import { getCategories, deleteCategory } from "@/lib/api/categories";

export default function CategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { canManageCatalog } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteCategory(deleteId);
      toast(res.message || "Category deleted successfully", "success");
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to delete category", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: ApiCategory, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{index + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (item: ApiCategory) => (
        <span className="text-sm font-medium">{item.name}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item: ApiCategory) => (
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
          item.type === "medicine"
            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            : "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-400"
        }`}>
          {item.type === "medicine" ? "Medicine" : "Cosmetic"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "description",
      header: "Description",
      render: (item: ApiCategory) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[250px] block">{item.description ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: ApiCategory) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/categories/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {canManageCatalog && (
            <>
              <button
                onClick={() => router.push(`/categories/${item.id}`)}
                aria-label="Edit"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
                aria-label="Delete"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Manage product categories"
        action={canManageCatalog ? { label: "Add Category", icon: Plus, href: "/categories/new" } : undefined}
      />

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        />
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading categories..." : "No categories found"} />

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
