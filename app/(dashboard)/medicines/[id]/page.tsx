"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { getMedicine, updateMedicine } from "@/lib/api/medicines";
import { getCategories } from "@/lib/api/categories";
import { type ApiProduct, type ApiCategory } from "@/lib/mock-data";

export default function MedicineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { canManageCatalog } = useAuth();
  const [medicine, setMedicine] = useState<ApiProduct | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    generic_name: "",
    category_id: "",
    strength: "",
    dosage_form: "Tablet",
    pack_size: "1",
    min_stock_alert: "10",
    is_prescription_required: false,
    status: "active",
  });

  const fetchMedicine = async () => {
    setIsLoading(true);
    try {
      const [res, catRes] = await Promise.all([
        getMedicine(params.id as string),
        getCategories({ type: "medicine" }).catch(() => ({ data: [] })),
      ]);
      const data = res.data;
      setMedicine(data);
      setCategories((catRes.data || []).filter((c) => c.type === "medicine"));

      const medicineDetails = data.productable as { generic_name?: string; strength?: string; dosage_form?: string; is_prescription_required?: boolean } | undefined;
      setForm({
        name: data.name,
        generic_name: medicineDetails?.generic_name || "",
        category_id: String(data.category_id),
        strength: medicineDetails?.strength || "",
        dosage_form: medicineDetails?.dosage_form || "Tablet",
        pack_size: String(data.pack_size ?? 1),
        min_stock_alert: String(data.min_stock_alert ?? 10),
        is_prescription_required: !!medicineDetails?.is_prescription_required,
        status: data.status,
      });
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load medicine details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchMedicine();
    }
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine) return;

    setIsSubmitting(true);
    try {
      const res = await updateMedicine(medicine.id, {
        name: form.name,
        category_id: Number(form.category_id),
        generic_name: form.generic_name || null,
        dosage_form: form.dosage_form || null,
        strength: form.strength || null,
        is_prescription_required: form.is_prescription_required,
        pack_size: Number(form.pack_size) || 1,
        min_stock_alert: Number(form.min_stock_alert) || 10,
        status: form.status as "active" | "inactive",
      });
      setMedicine(res.data);
      toast(res.message || "Medicine updated successfully", "success");
      setIsEditing(false);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update medicine", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-500">
        Loading medicine details...
      </div>
    );
  }

  if (!medicine) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Medicine Not Found</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">The requested medicine does not exist</p>
          </div>
        </div>
        <Link
          href="/medicines"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const medicineDetails = medicine.productable as { generic_name?: string; strength?: string; dosage_form?: string; is_prescription_required?: boolean } | undefined;

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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{medicine.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {medicineDetails?.strength || "N/A"} · {medicineDetails?.dosage_form || "N/A"}
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Generic Name</label>
              <input
                type="text"
                value={form.generic_name}
                onChange={(e) => setForm({ ...form, generic_name: e.target.value })}
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
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Dosage Form</label>
                <select
                  value={form.dosage_form}
                  onChange={(e) => setForm({ ...form, dosage_form: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream">Cream</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Drops">Drops</option>
                  <option value="Inhaler">Inhaler</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Strength</label>
                <input
                  type="text"
                  value={form.strength}
                  onChange={(e) => setForm({ ...form, strength: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Pack Size</label>
                <input
                  type="number"
                  min="1"
                  value={form.pack_size}
                  onChange={(e) => setForm({ ...form, pack_size: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit_is_prescription_required"
                type="checkbox"
                checked={form.is_prescription_required}
                onChange={(e) => setForm({ ...form, is_prescription_required: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
              />
              <label htmlFor="edit_is_prescription_required" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Prescription Required (Rx)
              </label>
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
                <span className="font-medium">{medicine.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Generic Name</span>
                <span>{medicineDetails?.generic_name || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Strength</span>
                <span>{medicineDetails?.strength || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Dosage Form</span>
                <span>{medicineDetails?.dosage_form || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Category</span>
                <span>{medicine.category?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Prescription Required</span>
                <span>{medicineDetails?.is_prescription_required ? "Yes (Rx)" : "No"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Catalog Config & Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Pack Size</span>
                <span>{medicine.pack_size ?? 1} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Min Stock Alert</span>
                <span>{medicine.min_stock_alert ?? 10} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">SKU Code</span>
                <span>{medicine.sku || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Barcode</span>
                <span>{medicine.barcode || "—"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Branch & Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  medicine.status === "active"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                }`}>
                  {medicine.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Branch</span>
                <span>{medicine.branch?.name ?? "Global / Network Wide"}</span>
              </div>
              {medicine.description && (
                <div className="pt-2">
                  <span className="text-sm text-neutral-500">Description</span>
                  <p className="mt-1 text-sm">{medicine.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
