"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const poData = {
  id: "PO-20260612-090743-YHH8",
  supplier: "Abyssinia Digital Pharmacy",
};

const poItems = [
  {
    id: 1,
    medicine: "Paracetamol 500mg",
    ordered: 100,
    receivedTotal: 0,
    batch: "BN-2026A",
    expiry: "2026-10-01",
    purchasePrice: 150,
    profitPercent: 25,
    packPrice: 250,
    singlePrice: 25,
  },
  {
    id: 2,
    medicine: "Amoxicillin 500mg",
    ordered: 50,
    receivedTotal: 20,
    batch: "BN-2026B",
    expiry: "2026-11-01",
    purchasePrice: 320,
    profitPercent: 20,
    packPrice: 450,
    singlePrice: 45,
  },
  {
    id: 3,
    medicine: "Omeprazole 20mg",
    ordered: 80,
    receivedTotal: 0,
    batch: "BN-2025C",
    expiry: "2026-08-15",
    purchasePrice: 200,
    profitPercent: 30,
    packPrice: 300,
    singlePrice: 30,
  },
  {
    id: 4,
    medicine: "Cetirizine 10mg",
    ordered: 60,
    receivedTotal: 60,
    batch: "BN-2026D",
    expiry: "2026-12-01",
    purchasePrice: 120,
    profitPercent: 25,
    packPrice: 180,
    singlePrice: 18,
  },
];

export default function ReceivePage() {
  const router = useRouter();
  const [receiveNow, setReceiveNow] = useState<Record<number, number>>(
    poItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );
  const [formData, setFormData] = useState<Record<number, { batch: string; expiry: string; purchasePrice: number; profitPercent: number; packPrice: number; singlePrice: number }>>(
    poItems.reduce((acc, item) => ({
      ...acc,
      [item.id]: { batch: item.batch, expiry: item.expiry, purchasePrice: item.purchasePrice, profitPercent: item.profitPercent, packPrice: item.packPrice, singlePrice: item.singlePrice },
    }), {})
  );

  const updateReceive = (id: number, value: number) => {
    setReceiveNow((prev) => ({ ...prev, [id]: value }));
  };

  const updateField = (id: number, field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to PO
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{poData.id}</h1>
        <p className="mt-1 text-sm text-neutral-500">Supplier: {poData.supplier}</p>
      </div>

      {/* Receive Section */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 sm:px-5 py-3">
          <h2 className="text-sm font-medium">Receive Quantities</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Enter what arrived in this delivery. Status updates automatically.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Medicine</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Ordered (Packs)</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Received Total (Packs)</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Remaining (Packs)</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Receive Now (Packs)</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500" hide-on-mobile>Batch #</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500" hide-on-mobile>Expiry Date</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right" hide-on-mobile>Purchase Price (Per Pack)</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right" hide-on-mobile>Profit %</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right" hide-on-mobile>Pack Price (Sell)</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right" hide-on-mobile>Single Price (Sell)</th>
              </tr>
            </thead>
            <tbody>
              {poItems.map((item) => {
                const remaining = item.ordered - item.receivedTotal;
                return (
                  <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{item.medicine}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-neutral-600 dark:text-neutral-400">{item.ordered}</td>
                    <td className="px-4 py-3 text-sm text-right text-neutral-600 dark:text-neutral-400">{item.receivedTotal}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={remaining > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-emerald-600 dark:text-emerald-400"}>
                        {remaining}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {remaining > 0 ? (
                        <input
                          type="number"
                          min={0}
                          max={remaining}
                          value={receiveNow[item.id] || ""}
                          onChange={(e) => updateReceive(item.id, Number(e.target.value))}
                          placeholder="0"
                          className="flex h-8 w-20 ml-auto rounded-md border border-neutral-200 bg-white px-2 text-sm text-right focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                        />
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Complete</span>
                      )}
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell">
                      <input
                        type="text"
                        value={formData[item.id]?.batch ?? ""}
                        onChange={(e) => updateField(item.id, "batch", e.target.value)}
                        className="flex h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A] font-mono"
                      />
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell">
                      <input
                        type="date"
                        value={formData[item.id]?.expiry ?? ""}
                        onChange={(e) => updateField(item.id, "expiry", e.target.value)}
                        className="flex h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                      />
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell">
                      <input
                        type="number"
                        min={0}
                        value={formData[item.id]?.purchasePrice ?? ""}
                        onChange={(e) => updateField(item.id, "purchasePrice", Number(e.target.value))}
                        className="flex h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm text-right focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-0.5">PO expected: {item.purchasePrice.toFixed(2)} / pack</p>
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell">
                      <input
                        type="number"
                        min={0}
                        value={formData[item.id]?.profitPercent ?? ""}
                        onChange={(e) => updateField(item.id, "profitPercent", Number(e.target.value))}
                        className="flex h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm text-right focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                      />
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell">
                      <input
                        type="number"
                        min={0}
                        value={formData[item.id]?.packPrice ?? ""}
                        onChange={(e) => updateField(item.id, "packPrice", Number(e.target.value))}
                        className="flex h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm text-right focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                      />
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell">
                      <input
                        type="number"
                        min={0}
                        value={formData[item.id]?.singlePrice ?? ""}
                        onChange={(e) => updateField(item.id, "singlePrice", Number(e.target.value))}
                        className="flex h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm text-right focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
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
        <p></p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 px-4 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            Cancel
          </button>
          <button className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
            Confirm Receive
          </button>
        </div>
      </div>
    </div>
  );
}
