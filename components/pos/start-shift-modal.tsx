"use client";

import { useState } from "react";
import { DollarSign, ShieldAlert } from "lucide-react";

interface StartShiftModalProps {
  isOpen: boolean;
  onStartShift: (openingFloat: number, notes: string) => void;
  cashierName: string;
}

export function StartShiftModal({ isOpen, onStartShift, cashierName }: StartShiftModalProps) {
  const [openingFloat, setOpeningFloat] = useState<string>("1000");
  const [notes, setNotes] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const floatValue = parseFloat(openingFloat) || 0;
    onStartShift(floatValue, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Open Register Shift
            </h3>
            <p className="text-xs text-neutral-500">
              Cashier: <span className="font-medium text-neutral-800 dark:text-neutral-200">{cashierName}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Please count the physical small change cash in your drawer before opening the register.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Opening Cash Float in Drawer (ETB)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="1000"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(e.target.value)}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 pl-9 text-base font-semibold focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
              <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">
                ETB
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Notes (Optional cash breakdown)
            </label>
            <input
              type="text"
              placeholder="e.g. 10x 100 Birr notes, 20x 50 Birr notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex h-10 w-full items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Start Shift & Open POS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
