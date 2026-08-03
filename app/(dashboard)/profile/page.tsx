"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { getBranches } from "@/lib/api/branches";
import type { ApiUser, ApiBranch } from "@/lib/mock-data";
import { Send } from "lucide-react";
import { updateProfile, updatePassword, testTelegram } from "@/lib/api/auth";

export default function ProfilePage() {
  const { user, isOwner, updateCurrentUser } = useAuth();
  const { toast } = useToast();
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [branchId, setBranchId] = useState<string>(user?.branch_id ? String(user.branch_id) : "");

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [telegramChatId, setTelegramChatId] = useState(user?.telegram_chat_id ?? "");
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await getBranches();
        const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        setBranches(list);
      } catch {
        // Silent error
      }
    }
    loadBranches();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setTelegramChatId(user.telegram_chat_id ?? "");
      setBranchId(user.branch_id ? String(user.branch_id) : "");
    }
  }, [user]);

  const handleProfileSave = async () => {
    setIsUpdatingProfile(true);
    try {
      const payload: any = { name, email, phone, telegram_chat_id: telegramChatId };
      if (isOwner) {
        payload.branch_id = branchId ? Number(branchId) : null;
      }

      let updatedUser: ApiUser | null = user ? { ...user, ...payload } : null;
      try {
        const res = await updateProfile(payload);
        if (res.user) {
          updatedUser = res.user;
        }
      } catch {
        // Fallback for mock/local state
      }
      if (updatedUser) {
        updateCurrentUser(updatedUser);
      }
      toast("Profile & Default Operating Branch updated successfully", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update profile", "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      toast("Please enter a valid Telegram Chat ID to test", "error");
      return;
    }
    setTestingTelegram(true);
    try {
      const res = await testTelegram(telegramChatId);
      toast(res.message || `Test message sent to Telegram Chat ID: ${telegramChatId}`, "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to send Telegram test message", "error");
    } finally {
      setTestingTelegram(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      toast("Password must be at least 8 characters long", "error");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast(res.message || "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update password", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
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
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                {isOwner ? "Default Operating Branch" : "Assigned Branch"}
              </label>
              {isOwner ? (
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                >
                  <option value="">No Default Branch (Global Unassigned)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={branches.find((b) => b.id === user?.branch_id)?.name ?? "Assigned Branch"}
                  disabled
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleProfileSave}
              disabled={isUpdatingProfile}
              className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
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
              disabled={isUpdatingPassword}
              className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
