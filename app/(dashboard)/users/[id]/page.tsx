"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockUsers, mockBranches } from "@/lib/mock-data";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const user = mockUsers.find((u) => u.id === Number(params.id));

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "pharmacist",
    branch_id: user?.branch_id?.toString() ?? "",
    telegram_chat_id: user?.telegram_chat_id ?? "",
    status: user?.status ?? "active",
  });

  if (!user) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">User Not Found</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">The user you are looking for does not exist.</p>
        <Link
          href="/users"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/users");
  };

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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Edit User</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Update user information</p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Ahmed Ali"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

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
                placeholder="e.g., ahmed@pharmaet.com"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Phone <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+251911223344"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Role
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as "owner" | "manager" | "cashier" | "pharmacist" | "inventory_officer" })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="cashier">Cashier</option>
                  <option value="inventory_officer">Inventory Officer</option>
                </select>
              </div>

              <div>
                <label htmlFor="branch" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Branch <span className="text-neutral-400">(optional)</span>
                </label>
                <select
                  id="branch"
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                >
                  <option value="">Select branch</option>
                  {mockBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="telegram" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Telegram Chat ID <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                id="telegram"
                type="text"
                value={form.telegram_chat_id}
                onChange={(e) => setForm({ ...form, telegram_chat_id: e.target.value })}
                placeholder="Optional"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Update User
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md bg-transparent px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
