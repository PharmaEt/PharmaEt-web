"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { mockSuppliers, mockMedicines, mockBranches } from "@/lib/mock-data";

interface POItem {
  medicine_id: string;
  quantity: string;
  unit_price: string;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    supplier_id: "",
    branch_id: "",
    expected_delivery: "",
    notes: "",
  });
  const [items, setItems] = useState<POItem[]>([
    { medicine_id: "", quantity: "", unit_price: "" },
  ]);

  const addItem = () => {
    setItems([...items, { medicine_id: "", quantity: "", unit_price: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof POItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/purchase-orders");
  };

  const getItemTotal = (item: POItem) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return qty * price;
  };

  const getSubtotal = () => items.reduce((sum, item) => sum + getItemTotal(item), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">New Purchase Order</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Create a new supplier order</p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                  <option value="">Select supplier</option>
                  {mockSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  <option value="">Select branch</option>
                  {mockBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="expected_delivery" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Expected Delivery
              </label>
              <input
                id="expected_delivery"
                type="date"
                required
                value={form.expected_delivery}
                onChange={(e) => setForm({ ...form, expected_delivery: e.target.value })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div>
              <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Notes <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Order notes or special instructions"
                rows={2}
                className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Order Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 rounded-md bg-transparent px-2 py-1 text-xs font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-3">
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Medicine</label>
                      <select
                        required
                        value={item.medicine_id}
                        onChange={(e) => updateItem(index, "medicine_id", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                      >
                        <option value="">Select medicine</option>
                        {mockMedicines.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name} ({med.strength})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        placeholder="100"
                        className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Unit Price (ETB)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                        placeholder="25.00"
                        className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Total</label>
                      <div className="flex h-9 items-center px-3 text-sm font-medium">
                        ETB {getItemTotal(item).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <div className="text-sm font-medium">
                Subtotal: ETB {getSubtotal().toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Create Purchase Order
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
