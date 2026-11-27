"use client";

import Link from "next/link";
import { Utensils } from "lucide-react";
import { DailyReportsPanel } from "@/components/oras/DailyReportsPanel";
import { ShiftControlCard } from "@/components/oras/ShiftControlCard";
import { useInternApp } from "@/context/InternAppContext";
import { summarizeWorklogs } from "@/lib/worklogSummary";

export default function OrasPage() {
  const { state, toggleTimeInOut, saveWorkdayAccomplishment } = useInternApp();

  const summary = summarizeWorklogs({
    totalLoggedHours: state.totalLoggedHours,
    targetHours: state.profile.targetHours,
    workdays: state.workdays,
  });

  return (
    <div className="space-y-4">
      {/* Page Title + Open my leads CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Oras at daily reports
          </h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Time-in, OJT hours, at daily accomplishment reports sa iisang malinis
            na view.
          </p>
        </div>
        <Link
          href="/me/leads"
          className="ashai-tap-target inline-flex items-center justify-center rounded-xl bg-[var(--accent-teal)] px-4 py-2 text-sm font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
        >
          Open my leads
        </Link>
      </div>

      {/* Desktop 2-Column Split-View (Oras on Left, Daily Reports on Right) */}
      <div className="space-y-5 lg:grid lg:grid-cols-[21.5rem_minmax(0,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
        {/* LEFT COLUMN: Oras Progress + Active Shift / Time-In */}
        <div className="space-y-4 lg:sticky lg:top-16">
          <section
            aria-labelledby="oras-ko-heading"
            className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="oras-ko-heading"
                className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
              >
                Oras ko
              </h2>
              <span className="rounded-full bg-[var(--accent-teal-soft)] px-2.5 py-0.5 text-[0.7rem] font-bold text-[var(--accent-teal)]">
                {summary.percentComplete}%
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {summary.loggedLabel}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">
                sa {summary.targetHours} oras
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Internship hours progress"
              aria-valuemin={0}
              aria-valuemax={summary.targetHours}
              aria-valuenow={Number(summary.loggedHours.toFixed(2))}
              className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-pill)]"
            >
              <div
                className="h-full rounded-full bg-[var(--accent-teal)] transition-all duration-300"
                style={{ width: `${Math.max(4, summary.percentComplete)}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">
              {summary.remainingLabel} pa para makumpleto.
            </p>

            <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-[var(--callout-amber-border)] bg-[var(--callout-amber-bg)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--callout-amber-text)]">
              <Utensils
                className="mt-0.5 size-4 shrink-0 text-[var(--callout-amber-icon)]"
                aria-hidden="true"
              />
              <p className="font-normal">
                <strong className="font-semibold text-[var(--callout-amber-strong)]">
                  12:00–1:00 ay pahinga
                </strong>{" "}
                (auto-deduct).{" "}
                <strong className="font-semibold text-[var(--callout-amber-strong)]">
                  8:00–5:00
                </strong>{" "}
                lang ang binibilang.
              </p>
            </div>
          </section>

          <ShiftControlCard
            timedIn={state.timedIn}
            activeShiftTrack={state.activeShiftTrack}
            activeShiftStartLabel={state.activeShiftStartLabel}
            timeInPhotoDataUrl={state.timeInPhotoDataUrl}
            onToggleTimeInOut={toggleTimeInOut}
          />
        </div>

        {/* RIGHT COLUMN: Daily Reports Workspace */}
        <DailyReportsPanel
          workdays={state.workdays}
          savedReportsCount={summary.savedReportsCount}
          onSaveAccomplishment={saveWorkdayAccomplishment}
        />
      </div>
    </div>
  );
}
