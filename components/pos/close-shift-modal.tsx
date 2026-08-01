"use client";

import { useState } from "react";
import { X, Printer, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export interface ShiftSummaryData {
  cashierName: string;
  startTime: string;
  openingFloat: number;
  cashSales: number;
  telebirrSales: number;
  cardSales: number;
  totalTransactions: number;
}

interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData: ShiftSummaryData;
  onCompleteCloseShift: (summary: ShiftSummaryData & { countedCash: number; discrepancy: number }) => void;
}

export function CloseShiftModal({
  isOpen,
  onClose,
  shiftData,
  onCompleteCloseShift,
}: CloseShiftModalProps) {
  const { toast } = useToast();
  const expectedCashInDrawer = shiftData.openingFloat + shiftData.cashSales;
  const [countedCash, setCountedCash] = useState<string>(expectedCashInDrawer.toString());
  const [notes, setNotes] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const numericCountedCash = parseFloat(countedCash) || 0;
  const discrepancy = numericCountedCash - expectedCashInDrawer;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast("Register Shift closed and cash reconciled successfully!", "success");
    onCompleteCloseShift({
      ...shiftData,
      countedCash: numericCountedCash,
      discrepancy,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Close Register Shift & Reconcile
            </h3>
            <p className="text-xs text-neutral-500">
              Cashier: <span className="font-medium text-neutral-800 dark:text-neutral-200">{shiftData.cashierName}</span> | Started: {shiftData.startTime}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Summary Breakdown */}
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Opening Cash Float:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {shiftData.openingFloat.toLocaleString()} ETB
              </span>
            </div>
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Today&apos;s Cash Sales:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                +{shiftData.cashSales.toLocaleString()} ETB
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-neutral-200 dark:border-neutral-800 font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              <span>Expected Cash in Drawer:</span>
              <span>{expectedCashInDrawer.toLocaleString()} ETB</span>
            </div>
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-neutral-500">Telebirr Sales:</span>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{shiftData.telebirrSales.toLocaleString()} ETB</p>
              </div>
              <div>
                <span className="text-neutral-500">Card / Credit Sales:</span>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{shiftData.cardSales.toLocaleString()} ETB</p>
              </div>
            </div>
          </div>

          {/* Physical Cash Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
              Physical Cash Counted in Drawer (ETB)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={countedCash}
              onChange={(e) => setCountedCash(e.target.value)}
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-lg font-bold focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
            />
          </div>

          {/* Discrepancy Indicator */}
          <div
            className={`rounded-md p-3 text-xs flex items-center justify-between border ${
              discrepancy === 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                : discrepancy < 0
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {discrepancy === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span>
                {discrepancy === 0
                  ? "Perfect Balance (No Discrepancy)"
                  : discrepancy < 0
                  ? `Shortage Discrepancy: ${discrepancy.toLocaleString()} ETB`
                  : `Overage Discrepancy: +${discrepancy.toLocaleString()} ETB`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Reason / Notes for Discrepancy
            </label>
            <input
              type="text"
              placeholder="e.g. Returned 10 ETB extra change to customer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Shift Report
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 rounded-md bg-neutral-900 px-4 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Close Shift
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
