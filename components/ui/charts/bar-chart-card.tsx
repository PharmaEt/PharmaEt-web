"use client";

export interface BarChartItem {
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
}

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  items: BarChartItem[];
  currency?: string;
}

export function BarChartCard({
  title,
  subtitle,
  items,
  currency = "ETB",
}: BarChartCardProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        <div className="flex h-44 items-center justify-center text-xs text-neutral-400">
          No data available for chart
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-[#0A0A0A]">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, idx) => {
          const percentage = Math.round((item.value / maxValue) * 100);
          const barColor = item.color || "#10B981";

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {item.label}
                  {item.sublabel && (
                    <span className="ml-1 text-[10px] text-neutral-400">({item.sublabel})</span>
                  )}
                </span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {item.value.toLocaleString()} {currency}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
