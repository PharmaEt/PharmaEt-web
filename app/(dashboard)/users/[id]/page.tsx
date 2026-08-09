"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiUser, type ApiBranch } from "@/lib/types";
import { getUser, updateUser } from "@/lib/api/users";
import { getBranches } from "@/lib/api/branches";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { isOwner } = useAuth();
  const userId = params.id as string;

  const [user, setUser] = useState<ApiUser | null>(null);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "pharmacist" as "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer",
    branch_id: "",
    telegram_chat_id: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [userRes, branchRes] = await Promise.all([
          getUser(userId),
          getBranches().catch(() => ({ data: [] })),
        ]);
        if (branchRes.data) {
          setBranches(branchRes.data);
        }
        if (userRes.data) {
          setUser(userRes.data);
          setForm({
            name: userRes.data.name ?? "",
            email: userRes.data.email ?? "",
            phone: userRes.data.phone ?? "",
            role: userRes.data.role ?? "pharmacist",
            branch_id: userRes.data.branch_id?.toString() ?? "",
            telegram_chat_id: userRes.data.telegram_chat_id ?? "",
            status: userRes.data.status ?? "active",
          });
        }
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load user details", "error");
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      loadData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <p className="text-sm text-neutral-500">Loading user details...</p>
      </div>
    );
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      toast("Only store owners can modify system users", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateUser(userId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        branch_id: form.branch_id ? parseInt(form.branch_id) : null,
        telegram_chat_id: form.telegram_chat_id || null,
        status: form.status,
      });
      toast(res.message || "User updated successfully", "success");
      router.push("/users");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update user", "error");
    } finally {
      setSubmitting(false);
    }
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {isOwner ? "Edit User" : "User Details"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isOwner ? "Update user information" : "View user information"}
          </p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <fieldset disabled={!isOwner} className="space-y-4">
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
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
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
                placeholder="+251911223344"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Role
                </label>
                <select
                  id="role"
                  disabled={!isOwner}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as "owner" | "manager" | "cashier" | "pharmacist" | "inventory_officer" })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900 disabled:opacity-75"
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
                  disabled={!isOwner}
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900 disabled:opacity-75"
                >
                  <option value="">Unassigned (Headquarters / Floating)</option>
                  {branches.map((branch) => (
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
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Status
              </label>
              <select
                id="status"
                disabled={!isOwner}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900 disabled:opacity-75"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </fieldset>

          {isOwner && (
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {submitting ? "Updating..." : "Update User"}
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
  );
}
