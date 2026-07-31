"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { mockBranches } from "@/lib/mock-data";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const userBranch = mockBranches.find((b) => b.id === user?.branch_id);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 sm:px-5 py-3">
          <h2 className="text-sm font-medium">Profile</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Name</span>
            <span className="text-sm font-medium">{user?.name ?? "—"}</span>
          </div>
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Email</span>
            <span className="text-sm font-medium">{user?.email ?? "—"}</span>
          </div>
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Phone</span>
            <span className="text-sm font-medium">{user?.phone ?? "—"}</span>
          </div>
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Role</span>
            <span className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize dark:bg-neutral-800">
              {user?.role?.replace("_", " ") ?? "—"}
            </span>
          </div>
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Branch</span>
            <span className="text-sm font-medium">{userBranch?.name ?? "All Branches"}</span>
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

      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 sm:px-5 py-3">
          <h2 className="text-sm font-medium">Security</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-neutral-500">Last changed 30 days ago</p>
            </div>
            <button
              onClick={() => router.push("/profile")}
              className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              Change
            </button>
          </div>
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Telegram Notifications</p>
              <p className="text-xs text-neutral-500">{user?.telegram_chat_id ?? "Not configured"}</p>
            </div>
            <button
              onClick={() => toast("Telegram configuration coming soon", "info")}
              className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
