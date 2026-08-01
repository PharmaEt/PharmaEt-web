"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { mockBranches } from "@/lib/mock-data";
import { Send } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const userBranch = mockBranches.find((b) => b.id === user?.branch_id);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [telegramChatId, setTelegramChatId] = useState(user?.telegram_chat_id ?? "");
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileSave = () => {
    toast("Profile information updated successfully");
  };

  const handleTestTelegram = () => {
    if (!telegramChatId) {
      toast("Please enter a valid Telegram Chat ID to test", "error");
      return;
    }
    setTestingTelegram(true);
    setTimeout(() => {
      setTestingTelegram(false);
      toast(`Test message sent to Telegram Chat ID: ${telegramChatId}`, "success");
    }, 600);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      toast("Password must be at least 8 characters long", "error");
      return;
    }
    toast("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your personal information and Telegram account" />

      {/* Profile Info */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 sm:px-5 py-3">
          <h2 className="text-sm font-medium">Personal Information</h2>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-black text-xl font-semibold">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-neutral-500 capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Assigned Branch</label>
              <input
                type="text"
                value={userBranch?.name ?? "All Branches (Global Owner)"}
                disabled
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleProfileSave}
              className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Telegram User Settings */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">Personal Telegram Account</h2>
            <p className="text-xs text-neutral-500">Receive personal password reset codes and direct alerts via Telegram</p>
          </div>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Telegram Chat ID / Username</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 123456789 or @yourusername"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <Send className="h-3.5 w-3.5" />
                {testingTelegram ? "Testing..." : "Test Telegram"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 sm:px-5 py-3">
          <h2 className="text-sm font-medium">Security & Password</h2>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handlePasswordChange}
              className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
