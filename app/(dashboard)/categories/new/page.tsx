"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { type ApiBranch } from "@/lib/types";
import { createCategory } from "@/lib/api/categories";
import { getBranches } from "@/lib/api/branches";

export default function NewCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "medicine" as "medicine" | "cosmetic",
    description: "",
    branch_id: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await getBranches();
        setBranches(res.data || []);
      } catch {
        // ignore
      }
    }
    fetchBranches();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm((prev) => ({ ...prev, name, slug: prev.slug ? prev.slug : slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const generatedSlug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const res = await createCategory({
        name: form.name,
        type: form.type,
        slug: generatedSlug,
        description: form.description || null,
        branch_id: form.branch_id ? parseInt(form.branch_id) : null,
        status: form.status,
      });
      toast(res.message || "Category created successfully", "success");
      router.push("/categories");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create category", "error");
    } finally {
      setLoading(false);
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Add Category</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Create a new product category</p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Pain Relief"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div>
              <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Type
              </label>
              <select
                id="type"
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "medicine" | "cosmetic" })}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
              >
                <option value="medicine">Medicine</option>
                <option value="cosmetic">Cosmetic</option>
              </select>
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
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm font-mono placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
              <p className="mt-1 text-xs text-neutral-500">URL-friendly identifier. Auto-generated from name if left empty.</p>
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g., Medications for pain management"
                rows={3}
                className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="branch" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Branch <span className="text-neutral-400">(optional)</span>
                </label>
                <select
                  id="branch"
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
                >
                  <option value="">All branches (Global)</option>
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
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {loading ? "Creating..." : "Create Category"}
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
