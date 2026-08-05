"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, ArrowRightLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { getBranches } from "@/lib/api/branches";
import { getStockTransfers, type ApiStockTransfer } from "@/lib/api/stock-transfers";
import { extractListData, extractPaginationMeta } from "@/lib/api/client";
import { Pagination } from "@/components/ui/pagination";
import type { ApiBranch } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function StockTransfersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isManager, isOwner } = useAuth();
  const [transfers, setTransfers] = useState<ApiStockTransfer[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 });

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await getBranches();
        setBranches(extractListData<ApiBranch>(res));
      } catch {
        // Silent error
      }
    }
    loadBranches();
  }, []);

  const getBranchName = (branchId: number, relationBranch?: { name: string }) => {
    if (relationBranch?.name) return relationBranch.name;
    const match = branches.find((b) => b.id === branchId);
    return match ? match.name : `Branch #${branchId}`;
  };

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const res = await getStockTransfers({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        per_page: perPage,
      });
      const list = extractListData<ApiStockTransfer>(res);
      setTransfers(list);
      setMeta(extractPaginationMeta(res, list.length));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load stock transfers", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [statusFilter, page, perPage]);

  const filtered = transfers.filter((t) => {
    const term = search.toLowerCase();
    const fromName = getBranchName(t.from_branch_id, t.fromBranch || t.from_branch).toLowerCase();
    const toName = getBranchName(t.to_branch_id, t.toBranch || t.to_branch).toLowerCase();
    return (
      t.transfer_number.toLowerCase().includes(term) ||
      fromName.includes(term) ||
      toName.includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "requested":
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">Requested</span>;
      case "approved":
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">Approved</span>;
      case "dispatched":
        return <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">Dispatched</span>;
      case "received":
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Received</span>;
      case "rejected":
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">Rejected</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">{status}</span>;
    }
  };

  const columns = [
    {
      key: "row_num",
      header: "#",
      render: (_: ApiStockTransfer, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{index + 1}</span>
      ),
    },
    {
      key: "transfer_number",
      header: "Transfer #",
      render: (item: ApiStockTransfer) => (
        <span className="font-medium text-sm">{item.transfer_number}</span>
      ),
    },
    {
      key: "from",
      header: "From Branch",
      render: (item: ApiStockTransfer) => (
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {getBranchName(item.from_branch_id, item.fromBranch || item.from_branch)}
        </span>
      ),
    },
    {
      key: "to",
      header: "To Branch",
      render: (item: ApiStockTransfer) => (
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {getBranchName(item.to_branch_id, item.toBranch || item.to_branch)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: ApiStockTransfer) => getStatusBadge(item.status),
    },
    {
      key: "items_count",
      header: "Items",
      render: (item: ApiStockTransfer) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.items?.length ?? 0}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "date",
      header: "Requested Date",
      render: (item: ApiStockTransfer) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{formatDate(item.created_at)}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (item: ApiStockTransfer) => (
        <button
          onClick={() => router.push(`/stock-transfers/${item.id}`)}
          aria-label="View Transfer"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Stock Transfers"
        subtitle="Manage inter-branch inventory transfers"
        action={
          (isManager || isOwner)
            ? {
                label: "Request Transfer",
                icon: Plus,
                onClick: () => router.push("/stock-transfers/new"),
              }
            : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search transfers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-neutral-200 bg-transparent px-3 text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        >
          <option value="all">All Statuses</option>
          <option value="requested">Requested</option>
          <option value="approved">Approved</option>
          <option value="dispatched">Dispatched</option>
          <option value="received">Received</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading stock transfers..." : "No stock transfers found"} />
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
    </div>
  );
}
