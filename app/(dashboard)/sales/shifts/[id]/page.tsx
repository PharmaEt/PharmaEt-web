"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, DollarSign, Wallet, CreditCard, Smartphone, Building, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { getShift, type ApiShift } from "@/lib/api/shifts";
import { formatDate } from "@/lib/utils";

export default function ShiftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const shiftId = params.id as string;
  const { toast } = useToast();

  const [shift, setShift] = useState<ApiShift | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShiftDetail() {
      setIsLoading(true);
      try {
        const res = await getShift(shiftId);
        setShift(res.data);
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load shift audit details", "error");
      } finally {
        setIsLoading(false);
      }
    }

    if (shiftId) {
      loadShiftDetail();
    }
  }, [shiftId]);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-neutral-500">Loading register shift audit details...</div>;
  }

  if (!shift) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Shift Not Found</h1>
          </div>
        </div>
        <Link
          href="/sales/shifts"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Back to Shifts
        </Link>
      </div>
    );
  }

  const sales = shift.sales || [];
  const nonVoidedSales = sales.filter((s: any) => s.status !== "voided");

  const cashSales = nonVoidedSales.filter((s: any) => s.payment_type === "cash").reduce((sum: number, s: any) => sum + (parseFloat(s.total) || 0), 0);
  const cardSales = nonVoidedSales.filter((s: any) => s.payment_type === "card").reduce((sum: number, s: any) => sum + (parseFloat(s.total) || 0), 0);
  const mobileMoneySales = nonVoidedSales.filter((s: any) => s.payment_type === "mobile_money" || s.payment_type === "telebirr").reduce((sum: number, s: any) => sum + (parseFloat(s.total) || 0), 0);
  const bankTransferSales = nonVoidedSales.filter((s: any) => s.payment_type === "bank_transfer").reduce((sum: number, s: any) => sum + (parseFloat(s.total) || 0), 0);
  const totalRevenue = nonVoidedSales.reduce((sum: number, s: any) => sum + (parseFloat(s.total) || 0), 0);

  const openingFloat = parseFloat(String(shift.opening_balance)) || 0;
  const expectedCash = shift.expected_cash ?? (openingFloat + cashSales);
  const actualCash = shift.actual_cash !== null && shift.actual_cash !== undefined ? parseFloat(String(shift.actual_cash)) : null;
  const difference = shift.difference !== null && shift.difference !== undefined ? parseFloat(String(shift.difference)) : (actualCash !== null ? actualCash - expectedCash : null);

  const shiftCode = `SHIFT-${String(shift.id).padStart(4, "0")}`;
  const isOpen = shift.status === "open";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div>
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shifts
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{shiftCode}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isOpen
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                }`}>
                  {isOpen ? "Active Shift" : "Closed Shift"}
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
                Cashier: <span className="font-medium text-neutral-900 dark:text-neutral-100">{shift.user?.name ?? "Unassigned"}</span> ({shift.user?.email ?? "—"}) • Branch: <span className="font-medium text-neutral-900 dark:text-neutral-100">{shift.branch?.name ?? "Global HQ"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Opening Cash Float</span>
            <DollarSign className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold tracking-tight">{openingFloat.toLocaleString()} ETB</p>
          <p className="mt-1 text-[11px] text-neutral-400">Initial drawer balance</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Total Sales Revenue</span>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{totalRevenue.toLocaleString()} ETB</p>
          <p className="mt-1 text-[11px] text-neutral-400">{nonVoidedSales.length} total completed sales</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Expected Cash in Drawer</span>
            <Building className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{expectedCash.toLocaleString()} ETB</p>
          <p className="mt-1 text-[11px] text-neutral-400">Float + Cash Sales</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Reconciliation Variance</span>
            {difference !== null && difference !== 0 ? (
              <AlertCircle className={`h-4 w-4 ${difference < 0 ? "text-red-500" : "text-amber-500"}`} />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <p className={`mt-2 text-lg sm:text-xl font-bold tracking-tight ${
            difference === null || difference === 0
              ? "text-neutral-900 dark:text-neutral-100"
              : difference < 0
              ? "text-red-600 dark:text-red-400"
              : "text-amber-600 dark:text-amber-400"
          }`}>
            {difference !== null ? `${difference > 0 ? `+${difference}` : difference} ETB` : "In Progress"}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            {actualCash !== null ? `Counted Cash: ${actualCash.toLocaleString()} ETB` : "Shift still open"}
          </p>
        </div>
      </div>

      {/* Payment Method Breakdown & Shift Audit Info */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Payment Methods */}
        <div className="md:col-span-2 rounded-lg border border-border bg-white p-4 sm:p-5 dark:bg-[#0A0A0A]">
          <h3 className="text-sm font-semibold mb-3">Payment Method Breakdown</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-neutral-50 p-3.5 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                <span>Cash Sales</span>
              </div>
              <p className="mt-1.5 text-base font-bold">{cashSales.toLocaleString()} ETB</p>
              <p className="mt-0.5 text-[10px] text-neutral-400">
                {totalRevenue > 0 ? `${((cashSales / totalRevenue) * 100).toFixed(1)}% of total` : "0%"}
              </p>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3.5 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                <span>Telebirr / Mobile Money</span>
              </div>
              <p className="mt-1.5 text-base font-bold">{mobileMoneySales.toLocaleString()} ETB</p>
              <p className="mt-0.5 text-[10px] text-neutral-400">
                {totalRevenue > 0 ? `${((mobileMoneySales / totalRevenue) * 100).toFixed(1)}% of total` : "0%"}
              </p>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3.5 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <CreditCard className="h-3.5 w-3.5 text-purple-500" />
                <span>Card & Bank Transfers</span>
              </div>
              <p className="mt-1.5 text-base font-bold">{(cardSales + bankTransferSales).toLocaleString()} ETB</p>
              <p className="mt-0.5 text-[10px] text-neutral-400">
                {totalRevenue > 0 ? `${(((cardSales + bankTransferSales) / totalRevenue) * 100).toFixed(1)}% of total` : "0%"}
              </p>
            </div>
          </div>
        </div>

        {/* Shift Audit Timeline */}
        <div className="rounded-lg border border-border bg-white p-4 sm:p-5 dark:bg-[#0A0A0A]">
          <h3 className="text-sm font-semibold mb-3">Shift Audit Timeline</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Opened At</p>
                <p className="text-neutral-500">{formatDate(shift.opened_at)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Closed At</p>
                <p className="text-neutral-500">{shift.closed_at ? formatDate(shift.closed_at) : "Shift is currently open"}</p>
              </div>
            </div>

            {shift.notes && (
              <div className="rounded-md bg-neutral-50 p-2.5 dark:bg-neutral-900/50 text-[11px] text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold">Notes:</span> {shift.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Sales Transactions Audit Table */}
      <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Sales Transactions in Shift ({sales.length})</h2>
          <span className="text-xs text-neutral-500">Live cashier audit log</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left bg-neutral-50 dark:bg-neutral-900/50">
                <th className="px-4 py-2.5 font-medium uppercase tracking-wider text-neutral-500">Receipt #</th>
                <th className="px-4 py-2.5 font-medium uppercase tracking-wider text-neutral-500">Time</th>
                <th className="px-4 py-2.5 font-medium uppercase tracking-wider text-neutral-500">Items Sold</th>
                <th className="px-4 py-2.5 font-medium uppercase tracking-wider text-neutral-500">Payment Method</th>
                <th className="px-4 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Subtotal</th>
                <th className="px-4 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Tax (15% VAT)</th>
                <th className="px-4 py-2.5 font-medium uppercase tracking-wider text-neutral-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.length > 0 ? (
                sales.map((sale: any) => {
                  const saleCode = `SALE-${String(sale.id).padStart(4, "0")}`;
                  const itemsList = (sale.items || []).map((it: any) => `${it.product?.name ?? "Item"} (×${it.quantity})`).join(", ");
                  const isVoided = sale.status === "voided";

                  return (
                    <tr key={sale.id} className={`border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 ${isVoided ? "opacity-50 line-through bg-red-50/20" : ""}`}>
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">{saleCode}</td>
                      <td className="px-4 py-3 text-neutral-500">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3 max-w-xs truncate font-medium text-neutral-800 dark:text-neutral-200">{itemsList || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 capitalize">
                          {sale.payment_type ? sale.payment_type.replace(/_/g, " ") : "cash"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-600 dark:text-neutral-400">{(parseFloat(sale.subtotal) || 0).toLocaleString()} ETB</td>
                      <td className="px-4 py-3 text-right text-neutral-600 dark:text-neutral-400">{(parseFloat(sale.tax) || 0).toLocaleString()} ETB</td>
                      <td className="px-4 py-3 text-right font-bold text-neutral-900 dark:text-neutral-100">{(parseFloat(sale.total) || 0).toLocaleString()} ETB</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-neutral-400">
                    No sales transactions registered during this shift.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
