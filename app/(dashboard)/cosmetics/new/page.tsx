"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { createCosmetic } from "@/lib/api/cosmetics";
import { getCategories } from "@/lib/api/categories";
import { getBranches } from "@/lib/api/branches";
import { extractListData } from "@/lib/api/client";
import { type ApiCategory, type ApiBranch } from "@/lib/types";

export default function NewCosmeticPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOwner, user } = useAuth();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    branch_id: "",
    sku: "",
    barcode: "",
    pack_size: "1",
    min_stock_alert: "10",
    description: "",
    status: "active",
    product_type: "Skincare",
    size: "",
    unit: "item",
    color: "",
    shade: "",
    ingredients: "",
  });

  useEffect(() => {
    async function loadLookups() {
      try {
        const [catRes, branchRes] = await Promise.all([
          getCategories({ type: "cosmetic" }).catch(() => ({ data: [] })),
          getBranches().catch(() => ({ data: [] })),
        ]);
        setCategories(extractListData<ApiCategory>(catRes).filter((c) => c.type === "cosmetic"));
        setBranches(extractListData<ApiBranch>(branchRes));
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load form lookups", "error");
      }
    }
    loadLookups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category_id) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCosmetic({
        name: form.name,
        category_id: Number(form.category_id),
        product_type: form.product_type || null,
        size: form.size || null,
        unit: form.unit || "item",
        color: form.color || null,
        shade: form.shade || null,
        ingredients: form.ingredients || null,
        branch_id: isOwner ? (form.branch_id ? Number(form.branch_id) : null) : (user?.branch_id ?? null),
        pack_size: Number(form.pack_size) || 1,
        min_stock_alert: Number(form.min_stock_alert) || 10,
        sku: form.sku || null,
        barcode: form.barcode || null,
        description: form.description || null,
        status: form.status as "active" | "inactive",
      });

      toast("Cosmetic created successfully", "success");
      router.push("/cosmetics");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create cosmetic", "error");
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Add Cosmetic</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Add a new cosmetic product</p>
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
                placeholder="e.g., Nivea Soft Cream"
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
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
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
                  value={form.product_type}
                  onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
                >
                  <option value="Skincare">Skincare</option>
                  <option value="Haircare">Haircare</option>
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
                  Branch Assignment
                </label>
                <select
                  id="branch"
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
                >
                  <option value="">Global / All Branches</option>
                  {branches.map((b) => (
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
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g., NIVEA-SOFT-100"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 font-mono"
                />
              </div>

              <div>
                <label htmlFor="barcode" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Barcode
                </label>
                <input
                  id="barcode"
                  type="text"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="e.g., 6902064650039"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 font-mono"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="size" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Size
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
                  Unit
                </label>
                <input
                  id="unit"
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g., tube, bottle, item"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="color" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Color
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
                  Shade
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pack_size" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Pack Size
                </label>
                <input
                  id="pack_size"
                  type="number"
                  min="1"
                  value={form.pack_size}
                  onChange={(e) => setForm({ ...form, pack_size: e.target.value })}
                  placeholder="1"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="min_stock_alert" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Min Stock Alert
                </label>
                <input
                  id="min_stock_alert"
                  type="number"
                  min="0"
                  value={form.min_stock_alert}
                  onChange={(e) => setForm({ ...form, min_stock_alert: e.target.value })}
                  placeholder="10"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ingredients" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Ingredients
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
                Description
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
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {isSubmitting ? "Creating..." : "Add Cosmetic"}
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
