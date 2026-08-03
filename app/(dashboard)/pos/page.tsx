"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Minus, Plus, ShoppingCart, Check, Printer, DollarSign, Clock, Lock, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { ApiMedicine, ApiCosmetic } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import { Receipt } from "@/components/ui/receipt";
import { StartShiftModal } from "@/components/pos/start-shift-modal";
import { CloseShiftModal, type ShiftSummaryData } from "@/components/pos/close-shift-modal";
import { getCurrentShift, openShift, closeShift } from "@/lib/api/shifts";
import { createSale, getPosProducts, type PosProduct } from "@/lib/api/pos";
import { getCategories } from "@/lib/api/categories";

interface UnifiedProduct {
  id: number;
  name: string;
  type: "medicine" | "cosmetic";
  category_id: number;
  pack_size: number;
  pack_price: number;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  status: string;
  category: { name: string } | null;
  medicine?: ApiMedicine;
  cosmetic?: ApiCosmetic;
}

interface CartItem {
  product: UnifiedProduct;
  quantity: number;
  unit: "pack" | "single";
  price: number;
}

export default function POSPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeProductType, setActiveProductType] = useState("all");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentType, setPaymentType] = useState("Cash");
  const [cashGiven, setCashGiven] = useState(0);
  const [prescriptionImage, setPrescriptionImage] = useState<File | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lastSaleId, setLastSaleId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shift Management State
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [openingFloat, setOpeningFloat] = useState(0);
  const [startTime, setStartTime] = useState("—");
  const [cashSales, setCashSales] = useState(0);
  const [telebirrSales, setTelebirrSales] = useState(0);
  const [cardSales, setCardSales] = useState(0);
  const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);
  const [totalSalesCount, setTotalSalesCount] = useState(0);

  const [posProducts, setPosProducts] = useState<PosProduct[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const fetchActiveShift = async () => {
    try {
      const res = await getCurrentShift();
      if (res.data?.shift) {
        const s = res.data.shift;
        const m = res.data.metrics;
        setIsShiftOpen(true);
        setOpeningFloat(m?.opening_balance ?? s.opening_balance ?? 0);
        setStartTime(new Date(s.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        setCashSales(m?.cash_sales ?? 0);
        setTelebirrSales(m?.mobile_money_sales ?? 0);
        setCardSales(m?.card_sales ?? 0);
        setTotalSalesCount(m?.total_transactions ?? 0);
      }
    } catch {
      setIsShiftOpen(false);
    }
  };

  const fetchPosData = async () => {
    setIsLoadingProducts(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getPosProducts({
          search: search || undefined,
          type: activeProductType !== "all" ? activeProductType.toLowerCase() : undefined,
        }),
        getCategories(),
      ]);
      setPosProducts(prodRes.data || []);
      const rawCats = Array.isArray(catRes.data) ? catRes.data : (catRes.data as any)?.data || [];
      setCategoriesList(rawCats);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load POS products", "error");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchActiveShift();
  }, []);

  useEffect(() => {
    fetchPosData();
  }, [search, activeProductType]);

  const handleStartShift = async (floatVal: number, notes?: string) => {
    try {
      await openShift({ opening_balance: floatVal, notes });
      setOpeningFloat(floatVal);
      setIsShiftOpen(true);
      setStartShiftModalOpen(false);
      await fetchActiveShift();
      toast(`Register shift opened with ${floatVal.toLocaleString()} ETB float`, "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to open register shift", "error");
    }
  };

  const handleCompleteCloseShift = async (summary: ShiftSummaryData & { countedCash: number; discrepancy: number }) => {
    try {
      await closeShift({ actual_cash: summary.countedCash });
      setIsShiftOpen(false);
      setCloseShiftModalOpen(false);
      toast("Register shift closed and cash reconciled successfully", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to close register shift", "error");
    }
  };

  const unifiedProducts: UnifiedProduct[] = posProducts.map((p) => ({
    id: p.product_id,
    name: p.name,
    type: p.type.toLowerCase() as "medicine" | "cosmetic",
    category_id: p.category?.id ?? 0,
    pack_size: 1,
    pack_price: Number(p.selling_price),
    unit_price: Number(p.selling_price),
    current_stock: p.available_quantity,
    min_stock_alert: 5,
    status: "active",
    category: p.category ? { name: p.category.name } : null,
  }));

  const categories = ["all", ...Array.from(new Set(categoriesList.map((c) => c.name)))];
  const productTypes = ["all", "Medicine", "Cosmetic"];

  const filteredProducts = unifiedProducts.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category?.name === activeCategory;
    const matchesProductType =
      activeProductType === "all" ||
      (activeProductType === "Medicine" && p.type === "medicine") ||
      (activeProductType === "Cosmetic" && p.type === "cosmetic");
    return matchesCategory && matchesProductType;
  });

  const addToCart = (product: UnifiedProduct, unit: "pack" | "single") => {
    const price = unit === "pack" ? product.pack_price : product.unit_price;
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.unit === unit
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.unit === unit
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unit, price }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => (i === index ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setCashGiven(0);
    setPrescriptionImage(null);
  };

  const completeSale = async () => {
    if (!isShiftOpen) {
      toast("Register shift is closed. Open shift before selling.", "error");
      setStartShiftModalOpen(true);
      return;
    }
    if (cart.length === 0) {
      toast("Cart is empty. Add items before completing a sale.", "error");
      return;
    }
    if (paymentType === "Cash" && cashGiven < total) {
      toast("Cash given is less than the total.", "error");
      return;
    }

    try {
      const itemsPayload = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const res = await createSale({
        payment_type: paymentType.toLowerCase().replace(/ /g, "_"),
        cash_given: paymentType === "Cash" ? cashGiven : undefined,
        items: itemsPayload,
      });

      const saleData = res.data;
      const saleCode = saleData?.id ? `SALE-${String(saleData.id).padStart(4, "0")}` : `SALE-${Math.floor(1000 + Math.random() * 9000)}`;

      if (paymentType === "Cash") {
        setCashSales((prev) => prev + total);
      } else if (paymentType === "Telebirr" || paymentType === "Mobile Money") {
        setTelebirrSales((prev) => prev + total);
      } else {
        setCardSales((prev) => prev + total);
      }
      setTotalSalesCount((prev) => prev + 1);

      setLastSaleId(saleCode);
      setCompleted(true);
      toast("Sale created successfully", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create sale", "error");
    }
  };

  const resetSale = () => {
    clearCart();
    setCompleted(false);
    setLastSaleId("");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxRate = 0.15;
  const taxAmount = afterDiscount * taxRate;
  const total = afterDiscount + taxAmount;
  const change = cashGiven - total;
  const totalItems = cart.length;

  return (
    <div className="space-y-3">
      {/* Active Shift Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-[#0A0A0A]">
        {isShiftOpen ? (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift Active</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <Clock className="h-3.5 w-3.5" />
              <span>Started: <strong className="text-neutral-800 dark:text-neutral-200">{startTime}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Float: <strong className="text-neutral-800 dark:text-neutral-200">{openingFloat.toLocaleString()} ETB</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-neutral-500">
              <span>Today&apos;s Cash: <strong className="text-emerald-600 dark:text-emerald-400">+{cashSales.toLocaleString()} ETB</strong></span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
            <Lock className="h-4 w-4 text-amber-500" />
            <span>Register Shift Closed — Open shift to process sales</span>
          </div>
        )}

        <div>
          {isShiftOpen ? (
            <button
              onClick={() => setCloseShiftModalOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Lock className="h-3.5 w-3.5" />
              Close Shift & Reconcile
            </button>
          ) : (
            <button
              onClick={() => setStartShiftModalOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-neutral-900 px-3 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Open Register Shift
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 overflow-hidden">
      {/* Left: Medicine List */}
      <div className="flex-1 min-w-0 h-full rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
        {/* Search bar + category pills */}
        <div className="border-b border-border p-3 space-y-3 max-w-full overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search medicine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 max-w-full overflow-hidden">
            <div className="flex gap-2 overflow-x-auto scrollbar-none max-w-full py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeCategory === cat
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    }`}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none max-w-full py-0.5">
              {productTypes.map((pt) => (
                <button
                  key={pt}
                  onClick={() => setActiveProductType(pt)}
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeProductType === pt
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    }`}
                >
                  {pt === "all" ? "All Products" : pt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table - desktop only */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Product</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Category</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Pack</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Single</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Stock</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-center">Add</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const cat = prod.category;
                return (
                  <tr key={`${prod.type}-${prod.id}`} className="border-b border-border last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium">{prod.name}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                          prod.type === "medicine"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                            : "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-400"
                        }`}>
                          {prod.type === "medicine" ? prod.medicine?.dosage_form : prod.cosmetic?.product_type}
                        </span>
                        {prod.type === "medicine" && prod.medicine && (
                          <span className="text-xs text-neutral-500">{prod.medicine.generic_name}</span>
                        )}
                        {prod.type === "cosmetic" && prod.cosmetic?.size && (
                          <span className="text-xs text-neutral-500">{prod.cosmetic.size}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center rounded border border-neutral-200 px-2 py-0.5 text-xs font-medium dark:border-neutral-800">
                        {cat?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-neutral-600 dark:text-neutral-400">{prod.pack_price.toFixed(2)} ETB</td>
                    <td className="px-4 py-2.5 text-right text-sm text-neutral-600 dark:text-neutral-400">{prod.unit_price.toFixed(2)} ETB</td>
                    <td className="px-4 py-2.5 text-right text-sm font-medium">{prod.current_stock}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => addToCart(prod, "pack")}
                          className="inline-flex h-7 items-center justify-center rounded border border-neutral-200 px-2.5 text-xs font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                        >
                          Pack
                        </button>
                        <button
                          onClick={() => addToCart(prod, "single")}
                          className="inline-flex h-7 items-center justify-center rounded border border-neutral-200 px-2.5 text-xs font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                        >
                          Single
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm text-neutral-500">No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards view - mobile only */}
        <div className="sm:hidden divide-y divide-border">
          {filteredProducts.map((prod) => {
            const cat = prod.category;
            const inCartPack = cart.find(
              (item) => item.product.id === prod.id && item.unit === "pack"
            );
            const inCartSingle = cart.find(
              (item) => item.product.id === prod.id && item.unit === "single"
            );
            const isLow = prod.current_stock <= prod.min_stock_alert;
            return (
              <div key={`${prod.type}-${prod.id}`} className="flex items-center gap-3 px-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{prod.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                      prod.type === "medicine"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                        : "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-400"
                    }`}>
                      {prod.type === "medicine" ? prod.medicine?.dosage_form : prod.cosmetic?.product_type}
                    </span>
                    {prod.type === "medicine" && prod.medicine && (
                      <span className="text-xs text-neutral-500">{prod.medicine.generic_name}</span>
                    )}
                    {prod.type === "cosmetic" && prod.cosmetic?.size && (
                      <span className="text-xs text-neutral-500">{prod.cosmetic.size}</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded border border-neutral-200 px-1.5 py-0.5 text-xs font-medium dark:border-neutral-800">
                      {cat?.name ?? "—"}
                    </span>
                    {isLow ? (
                      <span className="text-xs font-medium text-amber-600">Low ({prod.current_stock})</span>
                    ) : (
                      <span className="text-xs text-neutral-400">{prod.current_stock}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {inCartPack ? (
                    <div className="flex items-center gap-1 rounded border border-neutral-200 dark:border-neutral-800">
                      <button
                        onClick={() => {
                          const idx = cart.findIndex((i) => i.product.id === prod.id && i.unit === "pack");
                          if (idx !== -1) updateQuantity(idx, -1);
                        }}
                        aria-label="Decrease pack quantity"
                        className="flex h-7 w-7 items-center justify-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-medium">{inCartPack.quantity}</span>
                      <button
                        onClick={() => addToCart(prod, "pack")}
                        aria-label="Increase pack quantity"
                        className="flex h-7 w-7 items-center justify-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(prod, "pack")}
                      className="inline-flex items-center gap-1 rounded border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
                    >
                      <span className="text-neutral-400">Pack</span>
                      <span>{prod.pack_price.toFixed(0)}</span>
                    </button>
                  )}
                  {inCartSingle ? (
                    <div className="flex items-center gap-1 rounded border border-neutral-200 dark:border-neutral-800">
                      <button
                        onClick={() => {
                          const idx = cart.findIndex((i) => i.product.id === prod.id && i.unit === "single");
                          if (idx !== -1) updateQuantity(idx, -1);
                        }}
                        aria-label="Decrease single quantity"
                        className="flex h-7 w-7 items-center justify-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-medium">{inCartSingle.quantity}</span>
                      <button
                        onClick={() => addToCart(prod, "single")}
                        aria-label="Increase single quantity"
                        className="flex h-7 w-7 items-center justify-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(prod, "single")}
                      className="inline-flex items-center gap-1 rounded border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
                    >
                      <span className="text-neutral-400">Unit</span>
                      <span>{prod.unit_price.toFixed(0)}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-neutral-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart - desktop only */}
      <div className="hidden xl:flex w-[380px] h-full rounded-lg border border-border bg-white dark:bg-[#0A0A0A] flex-col">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-medium">Cart</h2>
        </div>

        {/* Cart items - scrollable */}
        <div className="flex-1 overflow-y-auto px-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-full bg-neutral-100 p-3 dark:bg-neutral-900">
                <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">Cart is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cart.map((item, index) => (
                <div key={`${item.product.id}-${item.unit}`} className="flex items-center gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-[11px] text-neutral-500">
                      {item.unit === "pack" ? "Pack" : "Single"} · {item.price.toFixed(2)} ETB
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      aria-label="Decrease quantity"
                      className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, 1)}
                      aria-label="Increase quantity"
                      className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    aria-label="Remove item"
                    className="flex h-6 w-6 items-center justify-center text-neutral-400 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom section - fixed, not scrollable */}
        <div className="border-t border-border px-4 py-3 space-y-3">
          {/* Summary */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-medium">{subtotal.toFixed(2)} ETB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Discount</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, Number(e.target.value)))}
                  className="h-7 w-14 rounded border border-neutral-200 bg-white px-2 text-right text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                />
                <span className="text-[10px] text-neutral-500">%</span>
                <span className="text-[10px] text-red-600 dark:text-red-400">
                  -{discountAmount.toFixed(2)} ETB
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Tax (15.00%)</span>
              <span>{taxAmount.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between font-semibold pt-1">
              <span>Total</span>
              <span>{total.toFixed(2)} ETB</span>
            </div>
          </div>

          {/* Prescription */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => setPrescriptionImage(e.target.files?.[0] ?? null)}
            />
            {prescriptionImage ? (
              <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 dark:border-neutral-800">
                <span className="flex-1 truncate text-xs">{prescriptionImage.name}</span>
                <button onClick={() => setPrescriptionImage(null)} className="text-neutral-400 hover:text-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-md border border-dashed border-neutral-300 py-2.5 text-center transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600"
              >
                <p className="text-[11px] text-neutral-500">Add Prescription (optional)</p>
              </button>
            )}
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
            >
              <option>Cash</option>
              <option>Telebirr</option>
              <option>CBE Birr</option>
              <option>Bank Transfer</option>
            </select>
            {paymentType === "Cash" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-neutral-500 mb-1 block">Cash Given</label>
                  <input
                    type="number"
                    value={cashGiven || ""}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    placeholder="0.00"
                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-neutral-500 mb-1 block">Change</label>
                  <input
                    type="text"
                    value={`${change >= 0 ? change.toFixed(2) : "0.00"} ETB`}
                    readOnly
                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={clearCart}
              className="flex-1 inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              Clear
            </button>
            <button
              disabled={cart.length === 0}
              onClick={completeSale}
              className="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Complete
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Floating cart button - always visible */}
      <button
        onClick={() => setShowMobileCart(true)}
        className="xl:hidden fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg dark:bg-white dark:text-black"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {totalItems}
          </span>
        )}
      </button>

      {/* Mobile: Cart overlay - right side panel */}
      {showMobileCart && (
        <div className="xl:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowMobileCart(false)}
          />

          {/* Panel */}
          <div className="relative flex w-full max-w-[400px] flex-col bg-white dark:bg-[#0A0A0A] shadow-xl">
            {/* Cart header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileCart(false)}
                  aria-label="Close cart"
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="h-4 w-4" />
                </button>
                <h2 className="text-base font-medium">Cart {totalItems > 0 && `(${totalItems})`}</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-medium text-red-600 dark:text-red-400"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Cart items - scrollable */}
            <div className="flex-1 overflow-y-auto px-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingCart className="mb-3 h-8 w-8 text-neutral-300" />
                  <p className="text-sm text-neutral-500">Cart is empty</p>
                  <p className="text-xs text-neutral-400 mt-1">Add medicines to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {cart.map((item, index) => (
                    <div key={`${item.product.id}-${item.unit}`} className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-[11px] text-neutral-500">
                          {item.unit === "pack" ? "Pack" : "Single"} · {item.price.toFixed(2)} ETB
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          aria-label="Decrease quantity"
                          className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 dark:border-neutral-800"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          aria-label="Increase quantity"
                          className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 dark:border-neutral-800"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        aria-label="Remove item"
                        className="flex h-6 w-6 items-center justify-center text-neutral-400 hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom section - fixed, not scrollable */}
            <div className="border-t border-border px-4 py-3 space-y-3">
              {/* Summary */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(2)} ETB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Discount</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Math.max(0, Number(e.target.value)))}
                      className="h-7 w-14 rounded border border-neutral-200 bg-white px-2 text-right text-xs focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <span className="text-[10px] text-neutral-500">%</span>
                    <span className="text-[10px] text-red-600 dark:text-red-400">
                      -{discountAmount.toFixed(2)} ETB
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tax (15.00%)</span>
                  <span>{taxAmount.toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between font-semibold pt-1">
                  <span>Total</span>
                  <span>{total.toFixed(2)} ETB</span>
                </div>
              </div>

              {/* Prescription */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => setPrescriptionImage(e.target.files?.[0] ?? null)}
                />
                {prescriptionImage ? (
                  <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 dark:border-neutral-800">
                    <span className="flex-1 truncate text-xs">{prescriptionImage.name}</span>
                    <button onClick={() => setPrescriptionImage(null)} className="text-neutral-400 hover:text-red-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-md border border-dashed border-neutral-300 py-2.5 text-center transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600"
                  >
                    <p className="text-[11px] text-neutral-500">Add Prescription (optional)</p>
                  </button>
                )}
              </div>

              {/* Payment */}
              <div className="space-y-2">
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
                >
                  <option>Cash</option>
                  <option>Telebirr</option>
                  <option>CBE Birr</option>
                  <option>Bank Transfer</option>
                </select>
                {paymentType === "Cash" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-neutral-500 mb-1 block">Cash Given</label>
                      <input
                        type="number"
                        value={cashGiven || ""}
                        onChange={(e) => setCashGiven(Number(e.target.value))}
                        placeholder="0.00"
                        className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-neutral-500 mb-1 block">Change</label>
                      <input
                        type="text"
                        value={`${change >= 0 ? change.toFixed(2) : "0.00"} ETB`}
                        readOnly
                        className="flex h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => { clearCart(); setShowMobileCart(false); }}
                  className="flex-1 inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
                >
                  Clear
                </button>
                <button
                  disabled={cart.length === 0}
                  onClick={completeSale}
                  className="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Completion Overlay */}
      {completed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold">Sale Completed</h2>
              <button
                onClick={resetSale}
                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <Receipt
                data={{
                  saleId: lastSaleId,
                  date: new Date().toLocaleDateString("en-GB"),
                  time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
                  cashier: "Current User",
                  paymentMethod: paymentType,
                  items: cart.map((item) => ({
                    name: item.product.type === "medicine" && item.product.medicine
                      ? `${item.product.name} ${item.product.medicine.strength} ${item.product.medicine.dosage_form}`
                      : item.product.name,
                    qty: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity,
                    unit: item.unit,
                  })),
                  subtotal,
                  discount: discountAmount,
                  tax: taxAmount,
                  total,
                  branch: "Bole Branch",
                }}
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-neutral-200 px-4 py-3 text-sm font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </button>
                <button
                  onClick={resetSale}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  New Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StartShiftModal
        isOpen={startShiftModalOpen}
        cashierName={user?.name ?? "Cashier"}
        onStartShift={handleStartShift}
      />

      <CloseShiftModal
        isOpen={closeShiftModalOpen}
        onClose={() => setCloseShiftModalOpen(false)}
        shiftData={{
          cashierName: user?.name ?? "Cashier",
          startTime,
          openingFloat,
          cashSales,
          telebirrSales,
          cardSales,
          totalTransactions: totalSalesCount,
        }}
        onCompleteCloseShift={handleCompleteCloseShift}
      />
    </div>
  );
}
