"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockCosmetics, mockCategories, mockBranches } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";

export default function CosmeticDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const cosmetic = mockCosmetics.find((c) => c.id === Number(params.id));

  const [form, setForm] = useState({
    name: cosmetic?.name ?? "",
    category_id: cosmetic?.category_id?.toString() ?? "",
    branch_id: cosmetic?.branch_id?.toString() ?? "",
    sku: cosmetic?.sku ?? "",
    barcode: cosmetic?.barcode ?? "",
    pack_price: cosmetic?.pack_price?.toString() ?? "",
    unit_price: cosmetic?.unit_price?.toString() ?? "",
    description: cosmetic?.description ?? "",
    min_stock_alert: cosmetic?.min_stock_alert?.toString() ?? "",
    status: cosmetic?.status ?? "active",
    product_type: cosmetic?.product_type ?? "",
    size: cosmetic?.size ?? "",
    unit: cosmetic?.unit ?? "",
    color: cosmetic?.color ?? "",
    shade: cosmetic?.shade ?? "",
    ingredients: cosmetic?.ingredients ?? "",
  });

  if (!cosmetic) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Cosmetic Not Found</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">The cosmetic you are looking for does not exist.</p>
        <Link
          href="/cosmetics"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Cosmetic updated successfully");
    router.push("/cosmetics");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Edit Cosmetic</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Update cosmetic product information</p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Category
                </label>
                <select
                  id="category"
                  required
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                >
                  <option value="" disabled>Select category</option>
                  {mockCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="product_type" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Product Type
                </label>
                <select
                  id="product_type"
                  required
                  value={form.product_type}
                  onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                >
                  <option value="" disabled>Select type</option>
                  <option value="Cream">Cream</option>
                  <option value="Lotion">Lotion</option>
                  <option value="Shampoo">Shampoo</option>
                  <option value="Conditioner">Conditioner</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Lip Care">Lip Care</option>
                  <option value="Serum">Serum</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {isOwner && (
              <div>
                <label htmlFor="branch" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Branch
                </label>
                <select
                  id="branch"
                  required
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                >
                  <option value="" disabled>Select branch</option>
                  {mockBranches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sku" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  SKU
                </label>
                <input
                  id="sku"
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 font-mono"
                />
              </div>

              <div>
                <label htmlFor="barcode" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Barcode <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="barcode"
                  type="text"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 font-mono"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pack_price" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Pack Price (ETB)
                </label>
                <input
                  id="pack_price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.pack_price}
                  onChange={(e) => setForm({ ...form, pack_price: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="unit_price" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Unit Price (ETB)
                </label>
                <input
                  id="unit_price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.unit_price}
                  onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="size" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Size <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="size"
                  type="text"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  placeholder="e.g., 100ml"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="unit" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Unit <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="unit"
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g., tube, bottle"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="color" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Color <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="color"
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="e.g., Pink"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="shade" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Shade <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="shade"
                  type="text"
                  value={form.shade}
                  onChange={(e) => setForm({ ...form, shade: e.target.value })}
                  placeholder="e.g., Rosy"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ingredients" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Ingredients <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="ingredients"
                rows={2}
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                placeholder="e.g., Water, Glycerin, Mineral Oil"
                className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description..."
                className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="min_stock_alert" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Min Stock Alert
                </label>
                <input
                  id="min_stock_alert"
                  type="number"
                  required
                  min="0"
                  value={form.min_stock_alert}
                  onChange={(e) => setForm({ ...form, min_stock_alert: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Update Cosmetic
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md bg-transparent px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
