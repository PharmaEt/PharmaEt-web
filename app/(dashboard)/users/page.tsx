"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { RoleBadge } from "@/components/ui/role-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { mockUsers, mockBranches } from "@/lib/mock-data";

export default function UsersPage() {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      key: "user",
      header: "User",
      render: (item: typeof mockUsers[0]) => (
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {item.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            <p className="text-xs text-neutral-500 truncate">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (item: typeof mockUsers[0]) => <RoleBadge role={item.role} />,
    },
    {
      key: "branch",
      header: "Branch",
      render: (item: typeof mockUsers[0]) => {
        const branch = mockBranches.find((b) => b.id === item.branch_id);
        return <span className="text-neutral-500">{branch?.name ?? "—"}</span>;
      },
      hideOnMobile: true,
    },
    {
      key: "phone",
      header: "Phone",
      render: (item: typeof mockUsers[0]) => (
        <span className="text-neutral-500">{item.phone ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (item: typeof mockUsers[0]) => <StatusBadge status={item.status} />,
    },
    {
      key: "created_at",
      header: "Joined",
      render: (item: typeof mockUsers[0]) => (
        <span className="text-neutral-500">{new Date(item.created_at).toLocaleDateString()}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: typeof mockUsers[0]) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/users/${item.id}`)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => router.push(`/users/${item.id}`)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteId(item.id)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage system users"
        action={{ label: "Add User", icon: Plus, href: "/users/new" }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="flex h-9 w-full sm:w-auto rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="cashier">Cashier</option>
          <option value="inventory_officer">Inventory</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredUsers} emptyMessage="No users found" />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete user?"
        description="This will permanently delete this user and remove all associated data. This cannot be undone."
        onConfirm={() => setDeleteId(null)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
