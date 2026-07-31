"use client";

import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { mockSales, mockAlerts, mockBranches } from "@/lib/mock-data";

const saleColumns = [
  { key: "time", header: "Time" },
  {
    key: "items",
    header: "Items",
    render: (item: typeof mockSales[0]) => (
      <span className="text-neutral-500">{item.items} items</span>
    ),
    hideOnMobile: true,
  },
  {
    key: "total",
    header: "Total",
    render: (item: typeof mockSales[0]) => (
      <span className="font-medium">ETB {item.total.toLocaleString()}</span>
    ),
  },
  { key: "payment", header: "Payment", hideOnMobile: true },
  {
    key: "served_by",
    header: "Served By",
    render: (item: typeof mockSales[0]) => (
      <span className="text-neutral-500">{item.served_by}</span>
    ),
    hideOnMobile: true,
  },
];

const branchColumns = [
  {
    key: "name",
    header: "Branch",
    render: (item: typeof mockBranches[0]) => (
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-neutral-500">{item.location}</p>
      </div>
    ),
  },
  {
    key: "manager",
    header: "Manager",
    render: (item: typeof mockBranches[0]) => {
      const manager = item.users.find((u) => u.role === "manager");
      return <span className="text-neutral-500">{manager?.name ?? "—"}</span>;
    },
    hideOnMobile: true,
  },
  {
    key: "staff",
    header: "Staff",
    render: (item: typeof mockBranches[0]) => (
      <span className="text-neutral-500">{item.users.length} members</span>
    ),
    hideOnMobile: true,
  },
];

const topSelling = [
  { name: "Paracetamol 500mg", value: 92 },
  { name: "Amoxicillin 500mg", value: 78 },
  { name: "Omeprazole 20mg", value: 65 },
  { name: "Cetirizine 10mg", value: 52 },
  { name: "Metformin 500mg", value: 40 },
];

const maxVal = Math.max(...topSelling.map((d) => d.value));

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Today's Sales" value="575.00 ETB" description="↑ 100 from yesterday" />
        <StatsCard title="Total Medicines" value={2} description="Across 2 categories" />
        <StatsCard title="Low Stock" value={0} description="Needs reorder" />
        <StatsCard title="Expiring Soon" value={2} description="Within 180 days" />
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Today's Transactions" value={1} description="Completed sales today (receipts)" />
        <StatsCard title="This Month's Sales" value="575.00 ETB" description="From Jul 01" />
        <StatsCard title="Open Purchase Orders" value={2} description="0 received today" />
        <StatsCard title="Inventory Value" value="110,800.00 ETB" description="579 total units on hand" />
      </div>

      {/* Mini Sales Chart */}
      {(() => {
        const salesData = [
          { day: "Mon", value: 320 },
          { day: "Tue", value: 450 },
          { day: "Wed", value: 280 },
          { day: "Thu", value: 600 },
          { day: "Fri", value: 520 },
          { day: "Sat", value: 750 },
          { day: "Sun", value: 575 },
        ];
        const maxSale = Math.max(...salesData.map((d) => d.value));
        const cW = 440;
        const cH = 140;
        const pL = 20;
        const pR = 20;
        const pT = 14;
        const pB = 18;
        const iW = cW - pL - pR;
        const iH = cH - pT - pB;
        const step = iW / (salesData.length - 1);
        const pts = salesData.map((d, i) => ({
          x: pL + i * step,
          y: pT + iH - (d.value / maxSale) * iH,
        }));
        const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        const area = `${line} L ${pts[pts.length - 1].x} ${pT + iH} L ${pts[0].x} ${pT + iH} Z`;

        return (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-3">
                <h2 className="text-sm font-medium">Mini Sales Chart</h2>
                <span className="text-xs text-neutral-500">Last 7 days</span>
              </div>
              <div className="p-4 sm:p-5">
                <svg viewBox={`0 0 ${cW} ${cH}`} className="w-full h-auto text-neutral-900 dark:text-neutral-100">
                  <defs>
                    <linearGradient id="miniAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  <path d={area} fill="url(#miniAreaFill)" />
                  <path d={line} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  {pts.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="2.5" fill="white" stroke="currentColor" strokeWidth="1.5" />
                      <text x={p.x} y={p.y - 8} textAnchor="middle" className="fill-neutral-700 dark:fill-neutral-300" fontSize="7" fontWeight="500">
                        {salesData[i].value}
                      </text>
                    </g>
                  ))}
                  {salesData.map((d, i) => (
                    <text key={i} x={pts[i].x} y={cH - 2} textAnchor="middle" className="fill-neutral-400" fontSize="8">
                      {d.day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            <div className="rounded-lg border border-border">
              <div className="border-b border-border px-4 sm:px-5 py-3">
                <h2 className="text-sm font-medium">Stock Alerts</h2>
              </div>
              <div className="divide-y divide-border">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="px-4 sm:px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{alert.medicine}</p>
                      <span
                        className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          alert.type === "low_stock"
                            ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        }`}
                      >
                        {alert.type === "low_stock" ? "Low" : "Expiring"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500">{alert.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div>
          <div className="rounded-lg border border-border">
            <div className="border-b border-border px-4 sm:px-5 py-3">
              <h2 className="text-sm font-medium">Top Selling</h2>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height: 160 }}>
                {topSelling.map((item) => {
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div key={item.name} className="flex flex-col items-center justify-end flex-1 h-full max-w-[60px]">
                      <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">{item.value}</span>
                      <div
                        className="w-full bg-neutral-900 dark:bg-neutral-100 rounded-t"
                        style={{ height: `${pct}%` }}
                      />
                      <p className="text-[9px] sm:text-[10px] text-neutral-500 text-center leading-tight mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                        {item.name.length > 10 ? item.name.slice(0, 10) + "…" : item.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-medium">Recent Sales</h2>
            <a href="/sales" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              View all
            </a>
          </div>
          <DataTable columns={saleColumns} data={mockSales} />
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 sm:px-5 py-3">
          <h2 className="text-sm font-medium">Branches</h2>
        </div>
        <DataTable columns={branchColumns} data={mockBranches} />
      </div>
    </div>
  );
}
