type Role = "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer";

interface RoleBadgeProps {
  role: Role;
}

const roleConfig: Record<Role, { label: string; className: string }> = {
  owner: {
    label: "Owner",
    className: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  },
  manager: {
    label: "Manager",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  pharmacist: {
    label: "Pharmacist",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  cashier: {
    label: "Cashier",
    className: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
  },
  inventory_officer: {
    label: "Inventory",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role] || roleConfig.cashier;

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
