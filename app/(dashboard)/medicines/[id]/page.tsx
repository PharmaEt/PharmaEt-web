"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { mockMedicines, mockCategories, mockBranches } from "@/lib/mock-data";

export default function MedicineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const medicine = mockMedicines.find((m) => m.id === Number(params.id));

  if (!medicine) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Medicine Not Found</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">The requested medicine does not exist</p>
          </div>
        </div>
        <Link
          href="/medicines"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const cat = medicine.category ?? mockCategories.find((c) => c.id === medicine.category_id);
  const branch = medicine.branch ?? mockBranches.find((b) => b.id === medicine.branch_id);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{medicine.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{medicine.strength} · {medicine.dosage_form}</p>
          </div>
        </div>
        <Link
          href={`/medicines/${medicine.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Product Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Name</span>
              <span className="font-medium">{medicine.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Generic Name</span>
              <span>{medicine.generic_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Strength</span>
              <span>{medicine.strength}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Dosage Form</span>
              <span>{medicine.dosage_form}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Category</span>
              <span>{cat?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Prescription Required</span>
              <span>{medicine.is_prescription_required ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Pricing & Stock</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Pack Size</span>
              <span>{medicine.pack_size} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Pack Price</span>
              <span className="font-medium">{medicine.pack_price.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Unit Price</span>
              <span>{medicine.unit_price.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Current Stock</span>
              <span className={`font-medium ${medicine.current_stock <= medicine.min_stock_alert ? "text-red-600 dark:text-red-400" : ""}`}>
                {medicine.current_stock} units
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Min Stock Alert</span>
              <span>{medicine.min_stock_alert} units</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Status</span>
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                medicine.status === "active"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              }`}>
                {medicine.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Branch</span>
              <span>{branch?.name ?? "Global"}</span>
            </div>
            {medicine.description && (
              <div className="pt-2">
                <span className="text-sm text-neutral-500">Description</span>
                <p className="mt-1 text-sm">{medicine.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
