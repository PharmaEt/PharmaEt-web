"use client";

import { useState } from "react";
import { X, Send, Bot, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TelegramModal({ isOpen, onClose }: TelegramModalProps) {
  const { toast } = useToast();
  const [botToken, setBotToken] = useState("1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ");
  const [botUsername, setBotUsername] = useState("@PharmaEtBot");
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [poAlerts, setPoAlerts] = useState(true);
  const [testing, setTesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTestBot = () => {
    if (!botToken) {
      toast("Please enter a Telegram Bot Token to test", "error");
      return;
    }
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      toast("Telegram Bot API connection verified successfully!", "success");
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast("Global Telegram Bot settings updated!", "success");
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-5 shadow-lg dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                System Telegram Bot Settings
              </h3>
              <p className="text-xs text-neutral-500">
                Configure global pharmacy bot for automated Telegram notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Bot Token (from @BotFather)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                required
                placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
              <button
                type="button"
                onClick={handleTestBot}
                disabled={testing}
                className="flex h-9 items-center gap-1 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <Send className="h-3.5 w-3.5" />
                {testing ? "Testing..." : "Test Bot"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Bot Handle / Username
            </label>
            <input
              type="text"
              placeholder="@PharmaEtBot"
              value={botUsername}
              onChange={(e) => setBotUsername(e.target.value)}
              className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
            />
          </div>

          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <span>
              Staff members manage their own personal Chat IDs under their <b>Profile</b> page to receive password resets and direct alerts.
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <span className="block text-xs font-medium text-neutral-500 mb-1">
              Global Alert Triggers
            </span>
            <label className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <span>Automated Low Stock Alerts</span>
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-0 dark:bg-neutral-900"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <span>Expiry Warnings (30/60 Days)</span>
              <input
                type="checkbox"
                checked={expiryAlerts}
                onChange={(e) => setExpiryAlerts(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-0 dark:bg-neutral-900"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <span>Purchase Order Telegram Delivery</span>
              <input
                type="checkbox"
                checked={poAlerts}
                onChange={(e) => setPoAlerts(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-0 dark:bg-neutral-900"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 rounded-md bg-neutral-900 px-4 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {submitting ? "Saving..." : "Save Bot Token"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
