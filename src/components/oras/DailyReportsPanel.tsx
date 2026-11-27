"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { formatHoursMinutes, WORK_AREA_OPTIONS } from "@/data/demoData";
import { normalizeWorkArea } from "@/lib/worklogSummary";
import type { WorkAreaOption, WorkdayLog } from "@/types/intern";

interface DailyReportsPanelProps {
  workdays: WorkdayLog[];
  savedReportsCount: number;
  onSaveAccomplishment: (
    dayId: string,
    workArea: WorkAreaOption,
    accomplishment: string
  ) => void;
}

function DailyReportForm({
  day,
  onSave,
  compact = false,
}: {
  day: WorkdayLog;
  onSave: (dayId: string, area: WorkAreaOption, notes: string) => void;
  compact?: boolean;
}) {
  const [workArea, setWorkArea] = useState<WorkAreaOption>(() =>
    normalizeWorkArea(day.workArea)
  );
  const [notes, setNotes] = useState(day.accomplishment);
  const [errorMsg, setErrorMsg] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const areaId = `work-area-${day.id}-${compact ? "d" : "m"}`;
  const notesId = `accomplishment-${day.id}-${compact ? "d" : "m"}`;
  const errorId = `accomplishment-err-${day.id}-${compact ? "d" : "m"}`;

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
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={areaId}
            className="mb-1.5 block text-xs font-bold tracking-wide text-[var(--text-primary)] uppercase"
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

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] px-3.5 py-2.5">
          <p className="text-[0.68rem] font-extrabold tracking-[0.14em] text-[var(--text-muted)] uppercase">
            Ilog mo ito
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[0.74rem] leading-snug text-[var(--text-secondary)]">
            <li>Ano ang ginawa at ilan ang natapos.</li>
            <li>Ano ang output — file, papel, o bilang.</li>
            <li>Kung may hadlang: ano at sino ang hinihintay.</li>
          </ul>
        </div>
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
          rows={compact ? 5 : 4}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          className="ashai-tap-target w-full rounded-xl bg-[var(--accent-teal)] px-5 py-2.5 text-sm font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)] sm:w-auto"
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

function MobileWorkdayAccordion({
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
  const panelId = `day-panel-${day.id}`;

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
                {normalizeWorkArea(day.workArea)}: {day.accomplishment}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            {day.hoursWorked !== null ? (
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatHoursMinutes(day.hoursWorked)}
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
        <DailyReportForm day={day} onSave={onSave} />
      </div>
    </article>
  );
}

export function DailyReportsPanel({
  workdays,
  savedReportsCount,
  onSaveAccomplishment,
}: DailyReportsPanelProps) {
  const [selectedDayId, setSelectedDayId] = useState<string>(
    () => workdays[0]?.id ?? ""
  );
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    workdays[0] ? [workdays[0].id] : []
  );

  const selectedDay =
    workdays.find((d) => d.id === selectedDayId) ?? workdays[0] ?? null;

  const allExpanded =
    workdays.length > 0 && workdays.every((d) => expandedIds.includes(d.id));

  const toggleDay = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllDays = () => {
    setExpandedIds(allExpanded ? [] : workdays.map((day) => day.id));
  };

  return (
    <section aria-labelledby="mga-araw-heading" className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2.5">
          <h2
            id="mga-araw-heading"
            className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
          >
            Mga araw · {workdays.length}
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-0.5 text-[0.7rem] font-semibold text-[var(--text-secondary)]">
            <FileText
              className="size-3 text-[var(--accent-teal)]"
              aria-hidden="true"
            />
            {savedReportsCount} / {workdays.length} reports saved
          </span>
        </div>

        <button
          type="button"
          aria-expanded={allExpanded}
          onClick={toggleAllDays}
          className="min-h-9 rounded-lg px-2.5 text-xs font-semibold text-[var(--accent-teal)] hover:bg-[var(--accent-teal-soft)] lg:hidden"
        >
          {allExpanded ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {/* Desktop Master-Detail View */}
      <div className="hidden space-y-4 lg:block">
        <div
          role="tablist"
          aria-label="Select workday to log accomplishment"
          className="grid grid-cols-2 gap-2.5"
        >
          {workdays.map((day) => {
            const isSelected = selectedDay?.id === day.id;
            const hasReport = Boolean(day.accomplishment.trim());
            return (
              <button
                key={day.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedDayId(day.id)}
                className={`rounded-2xl border p-3.5 text-left transition ${
                  isSelected
                    ? "border-[var(--border-teal)] bg-[var(--bg-card)] shadow-[inset_3px_0_0_var(--accent-teal)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-card)]/75 hover:border-[var(--border-control)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                    {day.taskTitle}
                  </p>
                  <span className="shrink-0 text-xs font-extrabold text-[var(--text-primary)]">
                    {day.hoursWorked !== null
                      ? formatHoursMinutes(day.hoursWorked)
                      : "Active"}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                  {day.dateLabel} · {day.timeRangeLabel}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  {hasReport ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-teal-soft)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--accent-teal)]">
                      <CheckCircle2 className="size-3" aria-hidden="true" />
                      Saved
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--bg-pill)] px-2 py-0.5 text-[0.68rem] font-medium text-[var(--text-muted)]">
                      Needs report
                    </span>
                  )}
                  {isSelected ? (
                    <span className="text-[0.68rem] font-bold text-[var(--accent-teal)]">
                      Editing
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {selectedDay ? (
          <article
            role="tabpanel"
            aria-label={`Daily report for ${selectedDay.dateLabel}`}
            className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                    {selectedDay.taskTitle}
                  </h3>
                  {selectedDay.accomplishment ? (
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
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {selectedDay.dateLabel} · {selectedDay.timeRangeLabel}
                </p>
              </div>
              <span className="rounded-xl bg-[var(--bg-card-inner)] px-3 py-1.5 text-sm font-extrabold text-[var(--text-primary)]">
                {selectedDay.hoursWorked !== null
                  ? formatHoursMinutes(selectedDay.hoursWorked)
                  : "Ongoing"}
              </span>
            </div>

            <DailyReportForm
              key={`${selectedDay.id}-${selectedDay.workArea}-${selectedDay.accomplishment}`}
              day={selectedDay}
              onSave={onSaveAccomplishment}
              compact
            />
          </article>
        ) : null}
      </div>

      {/* Mobile Collapsible Workdays List */}
      <div className="space-y-3 lg:hidden">
        {workdays.map((day) => (
          <MobileWorkdayAccordion
            key={`${day.id}-${day.workArea}-${day.accomplishment}`}
            day={day}
            expanded={expandedIds.includes(day.id)}
            onToggle={() => toggleDay(day.id)}
            onSave={onSaveAccomplishment}
          />
        ))}
      </div>
    </section>
  );
}
