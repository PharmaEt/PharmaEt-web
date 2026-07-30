type Status = "active" | "inactive" | "completed" | "pending" | "expired";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  },
  inactive: {
    label: "Inactive",
    className: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  },
  completed: {
    label: "Completed",
    className: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    className: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
