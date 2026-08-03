"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getCategories } from "@/lib/api/categories";
import { getMedicine, updateMedicine } from "@/lib/api/medicines";
import type { ApiCategory, ApiProduct } from "@/lib/mock-data";

export default function MedicineEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [medicine, setMedicine] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    generic_name: "",
    category_id: "",
    strength: "",
    dosage_form: "",
    pack_size: "",
    min_stock_alert: "",
    is_prescription_required: false,
    description: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [catRes, medRes] = await Promise.all([
          getCategories(),
          getMedicine(params.id as string),
        ]);
        const catList = Array.isArray(catRes.data) ? catRes.data : (catRes.data as any)?.data || [];
        setCategories(catList);

        const med = medRes.data;
        setMedicine(med);
        const details = (med.productable as any) || (med as any).details || {};

        setForm({
          name: med.name ?? "",
          generic_name: details.generic_name ?? "",
          category_id: med.category_id ? String(med.category_id) : "",
          strength: details.strength ?? "",
          dosage_form: details.dosage_form ?? "",
          pack_size: details.pack_size ? String(details.pack_size) : "1",
          min_stock_alert: med.min_stock_alert ? String(med.min_stock_alert) : "10",
          is_prescription_required: Boolean(details.is_prescription_required),
          description: med.description ?? "",
          status: med.status ?? "active",
        });
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load medicine details", "error");
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
      await updateMedicine(params.id as string, {
        name: form.name,
        category_id: Number(form.category_id),
        generic_name: form.generic_name || undefined,
        dosage_form: form.dosage_form || undefined,
        strength: form.strength || undefined,
        is_prescription_required: form.is_prescription_required,
        pack_size: form.pack_size ? Number(form.pack_size) : undefined,
        min_stock_alert: form.min_stock_alert ? Number(form.min_stock_alert) : undefined,
        description: form.description || undefined,
        status: form.status,
      });
      toast("Medicine updated successfully", "success");
      router.push("/medicines");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update medicine", "error");
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Edit Medicine</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Update medicine information</p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Medicine Name
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

              <div>
                <label htmlFor="generic_name" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Generic Name
                </label>
                <input
                  id="generic_name"
                  type="text"
                  required
                  value={form.generic_name}
                  onChange={(e) => setForm({ ...form, generic_name: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
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
                <label htmlFor="strength" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Strength
                </label>
                <input
                  id="strength"
                  type="text"
                  required
                  value={form.strength}
                  onChange={(e) => setForm({ ...form, strength: e.target.value })}
                  placeholder="e.g., 500mg"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dosage_form" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Dosage Form
                </label>
                <select
                  id="dosage_form"
                  required
                  value={form.dosage_form}
                  onChange={(e) => setForm({ ...form, dosage_form: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                >
                  <option value="" disabled>Select dosage form</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream">Cream</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Drops">Drops</option>
                  <option value="Inhaler">Inhaler</option>
                </select>
              </div>

              <div>
                <label htmlFor="pack_size" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Pack Size
                </label>
                <input
                  id="pack_size"
                  type="number"
                  required
                  min="1"
                  value={form.pack_size}
                  onChange={(e) => setForm({ ...form, pack_size: e.target.value })}
                  placeholder="e.g., 100"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
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
                  placeholder="e.g., 50"
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

            <div className="flex items-center gap-2">
              <input
                id="prescription"
                type="checkbox"
                checked={form.is_prescription_required}
                onChange={(e) => setForm({ ...form, is_prescription_required: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300"
              />
              <label htmlFor="prescription" className="text-sm text-neutral-700 dark:text-neutral-300">
                Prescription Required
              </label>
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Medicine description..."
                className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Update Medicine
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
