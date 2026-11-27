"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { WORK_AREA_OPTIONS } from "@/data/demoData";
import { normalizeWorkArea } from "@/lib/worklogSummary";
import type { WorkAreaOption, WorkdayLog } from "@/types/intern";

interface DailyReportsPanelProps {
  workdays: WorkdayLog[];
  onSaveAccomplishment: (
    dayId: string,
    workArea: WorkAreaOption,
    accomplishment: string
  ) => void;
}

function formatDayHours(hoursWorked: number | null): string {
  if (hoursWorked === null) return "—";
  return `${hoursWorked.toFixed(2)} h`;
}

function DailyReportForm({
  day,
  onSave,
}: {
  day: WorkdayLog;
  onSave: (dayId: string, area: WorkAreaOption, notes: string) => void;
}) {
  const [workArea, setWorkArea] = useState<WorkAreaOption>(() =>
    normalizeWorkArea(day.workArea)
  );
  const [notes, setNotes] = useState(day.accomplishment);
  const [errorMsg, setErrorMsg] = useState("");
  const [justSaved, setJustSaved] = useState(false);

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
    <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-3.5">
      <div>
        <label
          htmlFor={areaId}
          className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]"
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
        <p className="text-[0.68rem] font-bold tracking-[0.1em] text-[var(--text-muted)] uppercase">
          ILOG MO ITO
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-[var(--text-muted)]">
          <li>
            <span className="font-semibold text-[var(--text-secondary)]">
              Ano
            </span>{" "}
            ang ginawa, at ilan ang natapos.
          </li>
          <li>
            <span className="font-semibold text-[var(--text-secondary)]">
              Ano
            </span>{" "}
            ang output — file, papel, o bilang.
          </li>
          <li>
            <span className="font-semibold text-[var(--text-secondary)]">
              Kung
            </span>{" "}
            may hadlang: ano, at sino ang hinihintay.
          </li>
        </ul>
      </div>

      <div>
        <label
          htmlFor={notesId}
          className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]"
        >
          Ano ang natapos mo sa araw na ito?
        </label>
        <textarea
          id={notesId}
          name="accomplishment"
          rows={3}
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
          className="ashai-tap-target rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-bold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
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
  );
}

export function DailyReportsPanel({
  workdays,
  onSaveAccomplishment,
}: DailyReportsPanelProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    workdays[0] ? [workdays[0].id] : []
  );

  const toggleDay = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section
      aria-labelledby="mga-araw-heading"
      className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5"
    >
      <h2
        id="mga-araw-heading"
        className="text-[0.68rem] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase"
      >
        MGA ARAW · {workdays.length}
      </h2>

      <div className="mt-4 divide-y divide-[var(--border-subtle)]">
        {workdays.map((day, idx) => {
          const expanded = expandedIds.includes(day.id);
          const panelId = `day-panel-${day.id}`;

          return (
            <div
              key={`${day.id}-${day.workArea}-${day.accomplishment}`}
              className={idx === 0 ? "pb-4" : "py-4"}
            >
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggleDay(day.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {day.taskTitle}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {day.dateLabel} · {day.timeRangeLabel}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[var(--text-primary)]">
                  {formatDayHours(day.hoursWorked)}
                </span>
              </button>

              <div id={panelId} hidden={!expanded}>
                <DailyReportForm day={day} onSave={onSaveAccomplishment} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
