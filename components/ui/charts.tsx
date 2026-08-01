"use client";

interface BarChartData {
  label: string;
  value: number;
}

export function BarChart({ data }: { data: BarChartData[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      <div className="flex h-44 items-end gap-2 pt-6">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.value / maxValue) * 100);
          return (
            <div key={idx} className="flex flex-1 flex-col items-center gap-1 group relative">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 text-[10px] font-medium bg-neutral-900 text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded shadow">
                {item.value.toLocaleString()} ETB
              </div>
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full rounded-t bg-neutral-900 transition-all duration-300 group-hover:bg-emerald-600 dark:bg-neutral-200 dark:group-hover:bg-emerald-400"
              />
              <span className="text-[10px] text-neutral-500 font-medium truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ data }: { data: DonutChartData[] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
          {data.map((item, idx) => {
            const percent = (item.value / total) * 100;
            const strokeDasharray = `${percent} ${100 - percent}`;
            const strokeDashoffset = -cumulativePercent;
            cumulativePercent += percent;

            return (
              <circle
                key={idx}
                cx="18"
                cy="18"
                r="15.91549430918954"
                fill="transparent"
                stroke={item.color}
                strokeWidth="3.5"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold">{total}</span>
          <span className="text-[9px] text-neutral-500">Items</span>
        </div>
      </div>

      <div className="space-y-1.5 w-full">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-neutral-600 dark:text-neutral-400">{item.label}</span>
            </div>
            <span className="font-medium text-neutral-900 dark:text-neutral-200">
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
