"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  FilePenLine,
  MessageSquare,
  Sticker,
} from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { useInternApp } from "@/context/InternAppContext";
import { INITIAL_ASSIGNED_WORK } from "@/data/demoData";
import type { AssignedWorkLink } from "@/types/intern";

function DashboardContent() {
  const {
    state,
    toggleNotifications,
    dismissNotificationPrompt,
    toggleLabelJob,
    announce,
  } = useInternApp();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTool, setSelectedTool] = useState<AssignedWorkLink | null>(null);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [demoMessages, setDemoMessages] = useState([
    {
      id: "msg-1",
      sender: "Ops Desk (Demo)",
      text: "Reminder: i-double check ang sticker counts sa Prep Table 1 bago mag-4:30 PM.",
      time: "9:15 AM",
    },
  ]);

  const toolParam = searchParams.get("tool");
  const paramTool = toolParam
    ? (INITIAL_ASSIGNED_WORK.find((item) => item.id === toolParam) ?? null)
    : null;
  const activeTool = selectedTool ?? paramTool;

  const closeToolModal = () => {
    setSelectedTool(null);
    if (toolParam) {
      router.replace("/dashboard", { scroll: false });
    }
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
      {/* Greeting Card (fixes name ellipsis truncation seen in ea63106a) */}
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
            I-ON para tumunog ang telepono tuwing umaga kapag may lipas na o
            malapit nang mag-expire (fire extinguisher, pintura) — kahit sarado
            ang app.
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
              ? "Morning expiry alerts: Naka-ON (demo)"
              : "Morning expiry alerts: Snoozed (demo)"}
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

      {/* ANG TRABAHO MO (Assigned work links) */}
      <section
        aria-labelledby="trabaho-mo-heading"
        className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
      >
        <div className="border-b border-[var(--border-subtle)] px-4 pt-4 pb-2.5">
          <h2
            id="trabaho-mo-heading"
            className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
          >
            Ang trabaho mo
          </h2>
        </div>
        <ul className="divide-y divide-[var(--border-subtle)]">
          {INITIAL_ASSIGNED_WORK.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedTool(item)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--bg-card-hover)]"
              >
                <div className="min-w-0">
                  <span className="block text-base font-bold text-[var(--text-primary)]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-[var(--text-muted)]">
                    {item.description}
                  </span>
                </div>
                <ChevronRight
                  className="size-5 shrink-0 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
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
            {state.totalLoggedHours.toFixed(2)}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            oras · {state.workdays.length} araw
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

      {/* Assigned Tool Preview Modal */}
      <AccessibleModal
        open={activeTool !== null}
        onClose={closeToolModal}
        titleId="assigned-tool-title"
        title={activeTool?.title ?? ""}
        subtitle={`${activeTool?.category ?? ""} · Demo tool preview`}
      >
        {activeTool ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {activeTool.demoSummary}
            </p>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3.5">
              <p className="text-xs font-bold tracking-wider text-[var(--accent-teal)] uppercase">
                Workflow steps (demo)
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-[var(--text-primary)]">
                {activeTool.demoChecklist.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={closeToolModal}
              className="ashai-tap-target w-full rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-bold text-[var(--accent-teal-ink)] hover:bg-[var(--accent-teal-hover)]"
            >
              Close preview
            </button>
          </div>
        ) : null}
      </AccessibleModal>

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
