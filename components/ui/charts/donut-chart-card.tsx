"use client";

import { useState } from "react";

export interface DonutChartSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  segments: DonutChartSegment[];
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChartCard({
  title,
  subtitle,
  segments,
  centerLabel = "Total",
  centerValue,
}: DonutChartCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValue = segments.reduce((sum, s) => sum + s.value, 0);

  if (totalValue === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        <div className="flex h-44 items-center justify-center text-xs text-neutral-400">
          No breakdown data available
        </div>
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90;

  const arcs = segments.map((seg, i) => {
    const percentage = totalValue > 0 ? seg.value / totalValue : 0;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = 0;
    const rotation = currentAngle;
    currentAngle += percentage * 360;

    return {
      ...seg,
      percentage: Math.round(percentage * 100),
      strokeDasharray,
      strokeDashoffset,
      rotation,
    };
  });

  const activeSegment = hoveredIndex !== null ? arcs[hoveredIndex] : null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-[#0A0A0A]">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-0">
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={hoveredIndex === i ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                transform={`rotate(${arc.rotation} ${size / 2} ${size / 2})`}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
              {activeSegment ? activeSegment.label : centerLabel}
            </span>
            <span className="text-base font-bold text-neutral-900 dark:text-white">
              {activeSegment
                ? `${activeSegment.percentage}%`
                : centerValue || totalValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full sm:w-auto flex-1 space-y-2">
          {arcs.map((arc, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                hoveredIndex === i
                  ? "bg-neutral-100 dark:bg-neutral-900 font-semibold"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: arc.color }} />
                <span className="text-neutral-700 dark:text-neutral-300">{arc.label}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className="text-neutral-900 dark:text-white">{arc.value.toLocaleString()}</span>
                <span className="text-[10px] text-neutral-400">({arc.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
