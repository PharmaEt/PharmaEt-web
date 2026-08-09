"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiBranch } from "@/lib/types";
import { getBranch, updateBranch } from "@/lib/api/branches";
import { getUsers, type ApiUser as SystemUser } from "@/lib/api/users";

export default function BranchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { isOwner } = useAuth();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<ApiBranch | null>(null);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    founded_year: "",
    manager_id: "",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [branchRes, usersRes] = await Promise.all([
          getBranch(branchId),
          getUsers().catch(() => ({ data: [] })),
        ]);
        if (usersRes.data) {
          setUsers(usersRes.data);
        }
        if (branchRes.data) {
          setBranch(branchRes.data);
          setForm({
            name: branchRes.data.name ?? "",
            location: branchRes.data.location ?? "",
            phone: branchRes.data.phone ?? "",
            founded_year: branchRes.data.founded_year?.toString() ?? "",
            manager_id: branchRes.data.manager_id?.toString() ?? "",
          });
        }
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load branch details", "error");
      } finally {
        setLoading(false);
      }
    }
    if (branchId) {
      loadData();
    }
  }, [branchId]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <p className="text-sm text-neutral-500">Loading branch details...</p>
      </div>
    );
  }

  if (!branch) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Branch Not Found</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">The branch you are looking for does not exist.</p>
        <Link
          href="/branches"
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
      toast("Only branch owners can modify branch details", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateBranch(branchId, {
        name: form.name,
        location: form.location || null,
        phone: form.phone || null,
        founded_year: form.founded_year ? parseInt(form.founded_year) : null,
        manager_id: form.manager_id ? parseInt(form.manager_id) : null,
      });
      toast(res.message || "Branch updated successfully", "success");
      router.push("/branches");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update branch", "error");
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
            {isOwner ? "Edit Branch" : "Branch Details"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isOwner ? "Update branch information" : "View branch details"}
          </p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <fieldset disabled={!isOwner} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Branch Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Bole Branch"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Location / Address
              </label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Bole Road, Addis Ababa"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div>
              <label htmlFor="manager" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Branch Manager <span className="text-neutral-400">(optional)</span>
              </label>
              <select
                id="manager"
                disabled={!isOwner}
                value={form.manager_id}
                onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900 disabled:opacity-75"
              >
                <option value="">Select manager (Unassigned)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
                />
              </div>

              <div>
                <label htmlFor="founded_year" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Founded Year <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="founded_year"
                  type="number"
                  min="2000"
                  max="2030"
                  value={form.founded_year}
                  onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                  placeholder="2024"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
                />
              </div>
            </div>
          </fieldset>

          {isOwner && (
            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {submitting ? "Updating..." : "Update Branch"}
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

      {branch.users && branch.users.length > 0 && (
        <div className="max-w-lg">
          <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Staff</h2>
          <div className="rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50 dark:bg-neutral-900">
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {branch.users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">{user.name}</td>
                    <td className="px-3 py-2 capitalize">{user.role.replace("_", " ")}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.status === "active" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
