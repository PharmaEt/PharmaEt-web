"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiCategory, type ApiBranch } from "@/lib/types";
import { getCategory, updateCategory } from "@/lib/api/categories";
import { getBranches } from "@/lib/api/branches";

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { canManageCatalog } = useAuth();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<ApiCategory | null>(null);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    branch_id: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catRes, branchRes] = await Promise.all([
          getCategory(categoryId),
          getBranches().catch(() => ({ data: [] })),
        ]);
        if (branchRes.data) {
          setBranches(branchRes.data);
        }
        if (catRes.data) {
          setCategory(catRes.data);
          setForm({
            name: catRes.data.name ?? "",
            slug: catRes.data.slug ?? "",
            description: catRes.data.description ?? "",
            branch_id: catRes.data.branch_id?.toString() ?? "",
            status: catRes.data.status ?? "active",
          });
        }
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load category details", "error");
      } finally {
        setLoading(false);
      }
    }
    if (categoryId) {
      loadData();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <p className="text-sm text-neutral-500">Loading category details...</p>
      </div>
    );
  }

  if (!category) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Category Not Found</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">The requested category does not exist</p>
          </div>
        </div>
        <Link
          href="/categories"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to list
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) {
      toast("You do not have permission to modify categories", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateCategory(categoryId, {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        branch_id: form.branch_id ? parseInt(form.branch_id) : null,
        status: form.status,
      });
      toast(res.message || "Category updated successfully", "success");
      router.push("/categories");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update category", "error");
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
            {canManageCatalog ? "Edit Category" : "Category Details"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {canManageCatalog ? "Update category details" : "View category details"}
          </p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <fieldset disabled={!canManageCatalog} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Pain Relief"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div>
              <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Slug
              </label>
              <input
                id="slug"
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g., pain-relief"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm font-mono placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={3}
                className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="branch" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Branch <span className="text-neutral-400">(optional)</span>
                </label>
                <select
                  id="branch"
                  disabled={!canManageCatalog}
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900 disabled:opacity-75"
                >
                  <option value="">Global (all branches)</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Status
                </label>
                <select
                  id="status"
                  disabled={!canManageCatalog}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900 disabled:opacity-75"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </fieldset>

          {canManageCatalog && (
            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {submitting ? "Updating..." : "Update Category"}
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
