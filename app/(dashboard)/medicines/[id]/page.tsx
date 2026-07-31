"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockMedicines, mockCategories, mockBranches } from "@/lib/mock-data";

export default function MedicineDetailPage() {
  const router = useRouter();
  const params = useParams();
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
          <p className="mt-0.5 text-sm text-muted-foreground">Update medicine details</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-neutral-500">Current Stock</p>
            <p className="text-lg font-semibold">{medicine.current_stock}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Status</p>
            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
              medicine.status === "active"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            }`}>
              {medicine.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Created</p>
            <p className="text-sm">{new Date(medicine.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <div className="space-y-4">
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
                placeholder="e.g., Paracetamol"
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
                placeholder="e.g., Acetaminophen"
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
                  <option value="">Select category</option>
                  {mockCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="branch" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Branch <span className="text-neutral-400">(optional)</span>
                </label>
                <select
                  id="branch"
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                >
                  <option value="">All branches</option>
                  {mockBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

              <div>
                <label htmlFor="dosage_form" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Dosage Form
                </label>
                <input
                  id="dosage_form"
                  type="text"
                  required
                  value={form.dosage_form}
                  onChange={(e) => setForm({ ...form, dosage_form: e.target.value })}
                  placeholder="e.g., Tablet"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="pack_size" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Pack Size
                </label>
                <input
                  id="pack_size"
                  type="number"
                  min="1"
                  required
                  value={form.pack_size}
                  onChange={(e) => setForm({ ...form, pack_size: e.target.value })}
                  placeholder="100"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="pack_price" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Pack Price (ETB)
                </label>
                <input
                  id="pack_price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.pack_price}
                  onChange={(e) => setForm({ ...form, pack_price: e.target.value })}
                  placeholder="250"
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
                  min="0"
                  step="0.01"
                  required
                  value={form.unit_price}
                  onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                  placeholder="2.50"
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
                min="0"
                required
                value={form.min_stock_alert}
                onChange={(e) => setForm({ ...form, min_stock_alert: e.target.value })}
                placeholder="50"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_prescription_required"
                type="checkbox"
                checked={form.is_prescription_required}
                onChange={(e) => setForm({ ...form, is_prescription_required: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
              />
              <label htmlFor="is_prescription_required" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Prescription Required
              </label>
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

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the medicine"
                rows={3}
                className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
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
