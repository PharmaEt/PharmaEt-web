"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, DollarSign, Package, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiSupplier } from "@/lib/types";
import { getSupplier, updateSupplier } from "@/lib/api/suppliers";
import { getPurchaseOrders, type ApiPurchaseOrder } from "@/lib/api/purchase-orders";
import { getStockBatches } from "@/lib/api/stock";
import { type ApiStock } from "@/lib/types";
import { extractListData } from "@/lib/api/client";
import { StatusBadge } from "@/components/ui/status-badge";

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { canManageCatalog } = useAuth();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<ApiSupplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [purchaseOrders, setPurchaseOrders] = useState<ApiPurchaseOrder[]>([]);
  const [stockBatches, setStockBatches] = useState<ApiStock[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    telegram_chat_id: "",
  });

  useEffect(() => {
    async function loadSupplier() {
      setLoading(true);
      try {
        const res = await getSupplier(supplierId);
        if (res.data) {
          setSupplier(res.data);
          setForm({
            name: res.data.name ?? "",
            contact_person: res.data.contact_person ?? "",
            email: res.data.email ?? "",
            phone: res.data.phone ?? "",
            address: res.data.address ?? "",
            telegram_chat_id: res.data.telegram_chat_id ?? "",
          });
        }
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load supplier details", "error");
      } finally {
        setLoading(false);
      }
    }
    if (supplierId) {
      loadSupplier();
    }
  }, [supplierId]);

  useEffect(() => {
    async function loadAnalytics() {
      setLoadingAnalytics(true);
      try {
        const [poRes, stockRes] = await Promise.all([
          getPurchaseOrders({ supplier_id: supplierId, per_page: 100 }).catch(() => ({ data: [] })),
          getStockBatches({ supplier_id: supplierId, per_page: 100 }).catch(() => ({ data: [] })),
        ]);
        setPurchaseOrders(extractListData<ApiPurchaseOrder>(poRes));
        setStockBatches(extractListData<ApiStock>(stockRes));
      } catch {
        // silently fail — analytics are non-critical
      } finally {
        setLoadingAnalytics(false);
      }
    }
    if (supplierId) {
      loadAnalytics();
    }
  }, [supplierId]);

  const analytics = useMemo(() => {
    const validPOs = purchaseOrders.filter((po) => po.status !== "cancelled");
    const totalOrders = validPOs.length;
    const totalSpend = validPOs.reduce((sum, po) => sum + Number(po.total_amount || 0), 0);
    const lastOrder = validPOs.length > 0
      ? validPOs.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())[0]
      : null;

    const productMap = new Map<number, { name: string; totalQty: number; totalCost: number }>();
    for (const batch of stockBatches) {
      const prod = batch.product;
      if (!prod) continue;
      const key = batch.product_id;
      const existing = productMap.get(key) || { name: prod.name || `Product #${key}`, totalQty: 0, totalCost: 0 };
      existing.totalQty += batch.quantity || 0;
      existing.totalCost += (batch.purchase_cost || 0) * (batch.quantity || 0);
      productMap.set(key, existing);
    }
    const products = Array.from(productMap.values()).sort((a, b) => b.totalCost - a.totalCost);

    const poByStatus = validPOs.reduce(
      (acc, po) => {
        acc[po.status] = (acc[po.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { totalOrders, totalSpend, lastOrder, products, poByStatus };
  }, [purchaseOrders, stockBatches]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <p className="text-sm text-neutral-500">Loading supplier details...</p>
      </div>
    );
  }

  if (!supplier) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Supplier Not Found</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">The supplier you are looking for does not exist.</p>
        <Link
          href="/suppliers"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) {
      toast("You do not have permission to modify suppliers", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateSupplier(supplierId, {
        name: form.name,
        contact_person: form.contact_person || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        telegram_chat_id: form.telegram_chat_id || null,
      });
      toast(res.message || "Supplier updated successfully", "success");
      router.push("/suppliers");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update supplier", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{supplier.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {supplier.contact_person ? `Contact: ${supplier.contact_person}` : "Supplier details & purchase analytics"}
          </p>
        </div>
      </div>

      {/* Analytics Section */}
      {loadingAnalytics ? (
        <p className="text-sm text-neutral-500">Loading purchase analytics...</p>
      ) : (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500">Total Orders</p>
                  <p className="mt-1 text-2xl font-bold">{analytics.totalOrders}</p>
                </div>
                <ShoppingCart className="h-5 w-5 text-neutral-400" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500">Total Spend</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {analytics.totalSpend.toLocaleString()} ETB
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-neutral-400" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500">Products Supplied</p>
                  <p className="mt-1 text-2xl font-bold">{analytics.products.length}</p>
                </div>
                <Package className="h-5 w-5 text-neutral-400" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500">Last Order</p>
                  <p className="mt-1 text-sm font-bold">
                    {analytics.lastOrder
                      ? new Date(analytics.lastOrder.order_date).toLocaleDateString()
                      : "No orders"}
                  </p>
                  {analytics.lastOrder && (
                    <p className="text-[10px] text-neutral-400">
                      {analytics.lastOrder.order_number || `#${analytics.lastOrder.id}`}
                    </p>
                  )}
                </div>
                <Calendar className="h-5 w-5 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Order Status Breakdown */}
          {Object.keys(analytics.poByStatus).length > 0 && (
            <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#0A0A0A]">
              <h3 className="text-xs font-medium text-neutral-500 mb-3">Order Status Breakdown</h3>
              <div className="flex flex-wrap gap-3">
                  {Object.entries(analytics.poByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-2">
                      <StatusBadge status={status as any} />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Products Supplied Table */}
          {analytics.products.length > 0 && (
            <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
              <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <h2 className="text-sm font-semibold">Products Purchased from {supplier.name}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left dark:border-neutral-800">
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Product</th>
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Total Qty</th>
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Total Cost</th>
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Avg Cost/Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.products.map((prod, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-900">
                        <td className="px-4 sm:px-5 py-2.5 text-sm font-medium">{prod.name}</td>
                        <td className="px-4 sm:px-5 py-2.5 text-sm text-right">{prod.totalQty.toLocaleString()}</td>
                        <td className="px-4 sm:px-5 py-2.5 text-sm text-right font-medium text-emerald-700 dark:text-emerald-400">
                          {prod.totalCost.toLocaleString()} ETB
                        </td>
                        <td className="px-4 sm:px-5 py-2.5 text-sm text-right text-neutral-500">
                          {prod.totalQty > 0 ? Math.round(prod.totalCost / prod.totalQty).toLocaleString() : "—"} ETB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Purchase Order History */}
          {purchaseOrders.length > 0 && (
            <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
              <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-purple-500" />
                <h2 className="text-sm font-semibold">Purchase Order History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left dark:border-neutral-800">
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Order #</th>
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Date</th>
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Status</th>
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Amount</th>
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders
                      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
                      .slice(0, 20)
                      .map((po) => (
                        <tr
                          key={po.id}
                          onClick={() => router.push(`/purchase-orders/${po.id}`)}
                          className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-900 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50"
                        >
                          <td className="px-4 sm:px-5 py-2.5 text-sm font-medium">{po.order_number || `#${po.id}`}</td>
                          <td className="px-4 sm:px-5 py-2.5 text-sm text-neutral-500">
                            {new Date(po.order_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-5 py-2.5">
                            <StatusBadge status={po.status} />
                          </td>
                          <td className="px-4 sm:px-5 py-2.5 text-sm text-right font-medium">
                            {Number(po.total_amount || 0).toLocaleString()} ETB
                          </td>
                          <td className="px-4 sm:px-5 py-2.5 text-sm text-right text-neutral-500">
                            {po.items?.length ?? 0}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loadingAnalytics && analytics.totalOrders === 0 && analytics.products.length === 0 && (
            <div className="rounded-lg border border-border bg-white p-6 text-center dark:bg-[#0A0A0A]">
              <Package className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-600" />
              <p className="mt-2 text-sm text-neutral-500">No purchase history yet for this supplier.</p>
              <p className="text-xs text-neutral-400">Purchase orders and stock intake from this supplier will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Form */}
      <div className="max-w-lg">
        <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold">{canManageCatalog ? "Edit Supplier" : "Supplier Information"}</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-5">
            <fieldset disabled={!canManageCatalog} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Supplier Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Ethio Pharma Distribution"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
                />
              </div>

              <div>
                <label htmlFor="contact_person" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Contact Person
                </label>
                <input
                  id="contact_person"
                  type="text"
                  required
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                  placeholder="e.g., Yonas Bekele"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="info@ethiopharma.com"
                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+251911000001"
                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g., Addis Ababa, Bole"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
                />
              </div>

              <div>
                <label htmlFor="telegram" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Telegram Chat ID
                </label>
                <input
                  id="telegram"
                  type="text"
                  required
                  value={form.telegram_chat_id}
                  onChange={(e) => setForm({ ...form, telegram_chat_id: e.target.value })}
                  placeholder="e.g., 1106118198"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
                />
              </div>
            </fieldset>

            {canManageCatalog && (
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  {submitting ? "Updating..." : "Update Supplier"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-md bg-transparent px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
