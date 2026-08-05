"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { getSales, type ApiSale } from "@/lib/api/pos";
import { extractListData, extractPaginationMeta } from "@/lib/api/client";
import { Pagination } from "@/components/ui/pagination";
import { formatDate } from "@/lib/utils";

export default function SalesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<ApiSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 });

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await getSales({ page, page_size: perPage } as any);
      const list = extractListData<ApiSale>(res);
      setSales(list);
      setMeta(extractPaginationMeta(res, list.length));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load sales history", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, perPage]);

  const filtered = sales.filter((s) => {
    const cashierName = s.served_by?.name ?? "";
    return cashierName.toLowerCase().includes(search.toLowerCase());
  });

  const columns = [
    {
      key: "row_num",
      header: "#",
      render: (_: ApiSale, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{(page - 1) * perPage + index + 1}</span>
      ),
    },
    {
      key: "id",
      header: "Receipt #",
      render: (item: ApiSale) => (
        <span className="font-semibold text-sm">SALE-{String(item.id).padStart(4, "0")}</span>
      ),
    },
    {
      key: "created_at",
      header: "Date & Time",
      render: (item: ApiSale) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{formatDate(item.created_at)}</span>
      ),
    },
    {
      key: "payment_type",
      header: "Payment",
      render: (item: ApiSale) => (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 capitalize">
          {item.payment_type ? item.payment_type.replace(/_/g, " ") : "cash"}
        </span>
      ),
    },
    {
      key: "items",
      header: "Items Count",
      render: (item: ApiSale) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {(item.items || []).length} line items
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "total",
      header: "Total Revenue",
      render: (item: ApiSale) => (
        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          {(parseFloat(String(item.total)) || 0).toLocaleString()} ETB
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (item: ApiSale) => (
        <button
          onClick={() => router.push(`/sales/${item.id}`)}
          aria-label="View"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Sales History" subtitle="Audit all historical counter sales and customer transactions" />

      <div className="flex items-center justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search cashier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading sales history..." : "No sales found"} />
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
