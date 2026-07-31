"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const mockPOs = [
  {
    id: 1,
    supplier: { name: "Ethio Pharma Distribution", phone: "+251911000001" },
    branch: "Bole Branch",
    status: "pending",
    created_at: "2026-07-28",
    expected_delivery: "2026-08-02",
    items: [
      { medicine: "Paracetamol 500mg", quantity: 200, unit_price: 25 },
      { medicine: "Amoxicillin 500mg", quantity: 100, unit_price: 30 },
      { medicine: "Ibuprofen 400mg", quantity: 150, unit_price: 20 },
    ],
  },
  {
    id: 2,
    supplier: { name: "Hawassa Medical Supplies", phone: "+251911000002" },
    branch: "Hawassa Branch",
    status: "ordered",
    created_at: "2026-07-26",
    expected_delivery: "2026-07-30",
    items: [
      { medicine: "Losartan 50mg", quantity: 80, unit_price: 20 },
      { medicine: "Metformin 850mg", quantity: 120, unit_price: 18 },
    ],
  },
  {
    id: 3,
    supplier: { name: "Ethio Pharma Distribution", phone: "+251911000001" },
    branch: "Bole Branch",
    status: "received",
    created_at: "2026-07-25",
    expected_delivery: "2026-07-28",
    items: [
      { medicine: "Omeprazole 20mg", quantity: 50, unit_price: 12 },
      { medicine: "Cetirizine 10mg", quantity: 100, unit_price: 9 },
    ],
  },
  {
    id: 4,
    supplier: { name: "Dire Dawa Pharmaceuticals", phone: "+251911000003" },
    branch: "All Branches",
    status: "pending",
    created_at: "2026-07-28",
    expected_delivery: "2026-08-05",
    items: [
      { medicine: "Amlodipine 5mg", quantity: 60, unit_price: 15 },
      { medicine: "Azithromycin 250mg", quantity: 40, unit_price: 30 },
      { medicine: "Salbutamol Inhaler", quantity: 10, unit_price: 350 },
      { medicine: "Paracetamol 500mg", quantity: 300, unit_price: 25 },
    ],
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  ordered: { label: "Ordered", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  received: { label: "Received", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
};

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const po = mockPOs.find((p) => p.id === Number(params.id));
  const [status, setStatus] = useState(po?.status ?? "pending");

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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Order Not Found</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">The requested purchase order does not exist</p>
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

  const subtotal = po.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;
  const config = statusConfig[status] || statusConfig.pending;

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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">PO-{String(po.id).padStart(3, "0")}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Purchase order details</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-neutral-500">Supplier</p>
            <p className="text-sm font-medium">{po.supplier.name}</p>
            <p className="text-xs text-neutral-500">{po.supplier.phone}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Branch</p>
            <p className="text-sm font-medium">{po.branch}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Status</p>
            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${config.className}`}>
              {config.label}
            </span>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Date</p>
            <p className="text-sm">{po.created_at}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Expected Delivery</p>
            <p className="text-sm">{po.expected_delivery}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-neutral-500">
                <th className="pb-2 font-medium">Medicine</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Unit Price</th>
                <th className="pb-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-medium">{item.medicine}</td>
                  <td className="py-2.5 text-right">{item.quantity}</td>
                  <td className="py-2.5 text-right">ETB {item.unit_price}</td>
                  <td className="py-2.5 text-right font-medium">ETB {(item.quantity * item.unit_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span>ETB {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Tax (15%)</span>
              <span>ETB {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 text-sm font-medium">
              <span>Total</span>
              <span>ETB {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {status === "pending" && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStatus("received")}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Mark as Received
          </button>
          <button
            onClick={() => setStatus("cancelled")}
            className="rounded-md bg-transparent px-4 py-2 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}
