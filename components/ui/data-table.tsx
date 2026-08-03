import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: number }>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full min-w-0">
          <thead>
            <tr className="border-b border-border bg-neutral-50 dark:bg-neutral-900">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-widest text-neutral-500 whitespace-nowrap ${col.hideOnMobile ? "hidden lg:table-cell" : ""} ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-neutral-100 dark:border-neutral-900">
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 sm:px-4 py-3 ${col.hideOnMobile ? "hidden lg:table-cell" : ""}`}>
                    <div className={`h-4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${col.key === columns[0].key ? "w-[60%]" : "w-[80%]"}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border py-20 text-center">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-x-auto">
      <table className="w-full min-w-0">
        <thead>
          <tr className="border-b border-border bg-neutral-50 dark:bg-neutral-900">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-widest text-neutral-500 whitespace-nowrap ${col.hideOnMobile ? "hidden lg:table-cell" : ""} ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id}
              className={`border-b border-neutral-100 dark:border-neutral-900 transition-colors duration-100 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 ${
                index === data.length - 1 ? "border-b-0" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-3 sm:px-4 py-3 text-sm whitespace-nowrap ${col.hideOnMobile ? "hidden lg:table-cell" : ""} ${col.className || ""}`}>
                  {col.render ? col.render(item, index) : String((item as Record<string, unknown>)[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
