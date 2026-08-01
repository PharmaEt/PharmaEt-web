"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockMedicines, mockCategories, mockBranches } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";

export default function MedicineEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const medicine = mockMedicines.find((m) => m.id === Number(params.id));

  const [form, setForm] = useState({
    name: medicine?.name ?? "",
    generic_name: medicine?.generic_name ?? "",
    category_id: medicine?.category_id?.toString() ?? "",
    branch_id: medicine?.branch_id?.toString() ?? "",
    strength: medicine?.strength ?? "",
    dosage_form: medicine?.dosage_form ?? "",
    pack_size: medicine?.pack_size?.toString() ?? "",
    pack_price: medicine?.pack_price?.toString() ?? "",
    unit_price: medicine?.unit_price?.toString() ?? "",
    min_stock_alert: medicine?.min_stock_alert?.toString() ?? "",
    is_prescription_required: medicine?.is_prescription_required ?? false,
    description: medicine?.description ?? "",
    status: medicine?.status ?? "active",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Medicine updated successfully");
    router.push("/medicines");
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
                  {mockCategories.map((c) => (
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
                  placeholder="e.g., 250"
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
                  placeholder="e.g., 25"
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
