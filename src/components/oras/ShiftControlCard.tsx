"use client";

import { useState } from "react";
import { Camera, LogIn, LogOut } from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { SHIFT_TASK_OPTIONS } from "@/data/demoData";
import { resolveShiftTrack } from "@/lib/worklogSummary";

interface ShiftControlCardProps {
  timedIn: boolean;
  activeShiftTrack: string;
  activeShiftStartLabel: string;
  timeInPhotoDataUrl?: string;
  onToggleTimeInOut: (trackName?: string, timeInPhotoDataUrl?: string) => void;
}

export function ShiftControlCard({
  timedIn,
  activeShiftTrack,
  activeShiftStartLabel,
  timeInPhotoDataUrl,
  onToggleTimeInOut,
}: ShiftControlCardProps) {
  const [timeInModalOpen, setTimeInModalOpen] = useState(false);
  const [timeOutModalOpen, setTimeOutModalOpen] = useState(false);
  const [nextShiftTrack, setNextShiftTrack] = useState("");
  const [customTask, setCustomTask] = useState("");
  const [taskDetails, setTaskDetails] = useState("");
  const [timeInPhotoUrl, setTimeInPhotoUrl] = useState<string | null>(null);
  const [timeInPhotoError, setTimeInPhotoError] = useState<string | null>(null);

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

  const resolvedShiftTrack = customTask.trim()
    ? customTask.trim()
    : resolveShiftTrack(
        nextShiftTrack || activeShiftTrack || SHIFT_TASK_OPTIONS[0],
        customTask
      );

  return (
    <>
      <section
        aria-labelledby="shift-status-heading"
        className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5"
      >
        <h2
          id="shift-status-heading"
          className="text-[0.68rem] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase"
        >
          {timedIn ? "NAKAPASOK KA NGAYON" : "ANO ANG GAGAWIN MO NGAYON"}
        </h2>

        {timedIn ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-bold text-[var(--text-primary)]">
                  {activeShiftTrack}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Thu, Nov 26 · pumasok {activeShiftStartLabel}
                </p>
              </div>
              {timeInPhotoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={timeInPhotoDataUrl}
                  alt="Time-in attendance photo"
                  className="size-12 shrink-0 rounded-xl border border-[var(--border-teal)] object-cover"
                />
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setTimeOutModalOpen(true)}
              className="ashai-tap-target inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--timeout-btn-bg)] px-4 py-3 text-sm font-bold text-[var(--timeout-btn-text)] transition hover:bg-[var(--timeout-btn-hover)]"
            >
              <LogOut className="size-4" aria-hidden="true" />
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
            className="mt-3.5 space-y-3"
          >
            <div>
              <label htmlFor="next-shift-track" className="visually-hidden">
                Piliin ang gawain
              </label>
              <select
                id="next-shift-track"
                value={nextShiftTrack}
                onChange={(e) => setNextShiftTrack(e.target.value)}
                className="ashai-control"
              >
                <option value="">Piliin ang gawain...</option>
                {SHIFT_TASK_OPTIONS.map((task) => (
                  <option key={task} value={task}>
                    {task}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="custom-shift-track" className="visually-hidden">
                Custom task
              </label>
              <input
                id="custom-shift-track"
                type="text"
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                placeholder="...o i-type kung wala sa listahan"
                className="ashai-control"
              />
            </div>

            <div>
              <label htmlFor="shift-task-details" className="visually-hidden">
                Dagdag na detalye (opsyonal)
              </label>
              <input
                id="shift-task-details"
                type="text"
                value={taskDetails}
                onChange={(e) => setTaskDetails(e.target.value)}
                placeholder="Dagdag na detalye (opsyonal)"
                className="ashai-control"
              />
            </div>

            <button
              type="submit"
              className="ashai-tap-target inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-teal)] px-4 py-3 text-sm font-bold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
            >
              <LogIn className="size-4" aria-hidden="true" />
              <span>Time in</span>
            </button>
          </form>
        )}
      </section>

      {/* Time In Take-a-Picture Modal */}
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
                onToggleTimeInOut(resolvedShiftTrack, timeInPhotoUrl);
                setTimeInPhotoUrl(null);
                setTimeInPhotoError(null);
                setCustomTask("");
                setTaskDetails("");
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
              {activeShiftTrack}
            </strong>{" "}
            (started {activeShiftStartLabel}).
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
                onToggleTimeInOut();
                setTimeOutModalOpen(false);
              }}
              className="ashai-tap-target flex-1 rounded-xl bg-[#f1f5f9] px-4 py-2.5 text-sm font-extrabold text-[#0b1010] hover:bg-white"
            >
              Confirm Time out
            </button>
          </div>
        </div>
      </AccessibleModal>
    </>
  );
}
