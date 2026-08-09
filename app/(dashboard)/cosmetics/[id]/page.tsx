"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { getCosmetic, updateCosmetic } from "@/lib/api/cosmetics";
import { getCategories } from "@/lib/api/categories";
import { extractListData } from "@/lib/api/client";
import { type ApiProduct, type ApiCategory } from "@/lib/types";

export default function CosmeticDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { canManageCatalog } = useAuth();
  const [cosmetic, setCosmetic] = useState<ApiProduct | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    product_type: "Skincare",
    size: "",
    unit: "item",
    color: "",
    shade: "",
    ingredients: "",
    pack_size: "1",
    min_stock_alert: "10",
    status: "active",
  });

  const fetchCosmetic = async () => {
    setIsLoading(true);
    try {
      const [res, catRes] = await Promise.all([
        getCosmetic(params.id as string),
        getCategories({ type: "cosmetic" }).catch(() => ({ data: [] })),
      ]);
      const data = res.data;
      setCosmetic(data);
      setCategories(extractListData<ApiCategory>(catRes).filter((c) => c.type === "cosmetic"));

      const cosmeticDetails = data.productable as { product_type?: string; size?: string; unit?: string; color?: string; shade?: string; ingredients?: string } | undefined;
      setForm({
        name: data.name,
        category_id: String(data.category_id),
        product_type: cosmeticDetails?.product_type || "Skincare",
        size: cosmeticDetails?.size || "",
        unit: cosmeticDetails?.unit || "item",
        color: cosmeticDetails?.color || "",
        shade: cosmeticDetails?.shade || "",
        ingredients: cosmeticDetails?.ingredients || "",
        pack_size: String(data.pack_size ?? 1),
        min_stock_alert: String(data.min_stock_alert ?? 10),
        status: data.status,
      });
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load cosmetic details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchCosmetic();
    }
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cosmetic) return;

    setIsSubmitting(true);
    try {
      const res = await updateCosmetic(cosmetic.id, {
        name: form.name,
        category_id: Number(form.category_id),
        product_type: form.product_type || null,
        size: form.size || null,
        unit: form.unit || "item",
        color: form.color || null,
        shade: form.shade || null,
        ingredients: form.ingredients || null,
        pack_size: Number(form.pack_size) || 1,
        min_stock_alert: Number(form.min_stock_alert) || 10,
        status: form.status as "active" | "inactive",
      });
      setCosmetic(res.data);
      toast(res.message || "Cosmetic updated successfully", "success");
      setIsEditing(false);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update cosmetic", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-500">
        Loading cosmetic details...
      </div>
    );
  }

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
            <p className="mt-0.5 text-sm text-muted-foreground">The requested cosmetic does not exist</p>
          </div>
        </div>
        <Link
          href="/cosmetics"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const cosmeticDetails = cosmetic.productable as { product_type?: string; size?: string; unit?: string; color?: string; shade?: string; ingredients?: string } | undefined;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{cosmetic.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {cosmeticDetails?.product_type || "Cosmetic"} · {cosmetic.sku || "N/A"}
            </p>
          </div>
        </div>
        {canManageCatalog && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="max-w-lg">
          <form onSubmit={handleUpdate} className="rounded-lg border border-border p-4 sm:p-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Product Type</label>
                <select
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Size</label>
                <input
                  type="text"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Unit</label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Color</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Shade</label>
                <input
                  type="text"
                  value={form.shade}
                  onChange={(e) => setForm({ ...form, shade: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-md bg-transparent px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Product Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Name</span>
                <span className="font-medium">{cosmetic.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Product Type</span>
                <span>{cosmeticDetails?.product_type || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">SKU</span>
                <span className="font-mono">{cosmetic.sku || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Barcode</span>
                <span className="font-mono">{cosmetic.barcode || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Category</span>
                <span>{cosmetic.category?.name ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Catalog Config & Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Pack Size</span>
                <span>{cosmetic.pack_size ?? 1} units/pack</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Min Stock Alert</span>
                <span>{cosmetic.min_stock_alert ?? 10} units</span>
              </div>
              {cosmeticDetails?.size && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Size</span>
                  <span>{cosmeticDetails.size}</span>
                </div>
              )}
              {cosmeticDetails?.unit && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Unit</span>
                  <span>{cosmeticDetails.unit}</span>
                </div>
              )}
              {cosmeticDetails?.color && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Color</span>
                  <span>{cosmeticDetails.color}</span>
                </div>
              )}
              {cosmeticDetails?.shade && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shade</span>
                  <span>{cosmeticDetails.shade}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Branch & Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  cosmetic.status === "active"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                }`}>
                  {cosmetic.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Branch</span>
                <span>{cosmetic.branch?.name ?? "Global / Network Wide"}</span>
              </div>
              {cosmeticDetails?.ingredients && (
                <div className="pt-2">
                  <span className="text-sm text-neutral-500">Ingredients</span>
                  <p className="mt-1 text-sm">{cosmeticDetails.ingredients}</p>
                </div>
              )}
              {cosmetic.description && (
                <div className="pt-2">
                  <span className="text-sm text-neutral-500">Description</span>
                  <p className="mt-1 text-sm">{cosmetic.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
