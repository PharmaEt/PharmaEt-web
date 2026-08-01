"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { mockCosmetics, mockCategories } from "@/lib/mock-data";

export default function CosmeticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cosmetics, setCosmetics] = useState(mockCosmetics);

  const filtered = cosmetics.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || String(c.category_id) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (item: typeof mockCosmetics[0]) => (
        <span className="font-medium text-sm">{item.id}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (item: typeof mockCosmetics[0]) => (
        <span className="text-sm font-medium">{item.name}</span>
      ),
    },
    {
      key: "product_type",
      header: "Type",
      render: (item: typeof mockCosmetics[0]) => (
        <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {item.product_type}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "sku",
      header: "SKU",
      render: (item: typeof mockCosmetics[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">{item.sku}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "category",
      header: "Category",
      render: (item: typeof mockCosmetics[0]) => {
        const cat = item.category ?? mockCategories.find((c) => c.id === item.category_id);
        return <span className="text-sm text-neutral-600 dark:text-neutral-400">{cat?.name ?? "—"}</span>;
      },
      hideOnMobile: true,
    },
    {
      key: "pack_price",
      header: "Price",
      render: (item: typeof mockCosmetics[0]) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.pack_price.toLocaleString()} ETB</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "current_stock",
      header: "Stock",
      render: (item: typeof mockCosmetics[0]) => {
        const isLow = item.current_stock <= item.min_stock_alert;
        return (
          <span className={`text-sm font-medium ${isLow ? "text-red-600 dark:text-red-400" : ""}`}>
            {item.current_stock}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: typeof mockCosmetics[0]) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/cosmetics/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => router.push(`/cosmetics/${item.id}/edit`)}
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
        title="Cosmetics"
        subtitle="Manage cosmetic and beauty products"
        action={{ label: "Add Cosmetic", icon: Plus, href: "/cosmetics/new" }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search cosmetics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        >
          <option value="all">All Categories</option>
          {mockCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No cosmetics found" />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete cosmetic?"
        description="This will permanently remove this cosmetic from inventory."
        onConfirm={() => {
          setCosmetics((prev) => prev.filter((c) => c.id !== deleteId));
          setDeleteId(null);
          toast("Cosmetic deleted successfully");
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
