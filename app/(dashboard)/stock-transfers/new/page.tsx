"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { getBranches } from "@/lib/api/branches";
import { getProducts } from "@/lib/api/products";
import { createStockTransfer } from "@/lib/api/stock-transfers";
import { extractListData } from "@/lib/api/client";
import { ProductPicker } from "@/components/ui/product-picker";
import type { ApiBranch, ApiProduct } from "@/lib/types";

interface ItemRow {
  product_id: number;
  requested_quantity: number;
}

function formatProductDropdownLabel(p: ApiProduct): string {
  const details = (p as any).productable;
  const strength = details?.strength || (p as any).strength;
  const form = details?.dosage_form || details?.product_type || (p as any).dosage_form || (p as any).product_type;
  const packSize = p.pack_size ?? 1;

  let label = p.name;
  if (strength) label += ` ${strength}`;
  if (form) label += ` (${form})`;
  label += ` — ${packSize} pcs/pack`;
  if (p.sku) label += ` [SKU: ${p.sku}]`;

  return label;
}

export default function NewStockTransferPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOwner, user } = useAuth();
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [fromBranchId, setFromBranchId] = useState<string>("");
  const [toBranchId, setToBranchId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ product_id: 0, requested_quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, pRes] = await Promise.all([getBranches(), getProducts({ all: true })]);
        const bList = extractListData<ApiBranch>(bRes);
        const pList = extractListData<ApiProduct>(pRes);
        setBranches(bList);
        setProducts(pList);
        if (user?.branch_id) {
          setFromBranchId(String(user.branch_id));
        } else if (bList.length > 0) {
          setFromBranchId(String(bList[0].id));
        }
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load branches/products", "error");
      }
    }
    loadData();
  }, [user]);

  const addItemRow = () => {
    setItems((prev) => [...prev, { product_id: 0, requested_quantity: 1 }]);
  };

  const removeItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: keyof ItemRow, value: number) => {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveFromBranch = fromBranchId ? Number(fromBranchId) : (user?.branch_id ?? null);
    if (!effectiveFromBranch) {
      toast(
        <span className="flex items-center gap-1.5">
          <span>Please select a source branch or set a Default Operating Branch in your profile.</span>
          <a href="/profile" className="font-bold underline hover:text-amber-300">
            Set Branch in Profile →
          </a>
        </span>,
        "error"
      );
      return;
    }

    if (!toBranchId) {
      toast("Please select a target destination branch", "error");
      return;
    }

    if (fromBranchId && fromBranchId === toBranchId) {
      toast("Source and destination branches cannot be the same", "error");
      return;
    }

    const validItems = items.filter((i) => i.product_id > 0 && i.requested_quantity > 0);
    if (validItems.length === 0) {
      toast("Please add at least one valid product line", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createStockTransfer({
        from_branch_id: fromBranchId ? Number(fromBranchId) : undefined,
        to_branch_id: Number(toBranchId),
        notes: notes || undefined,
        items: validItems,
      });
      toast("Stock transfer request created successfully", "success");
      router.push("/stock-transfers");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create transfer request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const destinationBranches = branches.filter((b) => String(b.id) !== fromBranchId);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">New Stock Transfer</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Request stock items between branches</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <div className="grid gap-4 sm:grid-cols-2">
          {isOwner ? (
            <div>
              <label className="block text-xs font-medium uppercase text-neutral-500">Source Branch (From) *</label>
              <select
                value={fromBranchId}
                onChange={(e) => setFromBranchId(e.target.value)}
                required
                className="mt-1.5 flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              >
                <option value="">Select Source Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className={isOwner ? "" : "sm:col-span-2"}>
            <label className="block text-xs font-medium uppercase text-neutral-500">Destination Branch (To) *</label>
            <select
              value={toBranchId}
              onChange={(e) => setToBranchId(e.target.value)}
              required
              className="mt-1.5 flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
            >
              <option value="">Select Destination Branch</option>
              {destinationBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase text-neutral-500">Notes / Restock Rationale</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Urgent restock for low stock items..."
            className="mt-1.5 flex w-full rounded-md border border-neutral-200 bg-transparent p-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Requested Line Items</h3>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Product Line
            </button>
          </div>

          <div className="space-y-2">
            {items.map((row, idx) => {
              const selProd = products.find((p) => Number(p.id) === Number(row.product_id));
              const packSize = selProd?.pack_size ?? 1;
              const totalBaseUnits = (row.requested_quantity || 0) * packSize;

              return (
                <div key={idx} className="flex flex-col gap-1.5 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Product</label>
                      <ProductPicker
                        products={products}
                        selectedProductId={row.product_id}
                        onSelect={(prod) => updateItemRow(idx, "product_id", Number(prod.id))}
                        placeholder="Search product by name, generic, SKU, or barcode..."
                      />
                    </div>

                    <div className="w-32">
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Quantity (Packs)</label>
                      <input
                        type="number"
                        min={1}
                        value={row.requested_quantity}
                        onChange={(e) => updateItemRow(idx, "requested_quantity", Number(e.target.value))}
                        placeholder="Packs"
                        required
                        className="h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                      />
                    </div>

                    {items.length > 1 && (
                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          aria-label="Remove item"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {packSize > 1 && row.requested_quantity > 0 && (
                    <p className="text-[10px] text-neutral-500">
                      Total Inventory Transfer: <strong className="text-neutral-700 dark:text-neutral-300">{totalBaseUnits.toLocaleString()} Base Units</strong> ({row.requested_quantity} Packs × {packSize} units/pack)
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {isSubmitting ? "Creating Request..." : "Submit Transfer Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
