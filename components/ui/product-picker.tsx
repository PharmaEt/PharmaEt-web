"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Pill, Sparkles, Check, ChevronDown, X } from "lucide-react";
import type { ApiProduct } from "@/lib/mock-data";

interface ProductPickerProps {
  products: ApiProduct[];
  selectedProductId?: number | string;
  onSelect: (product: ApiProduct) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function getProductDetails(p: ApiProduct) {
  const details = (p as any).productable;
  const isMedicine = p.productable_type?.includes("Medicine");
  const strength = details?.strength || (p as any).strength || "";
  const form = details?.dosage_form || details?.product_type || (p as any).dosage_form || (p as any).product_type || "";
  const genericName = details?.generic_name || (p as any).generic_name || "";
  const packSize = p.pack_size ?? 1;
  const categoryName = p.category?.name || "General";

  return { isMedicine, strength, form, genericName, packSize, categoryName };
}

export function ProductPicker({
  products,
  selectedProductId,
  onSelect,
  placeholder = "Search product by name, generic, SKU, or barcode...",
  className = "",
  disabled = false,
}: ProductPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "medicine" | "cosmetic">("all");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Currently selected product
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find((p) => String(p.id) === String(selectedProductId)) || null;
  }, [products, selectedProductId]);

  // Filtered & Virtualized items (max 25 rendered at a time)
  const filteredProducts = useMemo(() => {
    let result = products;

    // Type filter tab
    if (typeFilter === "medicine") {
      result = result.filter((p) => p.productable_type?.includes("Medicine"));
    } else if (typeFilter === "cosmetic") {
      result = result.filter((p) => p.productable_type?.includes("Cosmetic"));
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) => {
        const { strength, form, genericName } = getProductDetails(p);
        const name = (p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const barcode = (p.barcode || "").toLowerCase();
        const gName = genericName.toLowerCase();
        const str = strength.toLowerCase();
        const f = form.toLowerCase();

        return (
          name.includes(q) ||
          gName.includes(q) ||
          sku.includes(q) ||
          barcode.includes(q) ||
          str.includes(q) ||
          f.includes(q)
        );
      });
    }

    return result;
  }, [products, typeFilter, search]);

  // Cap at 25 items max for 60fps rendering speed
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, 25);
  }, [filteredProducts]);

  // Reset highlight index when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search, typeFilter]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelectProduct = (p: ApiProduct) => {
    onSelect(p);
    setIsOpen(false);
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < visibleProducts.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (visibleProducts[highlightedIndex]) {
        handleSelectProduct(visibleProducts[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectedDetails = selectedProduct ? getProductDetails(selectedProduct) : null;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Selected Product Display / Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 text-left text-sm transition-colors hover:border-neutral-300 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A] dark:hover:border-neutral-700 dark:focus:border-neutral-600 ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        {selectedProduct && selectedDetails ? (
          <div className="flex items-center gap-2 truncate">
            {selectedDetails.isMedicine ? (
              <Pill className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple-500" />
            )}
            <span className="font-medium text-neutral-900 dark:text-white truncate">
              {selectedProduct.name} {selectedDetails.strength && `${selectedDetails.strength} `}
              {selectedDetails.form && `(${selectedDetails.form})`}
            </span>
            <span className="text-xs text-neutral-400 shrink-0">
              — {selectedDetails.packSize} pcs/pack
            </span>
          </div>
        ) : (
          <span className="text-neutral-400 truncate">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-[#0C0C0C]">
          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type product name, generic, SKU, or scan barcode..."
              className="h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 pl-9 pr-8 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A] dark:text-white dark:focus:border-neutral-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Tabs */}
          <div className="mb-2 flex items-center gap-1 border-b border-neutral-100 pb-2 dark:border-neutral-900">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                typeFilter === "all"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              All ({products.length})
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("medicine")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                typeFilter === "medicine"
                  ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              <Pill className="h-3 w-3" />
              Medicines
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("cosmetic")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                typeFilter === "cosmetic"
                  ? "bg-purple-600 text-white dark:bg-purple-500 dark:text-white"
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Cosmetics
            </button>
          </div>

          {/* Product Items List (Virtualized to max 25) */}
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {visibleProducts.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                No matching products found
              </div>
            ) : (
              visibleProducts.map((p, idx) => {
                const details = getProductDetails(p);
                const isSelected = selectedProduct?.id === p.id;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProduct(p)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-neutral-100 font-semibold dark:bg-neutral-900"
                        : isHighlighted
                        ? "bg-neutral-50 dark:bg-neutral-900/60"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {details.isMedicine ? (
                          <Pill className="h-3 w-3 shrink-0 text-blue-500" />
                        ) : (
                          <Sparkles className="h-3 w-3 shrink-0 text-purple-500" />
                        )}
                        <span className="font-medium text-neutral-900 dark:text-white truncate">
                          {p.name} {details.strength && `${details.strength} `}
                          {details.form && `(${details.form})`}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-neutral-400">
                        {details.genericName && <span>Gen: {details.genericName}</span>}
                        <span>Pack: {details.packSize} pcs</span>
                        {p.sku && <span>SKU: {p.sku}</span>}
                      </div>
                    </div>

                    {isSelected && <Check className="h-4 w-4 shrink-0 text-emerald-500 ml-2" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer count indicator if truncated */}
          {filteredProducts.length > 25 && (
            <div className="mt-1 border-t border-neutral-100 pt-1.5 text-center text-[10px] text-neutral-400 dark:border-neutral-900">
              Showing top 25 of {filteredProducts.length} matching products. Refine search for more.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
