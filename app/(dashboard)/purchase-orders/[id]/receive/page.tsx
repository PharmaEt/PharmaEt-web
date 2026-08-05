"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, PackageCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  getPurchaseOrder,
  receivePurchaseOrder,
  type ApiPurchaseOrder,
  type ApiPurchaseOrderItem,
} from "@/lib/api/purchase-orders";

export default function ReceivePage() {
  const router = useRouter();
  const params = useParams();
  const poId = params.id as string;
  const { toast } = useToast();

  const [po, setPo] = useState<ApiPurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [receiveNow, setReceiveNow] = useState<Record<number, number>>({});
  const [formData, setFormData] = useState<
    Record<
      number,
      {
        batch: string;
        expiry: string;
        costPerPack: number;
        profitPercent: number;
        packPrice: number;
        singlePrice: number;
      }
    >
  >({});

  useEffect(() => {
    async function loadPO() {
      setLoading(true);
      try {
        const res = await getPurchaseOrder(poId);
        if (res.data) {
          const fetchedPo = res.data;
          setPo(fetchedPo);

          const items = fetchedPo.items || [];
          const initialReceive: Record<number, number> = {};
          const initialForm: Record<
            number,
            { batch: string; expiry: string; costPerPack: number; profitPercent: number; packPrice: number; singlePrice: number }
          > = {};

          items.forEach((item: ApiPurchaseOrderItem) => {
            const qtyPacks = item.quantity_pack || 0;
            initialReceive[item.id] = qtyPacks;

            const costNum = parseFloat(String(item.cost_per_pack)) || 0;
            const defaultProfit = 25;
            const defaultPackPrice = Number((costNum * (1 + defaultProfit / 100)).toFixed(2));
            const packSize = item.product?.pack_size || 1;
            const defaultSinglePrice = Number((defaultPackPrice / packSize).toFixed(2));

            const today = new Date();
            const futureExpiry = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split("T")[0];

            initialForm[item.id] = {
              batch: "",
              expiry: futureExpiry,
              costPerPack: costNum,
              profitPercent: defaultProfit,
              packPrice: defaultPackPrice,
              singlePrice: defaultSinglePrice,
            };
          });

          setReceiveNow(initialReceive);
          setFormData(initialForm);
        }
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load Purchase Order details", "error");
      } finally {
        setLoading(false);
      }
    }
    if (poId) {
      loadPO();
    }
  }, [poId]);

  const updateReceive = (id: number, value: number) => {
    setReceiveNow((prev) => ({ ...prev, [id]: value }));
  };

  const handleCostPerPackChange = (id: number, costNum: number, packSize: number) => {
    const currentProfit = formData[id]?.profitPercent ?? 25;
    const computedPackPrice = Number((costNum * (1 + currentProfit / 100)).toFixed(2));
    const computedSinglePrice = Number((computedPackPrice / (packSize || 1)).toFixed(2));
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        costPerPack: costNum,
        packPrice: computedPackPrice,
        singlePrice: computedSinglePrice,
      },
    }));
  };

  const handleProfitChange = (id: number, profitPct: number, packSize: number) => {
    const costNum = formData[id]?.costPerPack || 0;
    const calculatedPackPrice = Number((costNum * (1 + profitPct / 100)).toFixed(2));
    const calculatedSinglePrice = Number((calculatedPackPrice / (packSize || 1)).toFixed(2));
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        profitPercent: profitPct,
        packPrice: calculatedPackPrice,
        singlePrice: calculatedSinglePrice,
      },
    }));
  };

  const handlePackPriceChange = (id: number, packPrice: number, packSize: number) => {
    const costNum = formData[id]?.costPerPack || 0;
    const computedProfit = costNum > 0 ? Number((((packPrice - costNum) / costNum) * 100).toFixed(2)) : 0;
    const computedSingle = Number((packPrice / (packSize || 1)).toFixed(2));
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        profitPercent: computedProfit,
        packPrice: packPrice,
        singlePrice: computedSingle,
      },
    }));
  };

  const handleSinglePriceChange = (id: number, singlePrice: number, packSize: number) => {
    const costNum = formData[id]?.costPerPack || 0;
    const computedPackPrice = Number((singlePrice * (packSize || 1)).toFixed(2));
    const computedProfit = costNum > 0 ? Number((((computedPackPrice - costNum) / costNum) * 100).toFixed(2)) : 0;
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        profitPercent: computedProfit,
        packPrice: computedPackPrice,
        singlePrice: singlePrice,
      },
    }));
  };

  const handleFieldChange = (id: number, field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const items = po?.items || [];
  const canConfirm = items.some((item) => (receiveNow[item.id] || 0) > 0);

  const handleConfirmReceive = async () => {
    if (!po) return;
    setSubmitting(true);
    try {
      const receiveItems = items
        .filter((item) => (receiveNow[item.id] || 0) > 0)
        .map((item) => ({
          purchase_order_item_id: item.id,
          quantity_pack: receiveNow[item.id],
          batch_number: formData[item.id]?.batch ? formData[item.id].batch.trim() : undefined,
          expiry_date: formData[item.id]?.expiry || undefined,
          cost_per_pack: formData[item.id]?.costPerPack ?? (parseFloat(String(item.cost_per_pack)) || 0),
          pack_selling_price: formData[item.id]?.packPrice ?? undefined,
          selling_price: formData[item.id]?.singlePrice ?? undefined,
        }));

      if (receiveItems.length === 0) {
        toast("Please enter quantity to receive for at least one item", "error");
        setSubmitting(false);
        return;
      }

      const res = await receivePurchaseOrder(po.id, { items: receiveItems });
      setConfirmed(true);
      toast(res.message || "Purchase order items received & stock updated successfully!", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to process receipt of goods", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <p className="text-sm text-neutral-500">Loading purchase order details...</p>
      </div>
    );
  }

  if (!po) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">PO Not Found</h1>
          </div>
        </div>
        <Link
          href="/purchase-orders"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-lg border border-border p-8 text-center bg-white dark:bg-[#0A0A0A]">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
          <h2 className="mt-4 text-lg font-semibold">Goods Received Note (GRN) Processed</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Stock batches have been created and branch inventory has been updated.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={`/purchase-orders/${po.id}`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              View Order Details
            </Link>
            <Link
              href="/purchase-orders"
              className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Back to Purchase Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const poNumber = po.order_number || `PO-${String(po.id).padStart(3, "0")}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to PO Details
        </button>
        <div className="flex items-center gap-3">
          <PackageCheck className="h-6 w-6 text-blue-500" />
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{poNumber}</h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              Supplier: <span className="font-medium text-neutral-900 dark:text-neutral-100">{po.supplier?.name ?? "—"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Receive Section */}
      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="border-b border-border px-4 sm:px-5 py-3">
          <h2 className="text-sm font-medium">Receive Quantities</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Enter what arrived in this delivery. Status updates automatically.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left bg-neutral-50 dark:bg-neutral-900/50">
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500">Medicine</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Ordered (Packs)</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Received Total (Packs)</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Remaining (Packs)</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Receive Now (Packs)</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500">Batch #</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500">Expiry Date</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Purchase Price (Per Pack)</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Profit %</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Pack Price (Sell)</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Single Price (Sell)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const remaining = item.quantity_pack || 0;
                const costPerPack = parseFloat(String(item.cost_per_pack)) || 0;
                const prodName = item.product?.name ?? `Product #${item.product_id}`;
                const packSize = item.product?.pack_size || 1;

                return (
                  <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{prodName}</p>
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-neutral-700 dark:text-neutral-300">{remaining}</td>
                    <td className="px-3 py-3 text-right text-neutral-500">0</td>
                    <td className="px-3 py-3 text-right">
                      <span className={remaining > 0 ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
                        {remaining}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {remaining > 0 ? (
                        <input
                          type="number"
                          min={1}
                          max={remaining}
                          value={receiveNow[item.id] || ""}
                          onChange={(e) => updateReceive(item.id, Number(e.target.value))}
                          placeholder="0"
                          className="h-8 w-16 ml-auto rounded border border-neutral-200 bg-white px-2 text-right text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                        />
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Complete</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="e.g. BATCH-2026A"
                        value={formData[item.id]?.batch ?? ""}
                        onChange={(e) => handleFieldChange(item.id, "batch", e.target.value)}
                        className="h-8 w-28 rounded border border-neutral-200 bg-white px-2 text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A] font-mono placeholder:text-neutral-400"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={formData[item.id]?.expiry ?? ""}
                        onChange={(e) => handleFieldChange(item.id, "expiry", e.target.value)}
                        className="h-8 w-32 rounded border border-neutral-200 bg-white px-2 text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formData[item.id]?.costPerPack ?? costPerPack}
                        onChange={(e) => handleCostPerPackChange(item.id, Number(e.target.value), packSize)}
                        className="h-8 w-20 ml-auto rounded border border-neutral-200 bg-white px-2 text-right text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-0.5">PO expected: {costPerPack.toFixed(2)} / pack</p>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={formData[item.id]?.profitPercent ?? 25}
                        onChange={(e) => handleProfitChange(item.id, Number(e.target.value), packSize)}
                        className="h-8 w-16 ml-auto rounded border border-neutral-200 bg-white px-2 text-right text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formData[item.id]?.packPrice ?? Number((costPerPack * 1.25).toFixed(2))}
                        onChange={(e) => handlePackPriceChange(item.id, Number(e.target.value), packSize)}
                        className="h-8 w-20 ml-auto rounded border border-neutral-200 bg-white px-2 text-right text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formData[item.id]?.singlePrice ?? Number(((costPerPack * 1.25) / packSize).toFixed(2))}
                        onChange={(e) => handleSinglePriceChange(item.id, Number(e.target.value), packSize)}
                        className="h-8 w-20 ml-auto rounded border border-neutral-200 bg-white px-2 text-right text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Confirming GRN will create new batch records and update stock quantities.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 px-4 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmReceive}
            disabled={!canConfirm || submitting}
            className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {submitting ? "Processing..." : "Confirm Receive"}
          </button>
        </div>
      </div>
    </div>
  );
}
