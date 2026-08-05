"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiBranch } from "@/lib/mock-data";
import { getBranches, deleteBranch } from "@/lib/api/branches";
import { extractListData, extractPaginationMeta } from "@/lib/api/client";
import { Pagination } from "@/components/ui/pagination";

export default function BranchesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOwner } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 });

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const res = await getBranches({ page, per_page: perPage });
      const list = extractListData<ApiBranch>(res);
      setBranches(list);
      setMeta(extractPaginationMeta(res, list.length));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load branches", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [page, perPage]);

  const totalStaff = branches.reduce((sum, b) => sum + (b.users?.length ?? 0), 0);
  const totalManagers = branches.reduce(
    (sum, b) => sum + (b.users?.filter((u) => u.role === "manager").length ?? 0),
    0
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await deleteBranch(deleteId);
      toast(res.message || "Branch deleted successfully", "success");
      setDeleteId(null);
      fetchBranches();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to delete branch", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: ApiBranch, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{(page - 1) * perPage + index + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Branch Name",
      render: (item: ApiBranch) => (
        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{item.name}</span>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (item: ApiBranch) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.location ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "phone",
      header: "Phone",
      render: (item: ApiBranch) => (
        <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400">{item.phone ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "staff_count",
      header: "Staff Members",
      render: (item: ApiBranch) => (
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{item.users?.length ?? 0} staff</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: ApiBranch) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/branches/${item.id}`)}
            aria-label="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {isOwner && (
            <>
              <button
                onClick={() => router.push(`/branches/${item.id}/edit`)}
                aria-label="Edit"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
                aria-label="Delete"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Branches"
        subtitle="Manage pharmacy branch operations"
        action={isOwner ? { label: "Add Branch", icon: Plus, href: "/branches/new" } : undefined}
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
        <StatsCard title="Branches" value={isLoading ? "..." : meta.total || branches.length} />
        <StatsCard title="Staff" value={isLoading ? "..." : totalStaff} />
        <StatsCard title="Managers" value={isLoading ? "..." : totalManagers} />
        <StatsCard title="Active" value={isLoading ? "..." : meta.total || branches.length} />
      </div>

      <DataTable columns={columns} data={branches} emptyMessage={isLoading ? "Loading branches..." : "No branches found"} />
      <Pagination
        currentPage={meta.currentPage}
        lastPage={meta.lastPage}
        total={meta.total}
        perPage={meta.perPage}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setPage(1);
        }}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete branch?"
        description="This will permanently delete this branch and remove all associated data. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
