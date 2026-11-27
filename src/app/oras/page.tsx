"use client";

import Link from "next/link";
import { Utensils } from "lucide-react";
import { DailyReportsPanel } from "@/components/oras/DailyReportsPanel";
import { QuickLeadsCard } from "@/components/oras/QuickLeadsCard";
import { ShiftControlCard } from "@/components/oras/ShiftControlCard";
import { useInternApp } from "@/context/InternAppContext";
import { summarizeWorklogs } from "@/lib/worklogSummary";

export default function OrasPage() {
  const {
    state,
    toggleTimeInOut,
    saveWorkdayAccomplishment,
    addLead,
    removeLead,
  } = useInternApp();

  const summary = summarizeWorklogs({
    totalLoggedHours: state.totalLoggedHours,
    targetHours: state.profile.targetHours,
    workdays: state.workdays,
  });

  return (
    <div className="space-y-4">
      {/* Page Title + Open my leads CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.45rem] font-bold tracking-tight text-[var(--text-primary)]">
          Oras at daily reports
        </h1>
        <Link
          href="/me/leads"
          className="ashai-tap-target inline-flex items-center justify-center rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-bold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
        >
          Open my leads
        </Link>
      </div>

      {/* Row 1: ORAS KO (Left) + ANO ANG GAGAWIN MO NGAYON (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <section
          aria-labelledby="oras-ko-heading"
          className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5"
        >
          <h2
            id="oras-ko-heading"
            className="text-[0.68rem] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase"
          >
            ORAS KO
          </h2>

          <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
            <span className="text-[2.25rem] font-extrabold leading-none tracking-tight text-[var(--text-primary)]">
              {summary.loggedDecimal}
            </span>
            <span className="text-sm text-[var(--text-muted)]">
              sa {summary.targetHours} oras
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Internship hours progress"
            aria-valuemin={0}
            aria-valuemax={summary.targetHours}
            aria-valuenow={Number(summary.loggedHours.toFixed(2))}
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-pill)]"
          >
            <div
              className="h-full rounded-full bg-[var(--accent-teal)] transition-all duration-300"
              style={{ width: `${Math.max(4, summary.percentComplete)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            {summary.percentComplete}% · {summary.remainingDecimal} oras pa.
          </p>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--callout-amber-border)] bg-[var(--callout-amber-bg)] px-4 py-3 text-xs leading-relaxed text-[var(--callout-amber-text)]">
            <Utensils
              className="mt-0.5 size-4 shrink-0 text-[var(--callout-amber-icon)]"
              aria-hidden="true"
            />
            <p className="font-normal">
              <strong className="font-semibold text-[var(--callout-amber-strong)]">
                12:00–1:00 ay pahinga
              </strong>{" "}
              — hindi ito binibilang sa oras mo, at hindi mo na kailangang
              mag-time out. Awtomatiko itong ibinabawas.{" "}
              <strong className="font-semibold text-[var(--callout-amber-strong)]">
                8:00 hanggang 5:00 lang ang binibilang
              </strong>{" "}
              — ang pumasok bago mag-8 ay nabibilang mula 8:00, at ang lampas ng
              5:00 ay hindi na.
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

      {/* Row 2: MGA ARAW (Left) + Client leads (Right on Desktop) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <DailyReportsPanel
          workdays={state.workdays}
          onSaveAccomplishment={saveWorkdayAccomplishment}
        />

        <div className="hidden lg:block">
          <QuickLeadsCard
            leads={state.leads}
            onAddLead={addLead}
            onRemoveLead={removeLead}
          />
        </div>
      </div>
    </div>
  );
}
