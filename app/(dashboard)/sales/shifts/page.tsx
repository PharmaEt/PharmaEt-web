"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { getShifts, type ApiShift } from "@/lib/api/shifts";
import { formatDate } from "@/lib/utils";

export default function ShiftsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shifts, setShifts] = useState<ApiShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      const res = await getShifts({
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setShifts(list);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load cashier shifts", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [statusFilter]);

  const filtered = shifts.filter((s) => {
    const cashierName = s.user?.name ?? "";
    const branchName = s.branch?.name ?? "";
    return (
      cashierName.toLowerCase().includes(search.toLowerCase()) ||
      branchName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: ApiShift, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{index + 1}</span>
      ),
    },
    {
      key: "opened_at",
      header: "Opened At",
      render: (item: ApiShift) => (
        <span className="text-sm">{formatDate(item.opened_at)}</span>
      ),
    },
    {
      key: "user",
      header: "Cashier",
      render: (item: ApiShift) => (
        <span className="font-medium text-sm">{item.user?.name ?? "—"}</span>
      ),
    },
    {
      key: "branch",
      header: "Branch",
      render: (item: ApiShift) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.branch?.name ?? "Global"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "opening_balance",
      header: "Opening Float",
      render: (item: ApiShift) => (
        <span className="text-sm font-medium">{item.opening_balance.toLocaleString()} ETB</span>
      ),
    },
    {
      key: "actual_cash",
      header: "Closed Cash",
      render: (item: ApiShift) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {item.actual_cash !== null && item.actual_cash !== undefined
            ? `${item.actual_cash.toLocaleString()} ETB`
            : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "difference",
      header: "Discrepancy",
      render: (item: ApiShift) => {
        if (item.difference === null || item.difference === undefined) return <span className="text-sm text-neutral-400">—</span>;
        const diff = item.difference;
        const isNegative = diff < 0;
        const isPositive = diff > 0;
        return (
          <span className={`text-sm font-medium ${isNegative ? "text-red-600 dark:text-red-400" : isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-600 dark:text-neutral-400"}`}>
            {diff > 0 ? `+${diff}` : diff} ETB
          </span>
        );
      },
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (item: ApiShift) => (
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
          item.status === "open"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
        }`}>
          {item.status === "open" ? "OPEN" : "CLOSED"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Cashier Register Shifts" subtitle="Audit shift history and cash drawer reconciliations" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search cashier or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open Shifts</option>
          <option value="closed">Closed Shifts</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading cashier register shifts..." : "No shifts found"} />
    </div>
  );
}
