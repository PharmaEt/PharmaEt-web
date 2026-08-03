"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { getSuppliers } from "@/lib/api/suppliers";
import { getBranches } from "@/lib/api/branches";
import { getProducts } from "@/lib/api/products";
import { createPurchaseOrder } from "@/lib/api/purchase-orders";
import type { ApiSupplier, ApiBranch, ApiProduct } from "@/lib/mock-data";

interface POItem {
  product_id: string;
  ordered_quantity_pack: string;
  unit_cost: string;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOwner, user } = useAuth();

  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);

  const [form, setForm] = useState({
    supplier_id: "",
    branch_id: user?.branch_id ? String(user.branch_id) : "",
    notes: "",
  });

  const [items, setItems] = useState<POItem[]>([
    { product_id: "", ordered_quantity_pack: "", unit_cost: "" },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMasterData() {
      setIsLoading(true);
      try {
        const [supRes, branchRes, prodRes] = await Promise.all([
          getSuppliers(),
          getBranches().catch(() => ({ data: [] })),
          getProducts(),
        ]);

        const supList = Array.isArray(supRes.data) ? supRes.data : (supRes.data as any)?.data || [];
        const branchList = Array.isArray(branchRes.data) ? branchRes.data : (branchRes.data as any)?.data || [];
        const prodList = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data as any)?.data || [];

        setSuppliers(supList);
        setBranches(branchList);
        setProducts(prodList);
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load order form data", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadMasterData();
  }, []);

  const addItem = () => {
    setItems([...items, { product_id: "", ordered_quantity_pack: "", unit_cost: "" }]);
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

  const getItemTotal = (item: POItem) => {
    const qty = parseFloat(item.ordered_quantity_pack) || 0;
    const cost = parseFloat(item.unit_cost) || 0;
    return qty * cost;
  };

  const getSubtotal = () => items.reduce((sum, item) => sum + getItemTotal(item), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_id) {
      toast("Please select a supplier", "error");
      return;
    }

    const validItems = items.filter(
      (i) => i.product_id && Number(i.ordered_quantity_pack) > 0 && Number(i.unit_cost) >= 0
    );

    if (validItems.length === 0) {
      toast("Please add at least one valid item with product, quantity, and cost", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await createPurchaseOrder({
        supplier_id: Number(form.supplier_id),
        branch_id: form.branch_id ? Number(form.branch_id) : undefined,
        order_date: todayStr,
        note: form.notes || undefined,
        items: validItems.map((i) => ({
          product_id: Number(i.product_id),
          quantity_pack: Number(i.ordered_quantity_pack),
          cost_per_pack: Number(i.unit_cost),
        })),
      });

      toast("Purchase order created successfully", "success");
      router.push("/purchase-orders");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create purchase order", "error");
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">New Purchase Order</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Create a draft purchase order for supplier procurement</p>
        </div>
      </div>

      <div className="max-w-xl">
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
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              {isOwner && (
                <div>
                  <label htmlFor="branch" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Destination Branch
                  </label>
                  <select
                    id="branch"
                    value={form.branch_id}
                    onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                  >
                    <option value="">Default Branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Notes <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Order notes or special instructions for supplier..."
                rows={2}
                className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Order Line Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 rounded-md bg-transparent px-2 py-1 text-xs font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <Plus className="h-3 w-3" />
                Add Line Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-3">
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Product</label>
                      <select
                        required
                        value={item.product_id}
                        onChange={(e) => updateItem(index, "product_id", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                      >
                        <option value="">Select catalog product</option>
                        {products.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Quantity (Packs)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.ordered_quantity_pack}
                        onChange={(e) => updateItem(index, "ordered_quantity_pack", e.target.value)}
                        placeholder="e.g. 50"
                        className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Unit Cost (ETB)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unit_cost}
                        onChange={(e) => updateItem(index, "unit_cost", e.target.value)}
                        placeholder="e.g. 150.00"
                        className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Line Subtotal</label>
                      <div className="flex h-9 items-center px-3 text-sm font-semibold">
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
                      Remove Line Item
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <div className="text-sm font-semibold">
                Total Order Estimate: ETB {getSubtotal().toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {isSubmitting ? "Creating..." : "Save Purchase Order Draft"}
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
