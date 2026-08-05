"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { getStockMovements } from "@/lib/api/stock";

import { extractListData, extractPaginationMeta } from "@/lib/api/client";
import { Pagination } from "@/components/ui/pagination";

const typeConfig: Record<string, { label: string; className: string }> = {
  purchase: { label: "Purchase", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  sale: { label: "Sale", className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
  return: { label: "Return", className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  adjustment: { label: "Adjustment", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
  transfer_in: { label: "Transfer In", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  transfer_out: { label: "Transfer Out", className: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
};

export default function StockMovementsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 });

  const fetchMovements = async () => {
    setIsLoading(true);
    try {
      const res = await getStockMovements({
        search,
        type: typeFilter !== "all" ? typeFilter : undefined,
        page,
        per_page: perPage,
      });
      const list = extractListData<any>(res);
      setMovements(list);
      setMeta(extractPaginationMeta(res, list.length));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load stock movements audit log", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [search, typeFilter, page, perPage]);

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: any, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{(page - 1) * perPage + index + 1}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item: any) => (
        <span className="text-sm">{item.created_at && !isNaN(Date.parse(item.created_at)) ? new Date(item.created_at).toLocaleDateString() : "—"}</span>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (item: any) => (
        <span className="font-medium text-sm">{item.product?.name ?? "—"}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item: any) => {
        const config = typeConfig[item.type] || { label: item.type, className: "bg-neutral-100 text-neutral-600" };
        return (
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "quantity",
      header: "Inventory Change",
      render: (item: any) => {
        const qty = item.quantity || 0;
        const packSize = item.product?.pack_size || (item.product as any)?.productable?.pack_size || 1;
        const isNegative = qty < 0 || item.type === "sale" || item.type === "transfer_out";

        let formatted = `${qty > 0 ? `+${qty}` : qty} Units`;
        if (packSize > 1) {
          const absQty = Math.abs(qty);
          const packs = Math.floor(absQty / packSize);
          const remUnits = absQty % packSize;

          if (packs > 0) {
            const packStr = `${isNegative ? "-" : "+"}${packs} ${packs === 1 ? "Pack" : "Packs"}`;
            const unitStr = remUnits > 0 ? `, ${remUnits} ${remUnits === 1 ? "Unit" : "Units"}` : "";
            formatted = `${packStr}${unitStr} (${qty > 0 ? `+${qty}` : qty} Base Units)`;
          }
        }

        return (
          <span className={`font-medium text-sm ${isNegative ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {formatted}
          </span>
        );
      },
    },
    {
      key: "user",
      header: "Logged By",
      render: (item: any) => {
        const userObj = typeof item.created_by === "object" ? item.created_by : item.created_by_user || item.createdBy || item.user;
        const userName = userObj?.name ?? (typeof item.created_by === "string" || typeof item.created_by === "number" ? String(item.created_by) : "—");
        return <span className="text-neutral-500 text-sm">{userName}</span>;
      },
      hideOnMobile: true,
    },
    {
      key: "branch",
      header: "Branch",
      render: (item: any) => {
        const branchName = item.stock?.branch?.name || item.branch?.name || null;
        return (
          <span className="text-neutral-500 text-sm">{branchName ?? item.branch_id ?? "—"}</span>
        );
      },
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Stock Movements" subtitle="Audit log tracking inventory changes" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search movements..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
        >
          <option value="all">All Movement Types</option>
          <option value="purchase">Purchase</option>
          <option value="sale">Sale</option>
          <option value="return">Return</option>
          <option value="adjustment">Adjustment</option>
          <option value="transfer_in">Transfer In</option>
          <option value="transfer_out">Transfer Out</option>
        </select>
      </div>

      {!isLoading && movements.length === 0 ? (
        <EmptyState
          title="No stock movements found"
          description="Try clearing your search query or selecting a different movement type."
        />
      ) : (
        <>
          <DataTable columns={columns} data={movements} emptyMessage={isLoading ? "Loading stock movements audit log..." : "No movements found"} />
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
        </>
      )}
    </div>
  );
}


