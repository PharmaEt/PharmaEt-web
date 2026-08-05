"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { getStockBatches } from "@/lib/api/stock";
import { extractListData, extractPaginationMeta } from "@/lib/api/client";
import { Pagination } from "@/components/ui/pagination";
import { formatDate } from "@/lib/utils";
import type { ApiStock } from "@/lib/mock-data";

function getProductName(stock: ApiStock): string {
  const p = stock.product as any;
  if (!p) return "—";
  const details = p.productable;
  if (details?.strength) return `${p.name} ${details.strength}`;
  if (p.strength) return `${p.name} ${p.strength}`;
  return p.name;
}

function getProductForm(stock: ApiStock): string {
  const p = stock.product as any;
  if (!p) return "—";
  const details = p.productable;
  if (details?.dosage_form) return details.dosage_form;
  if (details?.product_type) return details.product_type;
  if (p.dosage_form) return p.dosage_form;
  if (p.product_type) return p.product_type;
  return "—";
}

export default function StockPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { canManageCatalog } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [stocks, setStocks] = useState<ApiStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 });

  // Auto-detect #alerts hash on load or URL hash change
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#alerts") {
        setFilter("low");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const res = await getStockBatches({ search, page, per_page: perPage });
      const list = extractListData<ApiStock>(res);
      setStocks(list);
      setMeta(extractPaginationMeta(res, list.length));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load inventory stock batches", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [search, page, perPage]);

  // Compute alert summary counts
  const lowStockCount = stocks.filter((s) => s.quantity <= (s.product?.min_stock_alert ?? 10)).length;
  const expiringCount = stocks.filter((s) => {
    if (!s.expiry_date) return false;
    const daysLeft = Math.ceil((new Date(s.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 90;
  }).length;
  const expiredCount = stocks.filter((s) => {
    if (!s.expiry_date) return false;
    const daysLeft = Math.ceil((new Date(s.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 0;
  }).length;

  const filtered = stocks.filter((s) => {
    const minAlert = s.product?.min_stock_alert ?? 10;
    const daysLeft = s.expiry_date ? Math.ceil((new Date(s.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

    if (filter === "low") return s.quantity <= minAlert;
    if (filter === "expiring") return daysLeft !== null && daysLeft > 0 && daysLeft <= 90;
    if (filter === "expired") return daysLeft !== null && daysLeft <= 0;
    if (filter === "ok") return s.quantity > minAlert && (daysLeft === null || daysLeft > 90);
    return true;
  });

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: ApiStock, index: number) => (
        <span className="font-medium text-sm text-neutral-500">{(page - 1) * perPage + index + 1}</span>
      ),
    },
    {
      key: "batch_number",
      header: "Batch #",
      render: (item: ApiStock) => (
        <span className="font-mono text-sm font-semibold">{item.batch_number || "—"}</span>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (item: ApiStock) => (
        <div>
          <p className="font-medium text-sm">{getProductName(item)}</p>
          <p className="text-xs text-neutral-400">{getProductForm(item)}</p>
        </div>
      ),
    },
    {
      key: "branch",
      header: "Branch",
      render: (item: ApiStock) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{(item as any).branch?.name ?? "Global"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "quantity",
      header: "Available Stock",
      render: (item: ApiStock) => {
        const minAlert = item.product?.min_stock_alert ?? 10;
        const isLow = item.quantity <= minAlert;
        return (
          <span className={`font-semibold text-sm ${isLow ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {item.quantity} units
          </span>
        );
      },
    },
    {
      key: "selling_price",
      header: "Selling Price",
      render: (item: ApiStock) => (
        <span className="text-sm font-medium">{(parseFloat(String(item.selling_price)) || 0).toLocaleString()} ETB</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "expiry_date",
      header: "Expiry Date",
      render: (item: ApiStock) => {
        if (!item.expiry_date) return <span className="text-sm text-neutral-400">—</span>;
        const daysLeft = Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isExpired = daysLeft <= 0;
        const isExpiring = daysLeft > 0 && daysLeft <= 90;

        return (
          <span className={`text-sm font-medium ${
            isExpired ? "text-red-600 dark:text-red-400" : isExpiring ? "text-amber-600 dark:text-amber-400" : "text-neutral-600 dark:text-neutral-400"
          }`}>
            {formatDate(item.expiry_date)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="Stock Inventory" 
        subtitle="Audit batch levels, expiry dates, and pricing"
        action={canManageCatalog ? { label: "Add Stock Intake", icon: Plus, href: "/stock/new" } : undefined}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={() => setFilter(filter === "low" ? "all" : "low")}
          className={`flex items-center justify-between rounded-lg border p-4 text-left transition-all ${
            filter === "low"
              ? "border-amber-600 bg-amber-100/50 dark:border-amber-900 dark:bg-amber-950/60"
              : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:hover:border-neutral-700"
          }`}
        >
          <div>
            <p className="text-xs font-medium text-neutral-500">Low Stock Alerts</p>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">{lowStockCount}</p>
          </div>
        </button>

        <button
          onClick={() => setFilter(filter === "expiring" ? "all" : "expiring")}
          className={`flex items-center justify-between rounded-lg border p-4 text-left transition-all ${
            filter === "expiring"
              ? "border-amber-600 bg-amber-100/50 dark:border-amber-900 dark:bg-amber-950/60"
              : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:hover:border-neutral-700"
          }`}
        >
          <div>
            <p className="text-xs font-medium text-neutral-500">Expiring Soon (90 Days)</p>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">{expiringCount}</p>
          </div>
        </button>

        <button
          onClick={() => setFilter(filter === "expired" ? "all" : "expired")}
          className={`flex items-center justify-between rounded-lg border p-4 text-left transition-all ${
            filter === "expired"
              ? "border-red-600 bg-red-100/50 dark:border-red-900 dark:bg-red-950/60"
              : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:hover:border-neutral-700"
          }`}
        >
          <div>
            <p className="text-xs font-medium text-neutral-500">Expired Batches</p>
            <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400">{expiredCount}</p>
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search stock..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
        >
          <option value="all">All Stock Batches</option>
          <option value="low">Low Stock Alerts</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired Batches</option>
          <option value="ok">Normal Stock</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={isLoading ? "Loading inventory stock batches..." : "No matching stock data found"} />
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
