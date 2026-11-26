"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  LogIn,
  LogOut,
  Utensils,
} from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { useInternApp } from "@/context/InternAppContext";
import { WORK_AREA_OPTIONS } from "@/data/demoData";
import type { WorkAreaOption, WorkdayLog } from "@/types/intern";

function WorkdayCard({
  day,
  expanded,
  onToggle,
  onSave,
}: {
  day: WorkdayLog;
  expanded: boolean;
  onToggle: () => void;
  onSave: (dayId: string, area: WorkAreaOption, notes: string) => void;
}) {
  const [workArea, setWorkArea] = useState<WorkAreaOption>(day.workArea);
  const [notes, setNotes] = useState(day.accomplishment);
  const [errorMsg, setErrorMsg] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const panelId = `day-panel-${day.id}`;
  const areaId = `work-area-${day.id}`;
  const notesId = `accomplishment-${day.id}`;
  const errorId = `accomplishment-err-${day.id}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setErrorMsg("Maglagay muna ng maikling ulat ng natapos sa araw na ito.");
      document.getElementById(notesId)?.focus();
      return;
    }
    setErrorMsg("");
    onSave(day.id, workArea, notes);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <article className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-3 rounded-2xl px-4 py-4 text-left transition hover:bg-[var(--bg-card-hover)]"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-[var(--text-primary)]">
                {day.taskTitle}
              </span>
              {day.accomplishment ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-teal-soft)] px-2 py-0.5 text-[0.7rem] font-semibold text-[var(--accent-teal)]">
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  Saved
                </span>
              ) : (
                <span className="rounded-full bg-[var(--bg-pill)] px-2 py-0.5 text-[0.7rem] font-medium text-[var(--text-muted)]">
                  Needs report
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {day.dateLabel} · {day.timeRangeLabel}
            </p>
            {!expanded && day.accomplishment ? (
              <p className="mt-1.5 line-clamp-1 text-xs text-[var(--text-secondary)]">
                {day.workArea}: {day.accomplishment}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            {day.hoursWorked !== null ? (
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {day.hoursWorked.toFixed(2)} h
              </span>
            ) : (
              <span className="text-base font-bold text-[var(--accent-amber)]">
                —
              </span>
            )}
            <ChevronRight
              className={`size-5 text-[var(--text-muted)] transition-transform duration-150 ${
                expanded ? "rotate-90" : ""
              }`}
              aria-hidden="true"
            />
          </div>
        </button>
      </h3>

      <div
        id={panelId}
        hidden={!expanded}
        className="border-t border-[var(--border-subtle)] px-4 pt-4 pb-5"
      >
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={areaId}
              className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
            >
              Work area
            </label>
            <select
              id={areaId}
              name="workArea"
              value={workArea}
              onChange={(e) => setWorkArea(e.target.value as WorkAreaOption)}
              className="ashai-control"
            >
              {WORK_AREA_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3.5">
            <p className="text-xs font-extrabold tracking-[0.14em] text-[var(--text-muted)] uppercase">
              Ilog mo ito
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-[var(--text-secondary)]">
              <li>Ano ang ginawa, at ilan ang natapos.</li>
              <li>Ano ang output — file, papel, o bilang.</li>
              <li>Kung may hadlang: ano, at sino ang hinihintay.</li>
            </ul>
          </div>

          <div>
            <label
              htmlFor={notesId}
              className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
            >
              Ano ang natapos mo sa araw na ito?
            </label>
            <textarea
              id={notesId}
              name="accomplishment"
              value={notes}
              aria-invalid={errorMsg ? "true" : "false"}
              aria-describedby={errorMsg ? errorId : undefined}
              onChange={(e) => {
                setNotes(e.target.value);
                if (errorMsg && e.target.value.trim()) setErrorMsg("");
              }}
              placeholder="Tasks completed, output, findings, blockers, at next steps. Halimbawa: time study results, artwork completed, bug fixed, o clients contacted."
              className={`ashai-control ${
                errorMsg ? "user-invalid-fallback" : ""
              }`}
            />
            {errorMsg ? (
              <p
                id={errorId}
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--accent-danger)]"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="submit"
              className="ashai-tap-target w-full rounded-xl bg-[var(--accent-teal)] px-4 py-3 text-sm font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
            >
              Save accomplishment
            </button>
            {(justSaved || day.savedAtLabel) && (
              <p className="text-xs font-medium text-[var(--accent-success)]">
                {justSaved
                  ? "Saved locally (demo)!"
                  : `Last saved: ${day.savedAtLabel}`}
              </p>
            )}
          </div>
        </form>
      </div>
    </article>
  );
}

export default function OrasPage() {
  const { state, toggleTimeInOut, saveWorkdayAccomplishment } = useInternApp();
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    state.workdays[0] ? [state.workdays[0].id] : []
  );
  const [timeOutModalOpen, setTimeOutModalOpen] = useState(false);
  const [nextShiftTrack, setNextShiftTrack] = useState(state.activeShiftTrack);

  const targetHours = state.profile.targetHours || 240;
  const pct = Math.min(
    100,
    Math.round((state.totalLoggedHours / targetHours) * 100)
  );
  const remaining = Math.max(0, targetHours - state.totalLoggedHours);
  const allExpanded =
    state.workdays.length > 0 &&
    state.workdays.every((d) => expandedIds.includes(d.id));

  const toggleDay = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllDays = () => {
    setExpandedIds(
      allExpanded ? [] : state.workdays.map((day) => day.id)
    );
  };

  return (
    <div className="space-y-5">
      {/* Page Title + Open my leads CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Oras at daily reports
        </h1>
        <Link
          href="/me/leads"
          className="ashai-tap-target inline-flex items-center justify-center rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
        >
          Open my leads
        </Link>
      </div>

      {/* ORAS KO Progress Card */}
      <section
        aria-labelledby="oras-ko-heading"
        className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
      >
        <h2
          id="oras-ko-heading"
          className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
        >
          Oras ko
        </h2>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {state.totalLoggedHours.toFixed(2)}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            sa {targetHours} oras
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Internship hours progress"
          aria-valuemin={0}
          aria-valuemax={targetHours}
          aria-valuenow={Number(state.totalLoggedHours.toFixed(2))}
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-pill)]"
        >
          <div
            className="h-full rounded-full bg-[var(--accent-teal)] transition-all duration-300"
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">
          {pct}% · {remaining.toFixed(2)} oras pa.
        </p>

        {/* Lunch & Shift Window Rules Callout */}
        <div className="mt-4 flex gap-3 rounded-xl border border-[var(--border-amber)] bg-[var(--accent-amber-soft)] p-3.5 text-sm leading-relaxed text-[var(--text-primary)]">
          <Utensils
            className="mt-0.5 size-5 shrink-0 text-[var(--accent-amber)]"
            aria-hidden="true"
          />
          <div>
            <p>
              <strong className="font-bold">12:00–1:00 ay pahinga</strong> —
              hindi ito binibilang sa oras mo, at hindi mo na kailangang
              mag-time out. Awtomatiko itong ibinabawas.{" "}
              <strong className="font-bold">
                8:00 hanggang 5:00 lang ang binibilang
              </strong>{" "}
              — ang pumasok bago mag-8 ay nabibilang mula 8:00, at ang lampas ng
              5:00 ay hindi na.
            </p>
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              Demo display copy from screenshots — official cut-off rules live
              in Ashai backend.
            </p>
          </div>
        </div>
      </section>

      {/* Active Time-in / Time-out Card */}
      <section
        aria-labelledby="shift-status-heading"
        className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
      >
        <h2
          id="shift-status-heading"
          className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
        >
          {state.timedIn ? "Nakapasok ka ngayon" : "Handa mag-time in (Demo)"}
        </h2>

        {state.timedIn ? (
          <div className="mt-2.5 space-y-3.5">
            <div>
              <p className="text-lg font-extrabold text-[var(--text-primary)]">
                {state.activeShiftTrack}
              </p>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                Thu, Nov 26 · pumasok {state.activeShiftStartLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTimeOutModalOpen(true)}
              className="ashai-tap-target inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f1f5f9] px-4 py-3 text-base font-extrabold text-[#0b1010] transition hover:bg-white"
            >
              <LogOut className="size-5" aria-hidden="true" />
              <span>Time out</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toggleTimeInOut(nextShiftTrack);
            }}
            className="mt-3 space-y-3"
          >
            <div>
              <label
                htmlFor="next-shift-track"
                className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
              >
                Shift role / task
              </label>
              <select
                id="next-shift-track"
                value={nextShiftTrack}
                onChange={(e) => setNextShiftTrack(e.target.value)}
                className="ashai-control"
              >
                <option value="IT / software development">
                  IT / software development
                </option>
                <option value="IT QA">IT QA</option>
                <option value="IT QA / testing">IT QA / testing</option>
                <option value="Sticker maker">Sticker maker</option>
                <option value="Stock Count">Stock Count</option>
              </select>
            </div>
            <button
              type="submit"
              className="ashai-tap-target inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-teal)] px-4 py-3 text-base font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
            >
              <LogIn className="size-5" aria-hidden="true" />
              <span>Time in (Demo)</span>
            </button>
          </form>
        )}
      </section>

      {/* Collapsible Workdays List (improves long-scroll UX from screenshots) */}
      <section aria-labelledby="mga-araw-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2
            id="mga-araw-heading"
            className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
          >
            Mga araw · {state.workdays.length}
          </h2>
          <button
            type="button"
            aria-expanded={allExpanded}
            onClick={toggleAllDays}
            className="min-h-10 rounded-lg px-2.5 text-sm font-semibold text-[var(--accent-teal)] hover:bg-[var(--accent-teal-soft)]"
          >
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
        </div>

        <div className="space-y-3">
          {state.workdays.map((day) => (
            <WorkdayCard
              key={`${day.id}-${day.workArea}-${day.accomplishment}`}
              day={day}
              expanded={expandedIds.includes(day.id)}
              onToggle={() => toggleDay(day.id)}
              onSave={saveWorkdayAccomplishment}
            />
          ))}
        </div>
      </section>

      {/* Dedicated Leads Navigation Card (replaces duplicated full Leads form inside Oras) */}
      <section
        aria-label="Client leads shortcut"
        className="ashai-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
      >
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-[var(--text-primary)]">
            Client leads · {state.leads.length}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
            Moved to the dedicated Leads tab so daily reports stay easy to
            scroll on mobile.
          </p>
        </div>
        <Link
          href="/me/leads"
          className="ashai-tap-target inline-flex shrink-0 items-center gap-1 rounded-xl border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] px-3.5 py-2 text-sm font-bold text-[var(--accent-teal)] hover:bg-[rgba(77,196,178,0.22)]"
        >
          <span>Go to Leads</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      {/* Time Out Confirmation Modal */}
      <AccessibleModal
        open={timeOutModalOpen}
        onClose={() => setTimeOutModalOpen(false)}
        titleId="confirm-timeout-title"
        title="Confirm Time out?"
        subtitle="Demo shift action — updates your local hours summary."
      >
        <div className="space-y-4 text-sm text-[var(--text-secondary)]">
          <p>
            Active shift:{" "}
            <strong className="text-[var(--text-primary)]">
              {state.activeShiftTrack}
            </strong>{" "}
            (started {state.activeShiftStartLabel}).
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              autoFocus
              onClick={() => setTimeOutModalOpen(false)}
              className="ashai-tap-target flex-1 rounded-xl border border-[var(--border-control)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
            >
              Keep working
            </button>
            <button
              type="button"
              onClick={() => {
                toggleTimeInOut();
                setTimeOutModalOpen(false);
              }}
              className="ashai-tap-target flex-1 rounded-xl bg-[#f1f5f9] px-4 py-2.5 text-sm font-extrabold text-[#0b1010] hover:bg-white"
            >
              Confirm Time out
            </button>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
}
