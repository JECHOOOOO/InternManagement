"use client";

import { useMemo, useState } from "react";
import { formatHoursMinutes } from "@/data/demoData";
import type { WorkdayLog } from "@/types/intern";

interface OrasChartsProps {
  workdays: WorkdayLog[];
  totalLoggedHours: number;
  targetHours: number;
}

const WEEK_DAYS = [
  { key: "Mon", label: "Day 1", shortDay: "Mon" },
  { key: "Tue", label: "Day 2", shortDay: "Tue" },
  { key: "Wed", label: "Day 3", shortDay: "Wed" },
  { key: "Thu", label: "Day 4", shortDay: "Thu" },
  { key: "Fri", label: "Day 5", shortDay: "Fri" },
] as const;

export function OrasCharts({
  workdays,
  totalLoggedHours,
  targetHours,
}: OrasChartsProps) {
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);

  const weeklyPoints = useMemo(() => {
    return WEEK_DAYS.map((day) => {
      const matched = workdays.find((w) =>
        w.dateLabel.toLowerCase().startsWith(day.key.toLowerCase())
      );
      return {
        ...day,
        hours: matched?.hoursWorked ?? 0,
        isCurrentShift: Boolean(matched?.isCurrentShift),
      };
    });
  }, [workdays]);

  const maxHours = useMemo(() => {
    const highest = Math.max(...weeklyPoints.map((p) => p.hours), 8);
    return Math.ceil(highest / 2) * 2;
  }, [weeklyPoints]);

  const yTicks = useMemo(() => {
    const step = maxHours / 4;
    return [0, step, step * 2, step * 3, maxHours];
  }, [maxHours]);

  // SVG coordinate system for the filled line graph
  const svgW = 360;
  const svgH = 210;
  const padLeft = 38;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 34;
  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const coords = weeklyPoints.map((pt, idx) => {
    const x = padLeft + (idx / (WEEK_DAYS.length - 1)) * plotW;
    const y = padTop + plotH - (pt.hours / maxHours) * plotH;
    return { ...pt, x, y, idx };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  // Donut / ring pie chart values
  const safeTarget = Math.max(1, targetHours);
  const completedHours = Math.min(safeTarget, Math.max(0, totalLoggedHours));
  const remainingHours = Math.max(0, safeTarget - completedHours);
  const completedRatio = completedHours / safeTarget;
  const completedPct = Math.round(completedRatio * 100);
  const ringRadius = 42;
  const ringStrokeWidth = 16;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const completedDash = completedRatio * ringCircumference;

  const selectedPoint =
    activeDayIdx !== null ? coords[activeDayIdx] : null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.45fr_1fr]">
      {/* Filled Line Graph (Hours vs 5 Days per Week) */}
      <div className="ashai-card flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase">
              Weekly Hours (5 Days)
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {selectedPoint
                ? `${selectedPoint.label} (${selectedPoint.shortDay}): ${formatHoursMinutes(selectedPoint.hours)}`
                : "Hours logged per day (Mon–Fri)"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4FBFB0]/15 px-2.5 py-0.5 text-[0.7rem] font-semibold text-[#4FBFB0]">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#4FBFB0]"
            />
            Hours
          </span>
        </div>

        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            role="img"
            aria-label="Weekly hours filled line graph across 5 workdays"
            className="h-auto w-full select-none"
          >
            <defs>
              <linearGradient id="ashaiHoursFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4FBFB0" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#4FBFB0" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines + Y-axis hour labels */}
            {yTicks.map((tick) => {
              const y = padTop + plotH - (tick / maxHours) * plotH;
              return (
                <g key={tick}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgW - padRight}
                    y2={y}
                    stroke="#222a2a"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#93a3a3"
                    fontSize="10.5"
                    fontWeight="500"
                  >
                    {tick}h
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={padLeft}
              y1={padTop}
              x2={padLeft}
              y2={padTop + plotH}
              stroke="#3a4747"
              strokeWidth="1.2"
            />
            <line
              x1={padLeft}
              y1={padTop + plotH}
              x2={svgW - padRight}
              y2={padTop + plotH}
              stroke="#3a4747"
              strokeWidth="1.2"
            />

            {/* Filled area under line */}
            <path d={areaPath} fill="url(#ashaiHoursFill)" />

            {/* Crisp line */}
            <path
              d={linePath}
              fill="none"
              stroke="#4FBFB0"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Interactive data points & X-axis labels (Day 1 - Day 5) */}
            {coords.map((pt) => {
              const isSelected = activeDayIdx === pt.idx;
              return (
                <g
                  key={pt.key}
                  onMouseEnter={() => setActiveDayIdx(pt.idx)}
                  onMouseLeave={() => setActiveDayIdx(null)}
                  onClick={() =>
                    setActiveDayIdx((prev) => (prev === pt.idx ? null : pt.idx))
                  }
                  className="cursor-pointer"
                >
                  {/* X-axis tick */}
                  <line
                    x1={pt.x}
                    y1={padTop + plotH}
                    x2={pt.x}
                    y2={padTop + plotH + 4}
                    stroke="#3a4747"
                    strokeWidth="1.2"
                  />
                  {/* X-axis label */}
                  <text
                    x={pt.x}
                    y={padTop + plotH + 17}
                    textAnchor="middle"
                    fill={isSelected ? "#4FBFB0" : "#93a3a3"}
                    fontSize="10.5"
                    fontWeight={isSelected ? "700" : "500"}
                  >
                    {pt.shortDay}
                  </text>
                  <text
                    x={pt.x}
                    y={padTop + plotH + 29}
                    textAnchor="middle"
                    fill="#667676"
                    fontSize="9"
                  >
                    D{pt.idx + 1}
                  </text>

                  {/* Hit area */}
                  <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                  {/* Point dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 5.5 : 4}
                    fill="#4FBFB0"
                    stroke="#090c0c"
                    strokeWidth="2"
                  />

                  {/* Value badge above point when active */}
                  {isSelected ? (
                    <g>
                      <rect
                        x={Math.min(Math.max(pt.x - 28, padLeft), svgW - padRight - 56)}
                        y={Math.max(2, pt.y - 26)}
                        width="56"
                        height="18"
                        rx="5"
                        fill="#090c0c"
                        stroke="#4FBFB0"
                        strokeWidth="1"
                      />
                      <text
                        x={Math.min(Math.max(pt.x, padLeft + 28), svgW - padRight - 28)}
                        y={Math.max(14, pt.y - 14)}
                        textAnchor="middle"
                        fill="#f3f6f6"
                        fontSize="9.5"
                        fontWeight="700"
                      >
                        {formatHoursMinutes(pt.hours)}
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Pie Graph (Completed vs Required Total Hours, e.g. 240h) */}
      <div className="ashai-card flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
        <div>
          <h3 className="text-xs font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase">
            Required Hours
          </h3>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Total: <strong className="text-[var(--text-primary)]">{safeTarget} hrs</strong>
          </p>
        </div>

        <div className="my-3 flex items-center justify-center gap-4 sm:flex-row md:flex-col lg:flex-row">
          <div className="relative size-32 shrink-0">
            <svg
              viewBox="0 0 120 120"
              role="img"
              aria-label={`Donut chart: ${completedHours.toFixed(2)} of ${safeTarget} required hours completed (${completedPct}%)`}
              className="size-full"
            >
              {/* Remaining ring track */}
              <circle
                cx="60"
                cy="60"
                r={ringRadius}
                fill="none"
                stroke="#222c2c"
                strokeWidth={ringStrokeWidth}
              />

              {/* Completed arc (#4FBFB0) starting at 12 o'clock clockwise */}
              {completedRatio > 0 ? (
                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  fill="none"
                  stroke="#4FBFB0"
                  strokeWidth={ringStrokeWidth}
                  strokeDasharray={`${completedDash} ${ringCircumference}`}
                  strokeLinecap="butt"
                  transform="rotate(-90 60 60)"
                />
              ) : null}

              {/* Crisp outer & inner ring borders matching the reference donut style */}
              <circle
                cx="60"
                cy="60"
                r={ringRadius + ringStrokeWidth / 2}
                fill="none"
                stroke="#090c0c"
                strokeWidth="3"
              />
              <circle
                cx="60"
                cy="60"
                r={ringRadius - ringStrokeWidth / 2}
                fill="none"
                stroke="#090c0c"
                strokeWidth="3"
              />
            </svg>

            {/* Center percentage label */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
              <span className="text-lg font-extrabold leading-none text-[#4FBFB0]">
                {completedPct}%
              </span>
            </div>
          </div>

          <div className="min-w-0 space-y-2 text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full bg-[#4FBFB0]"
                />
                <span>Completed</span>
              </div>
              <p className="mt-0.5 pl-4 text-sm font-bold text-[#4FBFB0]">
                {formatHoursMinutes(completedHours)}{" "}
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  ({completedPct}%)
                </span>
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full bg-[#1b2424] ring-1 ring-[#384747]"
                />
                <span>Remaining</span>
              </div>
              <p className="mt-0.5 pl-4 text-sm font-bold text-[var(--text-primary)]">
                {formatHoursMinutes(remainingHours)}
              </p>
            </div>
          </div>
        </div>

        <p className="border-t border-[var(--border-subtle)] pt-2 text-[0.7rem] text-[var(--text-muted)]">
          {formatHoursMinutes(completedHours)} / {safeTarget}h completed
        </p>
      </div>
    </div>
  );
}
