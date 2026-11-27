"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  LogIn,
  LogOut,
  Utensils,
} from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { useInternApp } from "@/context/InternAppContext";
import {
  formatHoursMinutes,
  SHIFT_TASK_OPTIONS,
  WORK_AREA_OPTIONS,
} from "@/data/demoData";
import type { WorkAreaOption, WorkdayLog } from "@/types/intern";

function normalizeWorkArea(value: string): WorkAreaOption {
  return WORK_AREA_OPTIONS.includes(value as WorkAreaOption)
    ? (value as WorkAreaOption)
    : "Other";
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

export default function OrasPage() {
  const { state, toggleTimeInOut, saveWorkdayAccomplishment } = useInternApp();
  const [selectedDayId, setSelectedDayId] = useState<string>(
    () => state.workdays[0]?.id ?? ""
  );
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    state.workdays[0] ? [state.workdays[0].id] : []
  );
  const [timeInModalOpen, setTimeInModalOpen] = useState(false);
  const [timeOutModalOpen, setTimeOutModalOpen] = useState(false);
  const [nextShiftTrack, setNextShiftTrack] = useState(() =>
    SHIFT_TASK_OPTIONS.includes(state.activeShiftTrack)
      ? state.activeShiftTrack
      : SHIFT_TASK_OPTIONS[0]
  );
  const [customTask, setCustomTask] = useState("");
  const [timeInPhotoUrl, setTimeInPhotoUrl] = useState<string | null>(null);
  const [timeInPhotoError, setTimeInPhotoError] = useState<string | null>(null);

  const selectedDay =
    state.workdays.find((d) => d.id === selectedDayId) ??
    state.workdays[0] ??
    null;

  const savedReportsCount = state.workdays.filter((d) =>
    Boolean(d.accomplishment.trim())
  ).length;

  const handleTimeInPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setTimeInPhotoError("Pumili lamang ng image file.");
      return;
    }
    setTimeInPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setTimeInPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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
    setExpandedIds(allExpanded ? [] : state.workdays.map((day) => day.id));
  };

  const resolvedShiftTrack =
    nextShiftTrack === "Other" && customTask.trim()
      ? customTask.trim()
      : nextShiftTrack;

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
          {/* ORAS KO Progress Card */}
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
                {pct}%
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {formatHoursMinutes(state.totalLoggedHours)}
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
              {formatHoursMinutes(remaining)} pa para makumpleto.
            </p>

            {/* Lunch & Shift Window Rules Callout */}
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

          {/* Active Time-in / Time-out Card */}
          <section
            aria-labelledby="shift-status-heading"
            className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="shift-status-heading"
                className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
              >
                {state.timedIn ? "Nakapasok ka ngayon" : "Ano ang gagawin mo ngayon"}
              </h2>
              {state.timedIn ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-teal-soft)] px-2 py-0.5 text-[0.68rem] font-bold text-[var(--accent-teal)]">
                  <Clock className="size-3" aria-hidden="true" />
                  Active
                </span>
              ) : null}
            </div>

            {state.timedIn ? (
              <div className="mt-3 space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-[var(--text-primary)]">
                      {state.activeShiftTrack}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Thu, Nov 26 · pumasok {state.activeShiftStartLabel}
                    </p>
                  </div>
                  {state.timeInPhotoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={state.timeInPhotoDataUrl}
                      alt="Time-in attendance photo"
                      className="size-12 shrink-0 rounded-xl border border-[var(--border-teal)] object-cover"
                    />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setTimeOutModalOpen(true)}
                  className="ashai-tap-target inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--timeout-btn-bg)] px-4 py-2.5 text-sm font-extrabold text-[var(--timeout-btn-text)] transition hover:bg-[var(--timeout-btn-hover)]"
                >
                  <LogOut className="size-4.5" aria-hidden="true" />
                  <span>Time out</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setTimeInPhotoError(null);
                  setTimeInModalOpen(true);
                }}
                className="mt-3 space-y-3"
              >
                <div>
                  <label
                    htmlFor="next-shift-track"
                    className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]"
                  >
                    Today&apos;s task
                  </label>
                  <select
                    id="next-shift-track"
                    value={nextShiftTrack}
                    onChange={(e) => setNextShiftTrack(e.target.value)}
                    className="ashai-control"
                  >
                    {SHIFT_TASK_OPTIONS.map((task) => (
                      <option key={task} value={task}>
                        {task}
                      </option>
                    ))}
                  </select>
                </div>

                {nextShiftTrack === "Other" ? (
                  <div>
                    <label
                      htmlFor="custom-shift-track"
                      className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]"
                    >
                      Custom task
                    </label>
                    <input
                      id="custom-shift-track"
                      type="text"
                      value={customTask}
                      onChange={(e) => setCustomTask(e.target.value)}
                      placeholder="Ilagay ang task mo ngayon..."
                      className="ashai-control"
                    />
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="ashai-tap-target inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
                >
                  <LogIn className="size-4.5" aria-hidden="true" />
                  <span>Time in</span>
                </button>
              </form>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Daily Reports Workspace */}
        <section aria-labelledby="mga-araw-heading" className="space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-2.5">
              <h2
                id="mga-araw-heading"
                className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
              >
                Mga araw · {state.workdays.length}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-0.5 text-[0.7rem] font-semibold text-[var(--text-secondary)]">
                <FileText className="size-3 text-[var(--accent-teal)]" aria-hidden="true" />
                {savedReportsCount} / {state.workdays.length} reports saved
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

          {/* Desktop Master-Detail View: Compact Day Selector + Single Focused Report Editor */}
          <div className="hidden space-y-4 lg:block">
            <div
              role="tablist"
              aria-label="Select workday to log accomplishment"
              className="grid grid-cols-2 gap-2.5"
            >
              {state.workdays.map((day) => {
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
                  onSave={saveWorkdayAccomplishment}
                  compact
                />
              </article>
            ) : null}
          </div>

          {/* Mobile Collapsible Workdays List */}
          <div className="space-y-3 lg:hidden">
            {state.workdays.map((day) => (
              <MobileWorkdayAccordion
                key={`${day.id}-${day.workArea}-${day.accomplishment}`}
                day={day}
                expanded={expandedIds.includes(day.id)}
                onToggle={() => toggleDay(day.id)}
                onSave={saveWorkdayAccomplishment}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Time In Take-a-Picture Modal (triggered after clicking Time in) */}
      <AccessibleModal
        open={timeInModalOpen}
        onClose={() => {
          setTimeInModalOpen(false);
          setTimeInPhotoError(null);
        }}
        titleId="timein-photo-title"
        title="Take a picture to Time in"
        subtitle="Kumuha ng picture para makumpirma ang Time in at pumasok sa rolling attendance."
      >
        <div className="space-y-3.5">
          <label className="ashai-tap-target inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent-teal)] px-4 py-3 text-xs font-extrabold tracking-wide text-[var(--accent-teal-ink)] uppercase transition hover:bg-[var(--accent-teal-hover)]">
            <Camera className="size-4" aria-hidden="true" />
            <span>{timeInPhotoUrl ? "Retake picture" : "Take a picture"}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleTimeInPhotoChange}
              className="sr-only"
            />
          </label>

          {timeInPhotoError ? (
            <p
              role="alert"
              className="text-xs font-semibold text-[var(--accent-danger)]"
            >
              {timeInPhotoError}
            </p>
          ) : null}

          {timeInPhotoUrl ? (
            <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--accent-teal)]">
                  Picture ready
                </span>
                <button
                  type="button"
                  onClick={() => setTimeInPhotoUrl(null)}
                  className="font-semibold text-[var(--accent-danger)] hover:underline"
                >
                  Remove
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={timeInPhotoUrl}
                alt="Time-in photo preview"
                className="max-h-56 w-full rounded-lg border border-[var(--border-subtle)] object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setTimeInModalOpen(false);
                setTimeInPhotoError(null);
              }}
              className="ashai-tap-target rounded-xl border border-[var(--border-control)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!timeInPhotoUrl) {
                  setTimeInPhotoError(
                    "Kumuha muna ng picture bago mag-Confirm Time in."
                  );
                  return;
                }
                toggleTimeInOut(resolvedShiftTrack, timeInPhotoUrl);
                setTimeInPhotoUrl(null);
                setTimeInPhotoError(null);
                setTimeInModalOpen(false);
              }}
              className="ashai-tap-target rounded-xl bg-[var(--accent-teal)] px-4 py-2 text-sm font-extrabold text-[var(--accent-teal-ink)] hover:bg-[var(--accent-teal-hover)]"
            >
              Confirm Time in
            </button>
          </div>
        </div>
      </AccessibleModal>

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
