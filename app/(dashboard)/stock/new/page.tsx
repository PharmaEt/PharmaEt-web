"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { createStockBatch } from "@/lib/api/stock";
import { getProducts } from "@/lib/api/products";
import { getSuppliers } from "@/lib/api/suppliers";
import { getBranches } from "@/lib/api/branches";
import { extractListData } from "@/lib/api/client";
import { ProductPicker } from "@/components/ui/product-picker";
import { type ApiProduct, type ApiSupplier, type ApiBranch } from "@/lib/mock-data";

export default function NewStockAdjustmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOwner, user } = useAuth();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    supplier_id: "",
    branch_id: "",
    quantity: "",
    batch_number: "BN-",
    expiry_date: "",
    purchase_cost: "",
    selling_price: "",
  });

  useEffect(() => {
    async function loadLookups() {
      try {
        const [prodRes, supRes, branchRes] = await Promise.all([
          getProducts({ all: true }).catch(() => ({ data: [] })),
          getSuppliers().catch(() => ({ data: [] })),
          getBranches().catch(() => ({ data: [] })),
        ]);

        setProducts(extractListData<ApiProduct>(prodRes));
        setSuppliers(extractListData<ApiSupplier>(supRes));
        setBranches(extractListData<ApiBranch>(branchRes));
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load form lookups", "error");
      }
    }
    loadLookups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetBranch = isOwner ? (form.branch_id ? Number(form.branch_id) : (user?.branch_id ?? null)) : (user?.branch_id ?? null);

    if (!targetBranch) {
      toast(
        <span className="flex items-center gap-1.5">
          <span>Please select a branch or set a Default Operating Branch in your profile.</span>
          <a href="/profile" className="font-bold underline hover:text-amber-300">
            Set Branch in Profile →
          </a>
        </span>,
        "error"
      );
      return;
    }

    if (!form.product_id || !form.batch_number || !form.purchase_cost || !form.selling_price || !form.quantity) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createStockBatch({
        product_id: Number(form.product_id),
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
        branch_id: isOwner ? (form.branch_id ? Number(form.branch_id) : null) : (user?.branch_id ?? null),
        batch_number: form.batch_number,
        expiry_date: form.expiry_date || null,
        purchase_cost: Number(form.purchase_cost),
        selling_price: Number(form.selling_price),
        quantity: Number(form.quantity),
      });

      toast("Stock batch intake added successfully", "success");
      router.push("/stock");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create stock batch", "error");
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Stock Intake</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Add a new stock batch to inventory</p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="product" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Select Product
              </label>
              <ProductPicker
                products={products}
                selectedProductId={form.product_id}
                onSelect={(prod) => setForm({ ...form, product_id: String(prod.id) })}
                placeholder="Search product by name, generic, SKU, or barcode..."
              />
            </div>

            <div>
              <label htmlFor="supplier" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Supplier Assignment
              </label>
              <select
                id="supplier"
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
              >
                <option value="">Select Supplier (Optional)</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
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
                  <option value="">Default Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Quantity Received (Units)
              </label>
              <input
                id="quantity"
                type="number"
                required
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g., 100"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
              <p className="mt-1 text-[11px] text-neutral-400">Enter total individual units. For 5 packs of 10 units each, enter 50.</p>
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
                  value={form.batch_number}
                  onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
                  placeholder="BN-2026-001"
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
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="purchase_price" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Purchase Cost (ETB)
                </label>
                <input
                  id="purchase_price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.purchase_cost}
                  onChange={(e) => setForm({ ...form, purchase_cost: e.target.value })}
                  placeholder="e.g., 150.00"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="selling_price" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Selling Price (ETB)
                </label>
                <input
                  id="selling_price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.selling_price}
                  onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                  placeholder="e.g., 200.00"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {isSubmitting ? "Adding Stock..." : "Add Stock Intake"}
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
