"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  Camera,
  CheckCircle2,
  Clock,
  FilePenLine,
  MessageSquare,
  Sticker,
  Trash2,
} from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { useInternApp } from "@/context/InternAppContext";
import { formatHoursMinutes } from "@/data/demoData";

function isAtOrPast430Pm(): boolean {
  const now = new Date();
  return now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() >= 30);
}

function DashboardContent() {
  const {
    state,
    toggleNotifications,
    dismissNotificationPrompt,
    toggleLabelJob,
    triggerCleaningReminder430,
    submitCleaningProof,
    clearCleaningProof,
    announce,
  } = useInternApp();

  const [draftPhotoUrl, setDraftPhotoUrl] = useState<string | null>(null);
  const [draftPhotoName, setDraftPhotoName] = useState("");
  const [cleaningNote, setCleaningNote] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [demoMessages, setDemoMessages] = useState([
    {
      id: "msg-1",
      sender: "Ops Desk (Demo)",
      text: "Reminder: pagdating ng 4:30 PM, simulan ang paglilinis at kumuha ng picture ng output.",
      time: "9:15 AM",
    },
  ]);

  const isAssignedToMeToday = state.cleaningRoster.assignedAccountIds.includes(
    state.accountId
  );
  const myProofToday =
    state.cleaningRoster.completedTodayByAccount[state.accountId];

  // Automatically trigger the 4:30 PM cleaning notification ONLY for the interns assigned today
  useEffect(() => {
    if (!state.timedIn || !isAssignedToMeToday) return;
    const checkTime = () => {
      if (isAtOrPast430Pm() && !state.cleaningDuty.reminderTriggeredAt430) {
        triggerCleaningReminder430(true);
      }
    };
    checkTime();
    const intervalId = window.setInterval(checkTime, 30_000);
    return () => window.clearInterval(intervalId);
  }, [
    state.timedIn,
    isAssignedToMeToday,
    state.cleaningDuty.reminderTriggeredAt430,
    triggerCleaningReminder430,
  ]);

  const show430Notif =
    state.timedIn &&
    isAssignedToMeToday &&
    (state.cleaningDuty.reminderTriggeredAt430 || Boolean(myProofToday));

  const handleCleaningPhotoSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Pumili lamang ng image file (JPG, PNG, o WebP).");
      return;
    }
    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraftPhotoUrl(reader.result);
        setDraftPhotoName(file.name || "cleaning-output.jpg");
      }
    };
    reader.readAsDataURL(file);
    // Reset input value so re-selecting the same file still fires onChange
    e.target.value = "";
  };

  const handleSubmitCleaningOutput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPhotoUrl) {
      setPhotoError(
        "Kumuha muna ng picture ng output ng paglilinis bago mag-submit."
      );
      return;
    }
    submitCleaningProof(draftPhotoUrl, draftPhotoName, cleaningNote);
    setDraftPhotoUrl(null);
    setDraftPhotoName("");
    setCleaningNote("");
    setPhotoError(null);
  };

  const pendingLabelsCount = useMemo(
    () =>
      state.labelJobs
        .filter((job) => !job.done)
        .reduce((sum, job) => sum + job.quantity, 0),
    [state.labelJobs]
  );

  return (
    <div className="space-y-5">
      {/* Greeting Card */}
      <section
        aria-label="Intern profile summary"
        className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
      >
        <div className="flex items-center gap-3.5">
          {state.profile.avatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.profile.avatarDataUrl}
              alt={`${state.profile.fullName} profile photo`}
              className="size-12 shrink-0 rounded-full border border-[var(--border-teal)] object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] text-base font-extrabold text-[var(--accent-teal)]"
            >
              {state.profile.initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold leading-snug tracking-tight text-[var(--text-primary)] break-words">
              Good morning, {state.profile.fullName}
            </h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[var(--accent-teal)]">
                {state.profile.roleLabel}
              </span>
              <span className="rounded-md bg-[var(--bg-pill)] px-2 py-0.5 text-[0.7rem] font-medium text-[var(--text-muted)]">
                Demo account
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Phone Notification Prompt Card */}
      {!state.notificationPromptDismissed ? (
        <section
          aria-labelledby="abiso-heading"
          className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
        >
          <h2
            id="abiso-heading"
            className="text-xs font-extrabold tracking-[0.14em] text-[var(--accent-teal)] uppercase"
          >
            Abiso sa telepono
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-primary)]">
            I-ON para makatanggap ng mga paalala at abiso — kahit sarado ang
            app.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void toggleNotifications(true)}
              className="ashai-tap-target flex-1 rounded-xl bg-[var(--accent-teal)] px-4 py-3 text-sm font-extrabold tracking-wide text-[var(--accent-teal-ink)] uppercase transition hover:bg-[var(--accent-teal-hover)]"
            >
              I-ON ANG ABISO
            </button>
            <button
              type="button"
              onClick={dismissNotificationPrompt}
              className="ashai-tap-target rounded-xl border border-[var(--border-control)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-card-hover)]"
            >
              Mamaya na
            </button>
          </div>
        </section>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2.5 text-xs">
          <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
            <Bell className="size-4 text-[var(--accent-teal)]" aria-hidden="true" />
            {state.notificationsEnabled
              ? "Abiso sa telepono: Naka-ON"
              : "Abiso sa telepono: Naka-OFF"}
          </span>
          <button
            type="button"
            onClick={() => void toggleNotifications(!state.notificationsEnabled)}
            className="min-h-9 rounded-lg px-2.5 font-semibold text-[var(--accent-teal)] hover:bg-[var(--accent-teal-soft)]"
          >
            {state.notificationsEnabled ? "Turn off" : "I-on ngayon"}
          </button>
        </div>
      )}

      {/* ANG TRABAHO MO · PAGLILINIS */}
      <section
        id="paglilinis"
        aria-labelledby="trabaho-mo-heading"
        className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <h2
            id="trabaho-mo-heading"
            className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
          >
            Ang trabaho mo · Paglilinis
          </h2>
          {state.timedIn && isAssignedToMeToday ? (
            <button
              type="button"
              onClick={() => triggerCleaningReminder430(!show430Notif)}
              className="min-h-8 rounded-lg border border-[var(--border-control)] bg-[var(--bg-card-inner)] px-2.5 py-1 text-[0.7rem] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent-teal)] hover:text-[var(--text-primary)]"
            >
              {show430Notif ? "Itago 4:30 PM preview" : "Preview 4:30 PM Notif"}
            </button>
          ) : null}
        </div>

        {!state.timedIn ? (
          <div className="mt-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Hindi ka pa naka-time in ngayon.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              Mag-time in muna para makita ang task mo ngayong araw.
            </p>
            <Link
              href="/oras"
              className="ashai-tap-target mt-3 inline-flex items-center justify-center rounded-xl bg-[var(--accent-teal)] px-4 py-2 text-xs font-extrabold tracking-wide text-[var(--accent-teal-ink)] uppercase transition hover:bg-[var(--accent-teal-hover)]"
            >
              Pumunta sa Oras para mag-Time In
            </Link>
          </div>
        ) : !isAssignedToMeToday ? (
          <div className="mt-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-4">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Wala kang nakatask na paglilinis ngayong araw.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              Mag-aabiso ang system kapag ikaw na ang nakatask.
            </p>
          </div>
        ) : (
          <div className="mt-3.5 space-y-3.5">
            {/* Post Time-In Assignment Banner */}
            <div className="rounded-xl border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] p-4">
              <p className="text-base font-extrabold text-[var(--text-primary)]">
                Ikaw ang nakatask ngayon sa paglilinis
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                May abiso pagdating ng{" "}
                <strong className="text-[var(--accent-teal)]">4:30 PM</strong>{" "}
                para magsimula at mag-submit ng picture.
              </p>
            </div>

            {/* 4:30 PM Notification + Take Picture Output */}
            {show430Notif ? (
              <div className="space-y-3.5 rounded-xl border border-[var(--border-amber)] bg-[var(--bg-card-inner)] p-4">
                <div
                  role="status"
                  className="flex items-start gap-2.5 rounded-xl border border-[var(--border-amber)] bg-[var(--accent-amber-soft)] p-3"
                >
                  <BellRing
                    className="mt-0.5 size-5 shrink-0 text-[var(--accent-amber)]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[var(--accent-amber)]">
                      4:30 PM — Simulan mo na maglinis
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      Kumuha ng picture ng output pagkatapos maglinis.
                    </p>
                  </div>
                </div>

                {myProofToday ? (
                  <div className="space-y-3 rounded-xl border border-[var(--border-teal)] bg-[var(--bg-card)] p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--accent-teal)]">
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        Tapos na ang paglilinis · Submitted{" "}
                        {myProofToday.completedAtLabel}
                      </span>
                      <button
                        type="button"
                        onClick={clearCleaningProof}
                        className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[var(--border-control)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Palitan
                      </button>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={myProofToday.photoDataUrl}
                      alt="Submitted cleaning output photo"
                      className="max-h-64 w-full rounded-xl border border-[var(--border-subtle)] object-cover"
                    />
                    {myProofToday.note ? (
                      <p className="text-xs text-[var(--text-secondary)]">
                        Tala: {myProofToday.note}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmitCleaningOutput}
                    className="space-y-3"
                  >
                    <p className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
                      Output ng paglilinis (Picture)
                    </p>

                    <label className="ashai-tap-target inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-xs font-extrabold tracking-wide text-[var(--accent-teal-ink)] uppercase transition hover:bg-[var(--accent-teal-hover)]">
                      <Camera className="size-4" aria-hidden="true" />
                      <span>Take a picture</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCleaningPhotoSelect}
                        className="sr-only"
                      />
                    </label>

                    {photoError ? (
                      <p
                        role="alert"
                        className="text-xs font-semibold text-[var(--accent-danger)]"
                      >
                        {photoError}
                      </p>
                    ) : null}

                    {draftPhotoUrl ? (
                      <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="truncate font-semibold text-[var(--text-primary)]">
                            {draftPhotoName}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setDraftPhotoUrl(null);
                              setDraftPhotoName("");
                            }}
                            className="shrink-0 font-semibold text-[var(--accent-danger)] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={draftPhotoUrl}
                          alt="Cleaning output preview"
                          className="max-h-56 w-full rounded-lg border border-[var(--border-subtle)] object-cover"
                        />
                      </div>
                    ) : null}

                    <div>
                      <label
                        htmlFor="cleaning-output-note"
                        className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]"
                      >
                        Maikling tala (opsyonal)
                      </label>
                      <input
                        id="cleaning-output-note"
                        type="text"
                        value={cleaningNote}
                        onChange={(e) => setCleaningNote(e.target.value)}
                        placeholder="Maikling tala..."
                        className="ashai-control"
                      />
                    </div>

                    <button
                      type="submit"
                      className="ashai-tap-target w-full rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
                    >
                      I-submit ang Output ng Paglilinis
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] px-3.5 py-2.5 text-xs text-[var(--text-muted)]">
                <span>
                  Abiso sa paglilinis:{" "}
                  <strong className="text-[var(--text-primary)]">4:30 PM</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ORAS KO Summary Card */}
      <Link
        href="/oras"
        className={`ashai-card block rounded-2xl border bg-[var(--bg-card)] p-4 transition hover:bg-[var(--bg-card-hover)] ${
          state.timedIn
            ? "border-[var(--border-teal)] shadow-[inset_3px_0_0_var(--accent-teal)]"
            : "border-[var(--border-subtle)]"
        }`}
      >
        <p className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
          Oras ko
        </p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-[var(--accent-teal)]">
            {formatHoursMinutes(state.totalLoggedHours)}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            · {state.workdays.length} araw
          </span>
        </div>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          {state.timedIn
            ? `Naka-time in ka ngayon — ${state.activeShiftTrack}.`
            : "Naka-time out ka na. Tap to open Oras & daily reports."}
        </p>
      </Link>

      {/* Quick Tiles Grid (Oras, Request, Chat) */}
      <section aria-label="Quick shortcuts" className="grid grid-cols-2 gap-3">
        <Link
          href="/oras"
          className={`ashai-card rounded-2xl border bg-[var(--bg-card)] p-4 transition hover:bg-[var(--bg-card-hover)] ${
            state.timedIn
              ? "border-t-2 border-t-[var(--accent-teal)] border-x-[var(--border-subtle)] border-b-[var(--border-subtle)]"
              : "border-[var(--border-subtle)]"
          }`}
        >
          <Clock
            className="size-5 text-[var(--accent-teal)]"
            aria-hidden="true"
          />
          <span className="mt-3 block text-base font-bold text-[var(--text-primary)]">
            Oras
          </span>
          <span className="mt-0.5 block text-sm font-medium text-[var(--accent-teal)]">
            {state.timedIn ? "Naka-time in" : "Tap to time in"}
          </span>
        </Link>

        <Link
          href="/request"
          className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 transition hover:bg-[var(--bg-card-hover)]"
        >
          <FilePenLine
            className="size-5 text-[var(--text-secondary)]"
            aria-hidden="true"
          />
          <span className="mt-3 block text-base font-bold text-[var(--text-primary)]">
            Request
          </span>
          <span className="mt-0.5 block text-sm text-[var(--text-muted)]">
            {state.requests.length === 0
              ? "wala pa"
              : `${state.requests.length} pending (demo)`}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="ashai-card col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-left transition hover:bg-[var(--bg-card-hover)] sm:col-span-1"
        >
          <MessageSquare
            className="size-5 text-[var(--text-secondary)]"
            aria-hidden="true"
          />
          <span className="mt-3 block text-base font-bold text-[var(--text-primary)]">
            Chat
          </span>
          <span className="mt-0.5 block text-sm text-[var(--text-muted)]">
            sa opisina
          </span>
        </button>
      </section>

      {/* TRABAHO KO - Labels Card */}
      <section aria-labelledby="trabaho-ko-heading">
        <h2
          id="trabaho-ko-heading"
          className="mb-2.5 text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
        >
          Trabaho ko
        </h2>
        <div className="ashai-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-teal)] bg-[var(--bg-card)] p-4 shadow-[inset_3px_0_0_var(--accent-teal)]">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-card-inner)] text-[var(--accent-teal)]"
            >
              <Sticker className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-[var(--text-primary)]">
                Labels
              </p>
              <p className="text-sm font-medium text-[var(--accent-teal)]">
                {pendingLabelsCount} gawin ngayon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-[var(--bg-pill)] px-3 py-2 text-sm font-bold text-[var(--text-primary)]">
              {pendingLabelsCount}
            </span>
            <button
              type="button"
              onClick={() => setLabelsOpen(true)}
              className="ashai-tap-target rounded-xl bg-[var(--accent-gold-bg)] px-4 py-2 text-sm font-extrabold tracking-wide text-white uppercase transition hover:bg-[var(--accent-gold-hover)]"
            >
              OPEN
            </button>
          </div>
        </div>
      </section>

      {/* Labels Queue Modal */}
      <AccessibleModal
        open={labelsOpen}
        onClose={() => setLabelsOpen(false)}
        titleId="labels-queue-title"
        title="Labels Print Queue"
        subtitle={`${pendingLabelsCount} pending QR stickers · Demo queue`}
      >
        <div className="space-y-3">
          {state.labelJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3.5"
            >
              <div className="min-w-0">
                <p
                  className={`text-sm font-bold ${
                    job.done
                      ? "line-through text-[var(--text-muted)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {job.designName}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {job.sizeSummary} · {job.locationCode}
                </p>
                <p className="mt-1 text-xs font-semibold text-[var(--accent-teal)]">
                  {job.quantity} pcs
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleLabelJob(job.id)}
                aria-pressed={job.done}
                className={`ashai-tap-target shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  job.done
                    ? "border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] text-[var(--accent-teal)]"
                    : "bg-[var(--accent-teal)] text-[var(--accent-teal-ink)] hover:bg-[var(--accent-teal-hover)]"
                }`}
              >
                {job.done ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    Done
                  </span>
                ) : (
                  "Mark done"
                )}
              </button>
            </div>
          ))}
        </div>
      </AccessibleModal>

      {/* Office Chat Demo Modal */}
      <AccessibleModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        titleId="office-chat-title"
        title="Office Chat · Sa Opisina"
        subtitle="Demo preview only — messages stay in this browser tab"
      >
        <div className="space-y-3">
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {demoMessages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[var(--accent-teal)]">
                    {msg.sender}
                  </span>
                  <span className="text-[var(--text-muted)]">{msg.time}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--text-primary)]">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!chatDraft.trim()) return;
              setDemoMessages((prev) => [
                ...prev,
                {
                  id: `msg-${Date.now()}`,
                  sender: `${state.profile.fullName} (Demo)`,
                  text: chatDraft.trim(),
                  time: "Just now",
                },
              ]);
              setChatDraft("");
              announce("Demo chat message added locally.");
            }}
            className="space-y-2.5"
          >
            <label
              htmlFor="demo-chat-input"
              className="block text-xs font-semibold text-[var(--text-secondary)]"
            >
              Quick message (demo only)
            </label>
            <input
              id="demo-chat-input"
              type="text"
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              placeholder="Write an office update..."
              className="ashai-control"
            />
            <button
              type="submit"
              className="ashai-tap-target w-full rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-bold text-[var(--accent-teal-ink)] hover:bg-[var(--accent-teal-hover)]"
            >
              Send demo note
            </button>
          </form>
        </div>
      </AccessibleModal>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 text-sm text-[var(--text-muted)]">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
