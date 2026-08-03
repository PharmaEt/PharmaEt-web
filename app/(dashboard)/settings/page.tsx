"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { TelegramModal } from "@/components/settings/telegram-modal";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { getSettings, updateSettings } from "@/lib/api/settings";
import { DollarSign, Bell, Receipt, Bot, Save } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { isOwner } = useAuth();
  const [isTelegramOpen, setIsTelegramOpen] = useState(false);

  // Financial & Tax Settings
  const [taxRate, setTaxRate] = useState("15.0");
  const [maxDiscountLimit, setMaxDiscountLimit] = useState("10.0");
  const [currency, setCurrency] = useState("ETB");

  // Inventory Alert Thresholds
  const [nearExpiryDays, setNearExpiryDays] = useState("90");

  // Thermal Receipt Customization
  const [receiptHeader, setReceiptHeader] = useState("PharmaET Retail Pharmacy | Bole Branch | TIN: 0045892134");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for choosing PharmaET! Wish you good health.");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const res = await getSettings();
        if (res.data?.expiry_alert_days) {
          setNearExpiryDays(String(res.data.expiry_alert_days));
        }
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load branch settings", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        expiry_alert_days: Number(nearExpiryDays) || 90,
      });
      toast("Branch & System settings updated successfully!", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Settings"
        subtitle="Manage pharmacy configurations, tax rates, inventory thresholds, and notifications"
      />

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Financial & Tax Settings */}
        <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
          <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold">POS Financial & Tax Rates</h2>
          </div>
          <div className="p-4 sm:p-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Max Cashier Discount (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                required
                value={maxDiscountLimit}
                onChange={(e) => setMaxDiscountLimit(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              >
                <option value="ETB">ETB (Ethiopian Birr)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Inventory Alert Thresholds */}
        <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
          <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold">Inventory Alert Thresholds</h2>
          </div>
          <div className="p-4 sm:p-5 grid gap-4 sm:grid-cols-1">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Near-Expiry Warning Threshold (Days)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                required
                value={nearExpiryDays}
                onChange={(e) => setNearExpiryDays(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
              <p className="mt-1 text-[11px] text-neutral-400">Highlights stock batches expiring within the specified number of days.</p>
            </div>
          </div>
        </div>

        {/* 3. Thermal Receipt Customization */}
        <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
          <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold">Thermal Receipt Customization</h2>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Receipt Header Text & TIN Info
              </label>
              <input
                type="text"
                required
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Receipt Footer Message
              </label>
              <input
                type="text"
                required
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
            </div>
          </div>
        </div>

        {/* 4. Global Telegram Bot Configuration (Owner Only) */}
        {isOwner && (
          <div className="rounded-lg border border-border bg-white dark:bg-[#0A0A0A]">
            <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-500" />
                <div>
                  <h2 className="text-sm font-semibold">Pharmacy System Telegram Bot</h2>
                  <p className="text-xs text-neutral-500">Global Bot Token for automated purchase orders and alerts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTelegramOpen(true)}
                className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                Configure Bot Token
              </button>
            </div>
          </div>
        )}

        {/* Save Action Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-neutral-900 px-5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving Settings..." : "Save Settings"}
          </button>
        </div>
      </form>

      <TelegramModal
        isOpen={isTelegramOpen}
        onClose={() => setIsTelegramOpen(false)}
      />
    </div>
  );
}
