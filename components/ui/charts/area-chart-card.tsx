"use client";

import { useState } from "react";

export interface AreaChartPoint {
  label: string;
  value: number;
}

interface AreaChartCardProps {
  title: string;
  subtitle?: string;
  data: AreaChartPoint[];
  currency?: string;
  height?: number;
}

export function AreaChartCard({
  title,
  subtitle,
  data,
  currency = "ETB",
  height = 220,
}: AreaChartCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        <div className="flex h-40 items-center justify-center text-xs text-neutral-400">
          No chart data available
        </div>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 100);
  const minValue = 0;

  const width = 500;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate SVG path coordinates
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = height - padding - ((d.value - minValue) / (maxValue - minValue || 1)) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Smooth bezier curve
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-[#0A0A0A]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
        </div>
        {hoveredPoint && (
          <div className="rounded bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-black">
            {hoveredPoint.label}: {hoveredPoint.value.toLocaleString()} {currency}
          </div>
        )}
      </div>

      <div className="mt-4 relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" strokeDasharray="3 3" className="text-neutral-200 dark:text-neutral-800" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" strokeDasharray="3 3" className="text-neutral-200 dark:text-neutral-800" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeWidth="1" />

          {/* Filled Area */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Smooth Line */}
          <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Data Dots */}
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? 6 : 4} fill={hoveredIndex === i ? "#10B981" : "#ffffff"} stroke="#10B981" strokeWidth="2" className="transition-all duration-150" />
              {/* X Axis Labels */}
              <text x={p.x} y={height - 8} textAnchor="middle" className="text-[10px] fill-neutral-400 font-medium">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
