"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { mockBranches } from "@/lib/mock-data";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const userBranch = mockBranches.find((b) => b.id === user?.branch_id);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileSave = () => {
    toast("Profile updated successfully");
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    toast("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your personal information" />

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
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Branch</label>
              <input
                type="text"
                value={userBranch?.name ?? "All Branches"}
                disabled
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleProfileSave}
              className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 sm:px-5 py-3">
          <h2 className="text-sm font-medium">Change Password</h2>
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
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handlePasswordChange}
              className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 sm:px-5 py-3">
          <h2 className="text-sm font-medium">Account Details</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Role</span>
            <span className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize dark:bg-neutral-800">
              {user?.role?.replace("_", " ") ?? "—"}
            </span>
          </div>
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Status</span>
            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
              user?.status === "active"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            }`}>
              {user?.status ?? "—"}
            </span>
          </div>
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Member Since</span>
            <span className="text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
