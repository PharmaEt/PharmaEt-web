"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getCategories } from "@/lib/api/categories";
import { getCosmetic, updateCosmetic } from "@/lib/api/cosmetics";
import type { ApiCategory, ApiProduct } from "@/lib/mock-data";

export default function CosmeticEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [cosmetic, setCosmetic] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    product_type: "",
    sku: "",
    barcode: "",
    size: "",
    unit: "",
    color: "",
    shade: "",
    min_stock_alert: "",
    ingredients: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [catRes, cosRes] = await Promise.all([
          getCategories(),
          getCosmetic(params.id as string),
        ]);
        const catList = Array.isArray(catRes.data) ? catRes.data : (catRes.data as any)?.data || [];
        setCategories(catList);

        const cos = cosRes.data;
        setCosmetic(cos);
        const details = (cos.productable as any) || (cos as any).details || {};

        setForm({
          name: cos.name ?? "",
          category_id: cos.category_id ? String(cos.category_id) : "",
          product_type: details.product_type ?? "",
          sku: cos.sku ?? "",
          barcode: cos.barcode ?? "",
          size: details.size ?? "",
          unit: details.unit ?? "",
          color: details.color ?? "",
          shade: details.shade ?? "",
          min_stock_alert: cos.min_stock_alert ? String(cos.min_stock_alert) : "10",
          ingredients: details.ingredients ?? "",
          description: cos.description ?? "",
          status: cos.status ?? "active",
        });
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load cosmetic details", "error");
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) {
      toast("Please select a category", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCosmetic(params.id as string, {
        name: form.name,
        category_id: Number(form.category_id),
        product_type: form.product_type || undefined,
        sku: form.sku || undefined,
        barcode: form.barcode || undefined,
        size: form.size || undefined,
        unit: form.unit || undefined,
        color: form.color || undefined,
        shade: form.shade || undefined,
        min_stock_alert: form.min_stock_alert ? Number(form.min_stock_alert) : undefined,
        ingredients: form.ingredients || undefined,
        description: form.description || undefined,
        status: form.status,
      });
      toast("Cosmetic updated successfully", "success");
      router.push("/cosmetics");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update cosmetic", "error");
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
                <label htmlFor="size" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Size <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="size"
                  type="text"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
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
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

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
              <label htmlFor="ingredients" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Ingredients <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="ingredients"
                rows={2}
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
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
                className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
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
