"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "primary" | "success" | "blue" | "purple";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    primary: "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-50 w-full max-w-md mx-4 rounded-lg border border-border bg-card p-5 shadow-lg">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md bg-transparent px-3.5 py-1.5 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${variantStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
