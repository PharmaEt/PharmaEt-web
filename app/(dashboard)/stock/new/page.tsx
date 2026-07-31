"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { mockMedicines, mockSuppliers } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";

export default function NewStockAdjustmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    medicine_id: "",
    supplier_id: "",
    quantity: "",
    batch: "BN-",
    expiry: "",
    purchase_price: "",
    profit_percent: "",
    pack_price: "",
    single_price: "",
  });

  const selectedMedicine = mockMedicines.find((m) => m.id === Number(form.medicine_id));
  const packSize = selectedMedicine?.pack_size ?? 1;
  const quantityPacks = parseInt(form.quantity) || 0;
  const totalUnits = quantityPacks * packSize;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Stock added successfully");
    router.push("/stock");
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Stock In</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Add new stock to inventory</p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="medicine" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Medicine
              </label>
              <select
                id="medicine"
                required
                value={form.medicine_id}
                onChange={(e) => setForm({ ...form, medicine_id: e.target.value })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              >
                <option value="" disabled>Select</option>
                {mockMedicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.strength} ({m.dosage_form})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="supplier" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Supplier
              </label>
              <select
                id="supplier"
                required
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              >
                <option value="" disabled>Select Supplier</option>
                {mockSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Quantity (Packs)
                </label>
                <input
                  id="quantity"
                  type="number"
                  required
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="e.g., 10"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Total Units
                </label>
                <div className="flex h-9 items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium dark:border-neutral-800 dark:bg-neutral-900">
                  {totalUnits}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="batch" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Batch Number
                </label>
                <input
                  id="batch"
                  type="text"
                  required
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  placeholder="BN-"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 font-mono"
                />
              </div>

              <div>
                <label htmlFor="expiry" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Expiry Date
                </label>
                <input
                  id="expiry"
                  type="date"
                  required
                  value={form.expiry}
                  onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="purchase_price" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Purchase Cost (Per Pack)
              </label>
              <input
                id="purchase_price"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.purchase_price}
                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                placeholder="e.g., 150.00"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div>
              <label htmlFor="profit_percent" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Profit % <span className="text-neutral-400">(Optional)</span>
              </label>
              <input
                id="profit_percent"
                type="number"
                min="0"
                max="100"
                value={form.profit_percent}
                onChange={(e) => setForm({ ...form, profit_percent: e.target.value })}
                placeholder="Leave empty for manual pricing"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Leave empty for manual pricing</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pack_price" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Selling Price (Per Pack)
                </label>
                <input
                  id="pack_price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.pack_price}
                  onChange={(e) => setForm({ ...form, pack_price: e.target.value })}
                  placeholder="e.g., 200.00"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="single_price" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Selling Price (Per Unit)
                </label>
                <input
                  id="single_price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.single_price}
                  onChange={(e) => setForm({ ...form, single_price: e.target.value })}
                  placeholder="e.g., 25.00"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Add Stock
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
