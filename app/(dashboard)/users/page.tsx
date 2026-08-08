"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { RoleBadge } from "@/components/ui/role-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { type ApiUser } from "@/lib/mock-data";
import { getUsers, deleteUser } from "@/lib/api/users";
import { extractListData, extractPaginationMeta } from "@/lib/api/client";
import { Pagination } from "@/components/ui/pagination";

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOwner } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getUsers({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        page,
        per_page: perPage,
      });
      const list = extractListData<ApiUser>(res);
      setUsers(list);
      setMeta(extractPaginationMeta(res, list.length));
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load staff directory", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page, perPage]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteUser(deleteId);
      toast(res.message || "User deleted successfully", "success");
      setDeleteId(null);
      fetchUsers();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to delete user", "error");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      header: "#",
      render: (_: ApiUser, index: number) => (
        <span className="font-medium text-sm text-neutral-500">#{(page - 1) * perPage + index + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (item: ApiUser) => (
        <div>
          <span className="text-sm font-medium">{item.name}</span>
          <p className="text-xs text-neutral-500">{item.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (item: ApiUser) => <RoleBadge role={item.role} />,
    },
    {
      key: "branch",
      header: "Branch",
      render: (item: ApiUser) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {item.branch?.name ?? "Global HQ"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "phone",
      header: "Phone",
      render: (item: ApiUser) => (
        <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400">{item.phone || "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: ApiUser) => (
        <div className="flex items-center gap-1">
          {isOwner && (
            <>
              <button
                onClick={() => router.push(`/users/${item.id}`)}
                aria-label="Edit"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
                aria-label="Delete"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Staff"
        subtitle="Manage system staff and user accounts"
        action={isOwner ? { label: "Add Staff", icon: Plus, href: "/users/new" } : undefined}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600 dark:bg-neutral-900"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="cashier">Cashier</option>
          <option value="inventory_officer">Inventory</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredUsers} emptyMessage={isLoading ? "Loading staff directory..." : "No staff found"} />
      <Pagination
        currentPage={meta.currentPage}
        lastPage={meta.lastPage}
        total={meta.total}
        perPage={meta.perPage}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setPage(1);
        }}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete user?"
        description="This will permanently delete this user and remove all associated data. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
