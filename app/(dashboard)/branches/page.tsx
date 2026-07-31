"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { mockBranches } from "@/lib/mock-data";

export default function BranchesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [branches, setBranches] = useState(mockBranches);

  const totalStaff = branches.reduce((sum, b) => sum + b.users.length, 0);
  const totalManagers = branches.reduce(
    (sum, b) => sum + b.users.filter((u) => u.role === "manager").length,
    0
  );

  const columns = [
    {
      key: "name",
      header: "Branch",
      render: (item: typeof mockBranches[0]) => (
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-neutral-500">{item.location}</p>
        </div>
      ),
    },
    {
      key: "manager",
      header: "Manager",
      render: (item: typeof mockBranches[0]) => {
        const manager = item.users.find((u) => u.role === "manager");
        return (
          <div>
            <p className="text-sm">{manager?.name ?? "—"}</p>
            {manager?.email && (
              <p className="text-xs text-neutral-500">{manager.email}</p>
            )}
          </div>
        );
      },
    },
    {
      key: "phone",
      header: "Phone",
      render: (item: typeof mockBranches[0]) => (
        <span className="text-neutral-500 text-sm">{item.phone ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "staff",
      header: "Staff",
      render: (item: typeof mockBranches[0]) => {
        const pharmacists = item.users.filter((u) => u.role === "pharmacist").length;
        const cashiers = item.users.filter((u) => u.role === "cashier").length;
        const others = item.users.filter(
          (u) => u.role !== "pharmacist" && u.role !== "cashier" && u.role !== "manager"
        ).length;
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {item.users.length} total
            </span>
            <span className="hidden text-xs text-neutral-500 sm:inline">
              {pharmacists}P / {cashiers}C{others > 0 ? ` / ${others}O` : ""}
            </span>
          </div>
        );
      },
      hideOnMobile: true,
    },
    {
      key: "founded_year",
      header: "Year",
      render: (item: typeof mockBranches[0]) => (
        <span className="text-neutral-500 text-sm">{item.founded_year ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: typeof mockBranches[0]) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/branches/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => router.push(`/branches/${item.id}`)}
            aria-label="Edit"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteId(item.id)}
            aria-label="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Branches"
        subtitle="Manage pharmacy branches"
        action={{ label: "Add Branch", icon: Plus, href: "/branches/new" }}
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
        <StatsCard title="Branches" value={branches.length} />
        <StatsCard title="Staff" value={totalStaff} />
        <StatsCard title="Managers" value={totalManagers} />
        <StatsCard title="Active" value={branches.length} />
      </div>

      <DataTable columns={columns} data={branches} emptyMessage="No branches found" />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete branch?"
        description="This will permanently delete this branch and remove all associated data. This cannot be undone."
        onConfirm={() => {
          setBranches((prev) => prev.filter((b) => b.id !== deleteId));
          setDeleteId(null);
          toast("Branch deleted successfully");
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
