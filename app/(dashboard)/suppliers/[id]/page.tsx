"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiSupplier } from "@/lib/mock-data";
import { getSupplier, updateSupplier } from "@/lib/api/suppliers";

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { canManageCatalog } = useAuth();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<ApiSupplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    telegram_chat_id: "",
  });

  useEffect(() => {
    async function loadSupplier() {
      setLoading(true);
      try {
        const res = await getSupplier(supplierId);
        if (res.data) {
          setSupplier(res.data);
          setForm({
            name: res.data.name ?? "",
            contact_person: res.data.contact_person ?? "",
            email: res.data.email ?? "",
            phone: res.data.phone ?? "",
            address: res.data.address ?? "",
            telegram_chat_id: res.data.telegram_chat_id ?? "",
          });
        }
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : "Failed to load supplier details", "error");
      } finally {
        setLoading(false);
      }
    }
    if (supplierId) {
      loadSupplier();
    }
  }, [supplierId]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <p className="text-sm text-neutral-500">Loading supplier details...</p>
      </div>
    );
  }

  if (!supplier) {
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Supplier Not Found</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">The supplier you are looking for does not exist.</p>
        <Link
          href="/suppliers"
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
      toast("You do not have permission to modify suppliers", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateSupplier(supplierId, {
        name: form.name,
        contact_person: form.contact_person || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        telegram_chat_id: form.telegram_chat_id || null,
      });
      toast(res.message || "Supplier updated successfully", "success");
      router.push("/suppliers");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update supplier", "error");
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
            {canManageCatalog ? "Edit Supplier" : "Supplier Details"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {canManageCatalog ? "Update supplier information" : "View supplier information"}
          </p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 sm:p-5">
          <fieldset disabled={!canManageCatalog} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Supplier Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Ethio Pharma Distribution"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div>
              <label htmlFor="contact_person" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Contact Person
              </label>
              <input
                id="contact_person"
                type="text"
                required
                value={form.contact_person}
                onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                placeholder="e.g., Yonas Bekele"
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
                placeholder="e.g., info@ethiopharma.com"
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
                placeholder="+251911000001"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Address
              </label>
              <input
                id="address"
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g., Addis Ababa, Bole"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>

            <div>
              <label htmlFor="telegram" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Telegram Chat ID
              </label>
              <input
                id="telegram"
                type="text"
                required
                value={form.telegram_chat_id}
                onChange={(e) => setForm({ ...form, telegram_chat_id: e.target.value })}
                placeholder="e.g., 1106118198"
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 disabled:opacity-75"
              />
            </div>
          </fieldset>

          {canManageCatalog && (
            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {submitting ? "Updating..." : "Update Supplier"}
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
