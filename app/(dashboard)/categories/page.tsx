"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { mockCategories, mockMedicines } from "@/lib/mock-data";

export default function CategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(mockCategories);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (item: typeof mockCategories[0]) => (
        <span className="font-medium text-sm">{item.id}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (item: typeof mockCategories[0]) => (
        <span className="text-sm font-medium">{item.name}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (item: typeof mockCategories[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[250px] block">{item.description ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "medicines",
      header: "Medicines",
      render: (item: typeof mockCategories[0]) => {
        const count = mockMedicines.filter((m) => m.category_id === item.id).length;
        return <span className="text-sm text-neutral-600 dark:text-neutral-400">{count}</span>;
      },
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: typeof mockCategories[0]) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/categories/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Manage medicine categories"
        action={{ label: "Add Category", icon: Plus, href: "/categories/new" }}
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

      <DataTable columns={columns} data={filtered} emptyMessage="No categories found" />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete category?"
        description="This will permanently remove this category. Medicines in this category will be affected."
        onConfirm={() => {
          setCategories((prev) => prev.filter((c) => c.id !== deleteId));
          setDeleteId(null);
          toast("Category deleted successfully");
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
