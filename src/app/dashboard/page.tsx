"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  FilePenLine,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Sticker,
  UserCheck,
  Users,
} from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { useInternApp } from "@/context/InternAppContext";
import {
  CLEANING_TASKS,
  getAssignedCleaningTask,
  getCompletionKey,
  getInternIndex,
  getWeekDateRangeLabel,
  SAMPLE_INTERN_ACCOUNTS,
  WEEKDAY_FULL_LABELS,
  WEEKDAY_LABELS,
} from "@/data/demoData";
import type { CleaningTask, WeekdayIndex } from "@/types/intern";

function DashboardContent() {
  const {
    state,
    toggleNotifications,
    dismissNotificationPrompt,
    toggleLabelJob,
    switchInternAccount,
    toggleInternAttendance,
    toggleCleaningTaskDone,
    completeAllPresentToday,
    advanceRollingDay,
    announce,
  } = useInternApp();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCleaningTask, setSelectedCleaningTask] =
    useState<CleaningTask | null>(null);
  const [rollError, setRollError] = useState<string | null>(null);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [demoMessages, setDemoMessages] = useState([
    {
      id: "msg-1",
      sender: "Ops Desk (Demo)",
      text: "Reminder: i-mark as done ang assigned paglilinis bago mag-5:00 PM para mag-roll ang schedule bukas.",
      time: "9:15 AM",
    },
  ]);

  const cleaningParam = searchParams.get("cleaning");
  const paramCleaning = cleaningParam
    ? (CLEANING_TASKS.find((item) => item.id === cleaningParam) ?? null)
    : null;
  const activeCleaningModal = selectedCleaningTask ?? paramCleaning;

  const closeCleaningModal = () => {
    setSelectedCleaningTask(null);
    if (cleaningParam) {
      router.replace("/dashboard", { scroll: false });
    }
  };

  const { weekOffset, activeDayIndex, attendanceByIntern, completions } =
    state.cleaningRotation;
  const activeInternIndex = getInternIndex(state.activeInternId);
  const activeDayFullLabel = WEEKDAY_FULL_LABELS[activeDayIndex];
  const weekRangeLabel = getWeekDateRangeLabel(weekOffset);

  const myTodayTask = getAssignedCleaningTask(
    activeInternIndex,
    activeDayIndex,
    weekOffset
  );
  const myTodayCompletion =
    completions[getCompletionKey(weekOffset, activeDayIndex, state.activeInternId)];
  const myAttendanceToday = attendanceByIntern[state.activeInternId] ?? {
    present: true,
    timeInLabel: "8:25 AM",
  };

  const myCompletedCountThisWeek = useMemo(() => {
    let count = 0;
    for (let d = 0; d < 5; d++) {
      if (completions[getCompletionKey(weekOffset, d, state.activeInternId)]) {
        count++;
      }
    }
    return count;
  }, [completions, weekOffset, state.activeInternId]);

  const presentInternsCount = useMemo(
    () =>
      SAMPLE_INTERN_ACCOUNTS.filter(
        (acc) => attendanceByIntern[acc.id]?.present ?? true
      ).length,
    [attendanceByIntern]
  );

  const presentDoneCount = useMemo(
    () =>
      SAMPLE_INTERN_ACCOUNTS.filter((acc) => {
        const isPresent = attendanceByIntern[acc.id]?.present ?? true;
        if (!isPresent) return false;
        return Boolean(
          completions[getCompletionKey(weekOffset, activeDayIndex, acc.id)]
        );
      }).length,
    [attendanceByIntern, completions, weekOffset, activeDayIndex]
  );

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
                Demo account ({SAMPLE_INTERN_ACCOUNTS.length} interns)
              </span>
            </div>
          </div>
        </div>

        {/* Sample 5-Intern Account Switcher */}
        <div className="mt-3.5 border-t border-[var(--border-subtle)] pt-3">
          <p className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase">
            <Users className="size-3.5 text-[var(--accent-teal)]" aria-hidden="true" />
            Sample Intern Accounts (Switch para makita ang bawat isa)
          </p>
          <div
            role="group"
            aria-label="Switch sample intern account"
            className="flex flex-wrap gap-1.5"
          >
            {SAMPLE_INTERN_ACCOUNTS.map((acc) => {
              const isSelected = acc.id === state.activeInternId;
              const firstName = acc.fullName.split(" ")[0];
              return (
                <button
                  key={acc.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    switchInternAccount(acc.id);
                    setRollError(null);
                  }}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition ${
                    isSelected
                      ? "border-[var(--border-teal)] bg-[var(--accent-teal-soft)] text-[var(--accent-teal)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-card-inner)] text-[var(--text-secondary)] hover:border-[var(--border-control)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--bg-pill)] text-[0.65rem] font-extrabold"
                  >
                    {acc.initials}
                  </span>
                  <span>
                    {firstName}
                    {acc.isYou ? " (Ikaw)" : ""}
                  </span>
                </button>
              );
            })}
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

      {/* ANG TRABAHO MO · PAGLILINIS (Replaces factory work tasks with rolling cleaning tasks) */}
      <section
        aria-labelledby="trabaho-mo-heading"
        className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 pt-4 pb-3">
          <div>
            <h2
              id="trabaho-mo-heading"
              className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
            >
              Ang trabaho mo · Paglilinis
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Week {weekOffset + 1} ({weekRangeLabel}) · {activeDayFullLabel}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] px-2.5 py-1 text-[0.7rem] font-bold text-[var(--accent-teal)]">
            <Sparkles className="size-3" aria-hidden="true" />
            {myCompletedCountThisWeek}/5 tapos · Walang doble
          </span>
        </div>

        {/* Highlighted Today's Cleaning Assignment for Active Intern */}
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[0.7rem] font-extrabold tracking-[0.12em] text-[var(--accent-teal)] uppercase">
                Naka-assign sa iyo ngayon ({activeDayFullLabel})
              </p>
              <p className="mt-1 text-lg font-extrabold text-[var(--text-primary)]">
                {myTodayTask.title}
              </p>
              <p className="mt-0.5 text-sm leading-snug text-[var(--text-secondary)]">
                {myTodayTask.description}
              </p>
            </div>
            <button
              type="button"
              aria-pressed={Boolean(myTodayCompletion)}
              disabled={!myAttendanceToday.present}
              onClick={() => {
                toggleCleaningTaskDone(state.activeInternId);
                setRollError(null);
              }}
              className={`ashai-tap-target shrink-0 rounded-xl px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase transition ${
                !myAttendanceToday.present
                  ? "border border-[var(--border-subtle)] bg-[var(--bg-pill)] text-[var(--text-muted)] opacity-60"
                  : myTodayCompletion
                    ? "border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] text-[var(--accent-teal)]"
                    : "bg-[var(--accent-teal)] text-[var(--accent-teal-ink)] hover:bg-[var(--accent-teal-hover)]"
              }`}
            >
              {!myAttendanceToday.present ? (
                "Absent ngayon"
              ) : myTodayCompletion ? (
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Tapos na ({myTodayCompletion.completedAtLabel})
                </span>
              ) : (
                "Markahan na Tapos"
              )}
            </button>
          </div>
          <p className="mt-2.5 text-xs text-[var(--text-muted)]">
            Rule: Bawat intern ay may 1 unique na paglilinis bawat araw — hindi
            mauulit ang natapos na task habang hindi pa natatapos ang buong 5-task
            cycle ng linggo.
          </p>
        </div>

        {/* All 5 Cleaning Tasks List */}
        <ul className="divide-y divide-[var(--border-subtle)]">
          {CLEANING_TASKS.map((task) => {
            // Find which intern is assigned to this task today
            const assignedTodayIntern = SAMPLE_INTERN_ACCOUNTS.find(
              (_, idx) =>
                getAssignedCleaningTask(idx, activeDayIndex, weekOffset).id ===
                task.id
            );
            const assignedTodayDone = assignedTodayIntern
              ? Boolean(
                  completions[
                    getCompletionKey(
                      weekOffset,
                      activeDayIndex,
                      assignedTodayIntern.id
                    )
                  ]
                )
              : false;

            // Find which day this week the ACTIVE intern has this specific task
            const myDayForTask = ([0, 1, 2, 3, 4] as WeekdayIndex[]).find(
              (d) =>
                getAssignedCleaningTask(activeInternIndex, d, weekOffset).id ===
                task.id
            );
            const myTaskDoneRecord =
              myDayForTask !== undefined
                ? completions[
                    getCompletionKey(weekOffset, myDayForTask, state.activeInternId)
                  ]
                : undefined;
            const isMyTaskToday = myTodayTask.id === task.id;

            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => setSelectedCleaningTask(task)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--bg-card-hover)] ${
                    isMyTaskToday ? "bg-[rgba(77,196,178,0.06)]" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-[var(--text-primary)]">
                        {task.title}
                      </span>
                      {isMyTaskToday ? (
                        <span className="rounded-md bg-[var(--accent-teal)] px-2 py-0.5 text-[0.68rem] font-extrabold text-[var(--accent-teal-ink)] uppercase">
                          Ikaw ngayon
                        </span>
                      ) : myTaskDoneRecord && myDayForTask !== undefined ? (
                        <span className="rounded-md border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--accent-teal)]">
                          Tapos mo na ({WEEKDAY_LABELS[myDayForTask]})
                        </span>
                      ) : myDayForTask !== undefined ? (
                        <span className="rounded-md bg-[var(--bg-pill)] px-2 py-0.5 text-[0.68rem] font-medium text-[var(--text-muted)]">
                          Schedule mo: {WEEKDAY_LABELS[myDayForTask]}
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-0.5 block text-sm leading-snug text-[var(--text-muted)]">
                      {task.description}
                    </span>
                    {assignedTodayIntern ? (
                      <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                        Naka-duty ngayon:{" "}
                        <strong className="font-semibold text-[var(--text-primary)]">
                          {assignedTodayIntern.fullName}
                        </strong>{" "}
                        ·{" "}
                        <span
                          className={
                            assignedTodayDone
                              ? "font-semibold text-[var(--accent-success)]"
                              : "text-[var(--accent-amber)]"
                          }
                        >
                          {assignedTodayDone ? "Tapos na" : "Pending"}
                        </span>
                      </span>
                    ) : null}
                  </div>
                  <ChevronRight
                    className="size-5 shrink-0 text-[var(--text-muted)]"
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* AUTOMATIC ROLLING ATTENDANCE & WEEKLY CLEANING SCHEDULE */}
      <section
        aria-labelledby="rolling-attendance-heading"
        className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="rolling-attendance-heading"
              className="flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-[var(--accent-teal)] uppercase"
            >
              <CalendarDays className="size-4" aria-hidden="true" />
              Automatic Rolling Attendance &amp; Schedule
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {activeDayFullLabel} · {presentDoneCount}/{presentInternsCount}{" "}
              present interns ang tapos na sa paglilinis ngayon.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {presentDoneCount < presentInternsCount ? (
              <button
                type="button"
                onClick={() => {
                  completeAllPresentToday();
                  setRollError(null);
                }}
                className="min-h-10 rounded-xl border border-[var(--border-control)] bg-[var(--bg-card-inner)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              >
                Mark all present done
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                const res = advanceRollingDay();
                if (!res.ok && res.reason) {
                  setRollError(res.reason);
                } else {
                  setRollError(null);
                }
              }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[var(--accent-teal)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {activeDayIndex === 4
                ? "Roll sa Next Week"
                : "Roll sa Susunod na Araw"}
            </button>
          </div>
        </div>

        {rollError ? (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--border-amber)] bg-[var(--accent-amber-soft)] p-3 text-xs text-[var(--accent-amber)]"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{rollError}</span>
          </div>
        ) : null}

        {/* Today's Rolling Attendance List (5 Interns) */}
        <div className="mt-4 space-y-2">
          <p className="text-[0.7rem] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase">
            Attendance &amp; Duty Ngayon ({activeDayFullLabel})
          </p>
          {SAMPLE_INTERN_ACCOUNTS.map((intern, internIdx) => {
            const attendance = attendanceByIntern[intern.id] ?? {
              present: true,
              timeInLabel: "8:25 AM",
            };
            const todayTask = getAssignedCleaningTask(
              internIdx,
              activeDayIndex,
              weekOffset
            );
            const doneRecord =
              completions[getCompletionKey(weekOffset, activeDayIndex, intern.id)];
            const isActiveAccount = intern.id === state.activeInternId;

            return (
              <div
                key={intern.id}
                className={`flex flex-wrap items-center justify-between gap-2.5 rounded-xl border p-3 ${
                  isActiveAccount
                    ? "border-[var(--border-teal)] bg-[var(--bg-card-inner)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-card-inner)]/70"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {intern.fullName}
                    </span>
                    {intern.isYou ? (
                      <span className="rounded bg-[var(--bg-pill)] px-1.5 py-0.5 text-[0.65rem] font-bold text-[var(--accent-teal)]">
                        Ikaw
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    Duty: <strong className="text-[var(--text-primary)]">{todayTask.shortLabel}</strong>{" "}
                    {attendance.present && attendance.timeInLabel
                      ? `· Time in ${attendance.timeInLabel}`
                      : "· Marked Absent"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={attendance.present}
                    onClick={() => {
                      toggleInternAttendance(intern.id);
                      setRollError(null);
                    }}
                    className={`inline-flex min-h-9 items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                      attendance.present
                        ? "border-[var(--border-teal)] bg-[var(--accent-teal-soft)] text-[var(--accent-teal)]"
                        : "border-[var(--border-control)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <UserCheck className="size-3.5" aria-hidden="true" />
                    {attendance.present ? "Present" : "Absent"}
                  </button>

                  <button
                    type="button"
                    aria-pressed={Boolean(doneRecord)}
                    disabled={!attendance.present}
                    onClick={() => {
                      toggleCleaningTaskDone(intern.id);
                      setRollError(null);
                    }}
                    className={`min-h-9 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      !attendance.present
                        ? "border border-[var(--border-subtle)] bg-[var(--bg-pill)] text-[var(--text-muted)] opacity-55"
                        : doneRecord
                          ? "border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] text-[var(--accent-teal)]"
                          : "bg-[var(--accent-teal)] text-[var(--accent-teal-ink)] hover:bg-[var(--accent-teal-hover)]"
                    }`}
                  >
                    {doneRecord ? "Tapos ✓" : "Mark Done"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly 5x5 Rolling Matrix (Proves 0 duplicates per week & per day) */}
        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.7rem] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase">
              Weekly Rolling Matrix · Week {weekOffset + 1} ({weekRangeLabel})
            </p>
            <span className="text-[0.7rem] text-[var(--text-muted)]">
              5 interns × 5 tasks · Walang uulit sa buong linggo
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card-inner)] text-[var(--text-muted)]">
                  <th scope="col" className="px-3 py-2.5 font-bold">
                    Intern
                  </th>
                  {WEEKDAY_LABELS.map((dayLabel, dayIdx) => (
                    <th
                      key={dayLabel}
                      scope="col"
                      className={`px-2.5 py-2.5 font-bold ${
                        dayIdx === activeDayIndex
                          ? "bg-[var(--accent-teal-soft)] text-[var(--accent-teal)]"
                          : ""
                      }`}
                    >
                      {dayLabel}
                      {dayIdx === activeDayIndex ? " · Ngayon" : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {SAMPLE_INTERN_ACCOUNTS.map((intern, internIdx) => {
                  const isMe = intern.id === state.activeInternId;
                  return (
                    <tr
                      key={intern.id}
                      className={isMe ? "bg-[rgba(77,196,178,0.05)]" : ""}
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-3 py-2.5 font-semibold text-[var(--text-primary)]"
                      >
                        {intern.fullName.split(" ")[0]}
                        {intern.isYou ? " (Ikaw)" : ""}
                      </th>
                      {([0, 1, 2, 3, 4] as WeekdayIndex[]).map((dayIdx) => {
                        const assigned = getAssignedCleaningTask(
                          internIdx,
                          dayIdx,
                          weekOffset
                        );
                        const done = Boolean(
                          completions[getCompletionKey(weekOffset, dayIdx, intern.id)]
                        );
                        const isToday = dayIdx === activeDayIndex;
                        return (
                          <td
                            key={dayIdx}
                            className={`px-2.5 py-2.5 ${
                              isToday ? "bg-[rgba(77,196,178,0.08)]" : ""
                            }`}
                          >
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                                done
                                  ? "border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] text-[var(--accent-teal)]"
                                  : isToday
                                    ? "bg-[var(--bg-pill)] font-bold text-[var(--text-primary)]"
                                    : "text-[var(--text-muted)]"
                              }`}
                            >
                              {done ? "✓ " : ""}
                              {assigned.shortLabel}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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

      {/* Cleaning Task Details & Weekly Rotation Modal */}
      <AccessibleModal
        open={activeCleaningModal !== null}
        onClose={closeCleaningModal}
        titleId="cleaning-task-title"
        title={activeCleaningModal?.title ?? ""}
        subtitle={`${activeCleaningModal?.areaLabel ?? ""} · Paglilinis checklist`}
      >
        {activeCleaningModal ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {activeCleaningModal.description}
            </p>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3.5">
              <p className="text-xs font-bold tracking-wider text-[var(--accent-teal)] uppercase">
                Mga hakbang sa paglilinis
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-[var(--text-primary)]">
                {activeCleaningModal.checklist.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3.5">
              <p className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Rotation ngayong linggo (Week {weekOffset + 1})
              </p>
              <ul className="mt-2 space-y-1.5 text-xs">
                {([0, 1, 2, 3, 4] as WeekdayIndex[]).map((dayIdx) => {
                  const internForDay = SAMPLE_INTERN_ACCOUNTS.find(
                    (_, idx) =>
                      getAssignedCleaningTask(idx, dayIdx, weekOffset).id ===
                      activeCleaningModal.id
                  );
                  const isDone = internForDay
                    ? Boolean(
                        completions[
                          getCompletionKey(weekOffset, dayIdx, internForDay.id)
                        ]
                      )
                    : false;
                  return (
                    <li
                      key={dayIdx}
                      className="flex items-center justify-between gap-2 text-[var(--text-secondary)]"
                    >
                      <span className="font-semibold text-[var(--text-primary)]">
                        {WEEKDAY_FULL_LABELS[dayIdx]}
                        {dayIdx === activeDayIndex ? " (Ngayon)" : ""}
                      </span>
                      <span>
                        {internForDay?.fullName ?? "—"}{" "}
                        {isDone ? (
                          <span className="font-semibold text-[var(--accent-teal)]">
                            · ✓ Tapos
                          </span>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <button
              type="button"
              onClick={closeCleaningModal}
              className="ashai-tap-target w-full rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-bold text-[var(--accent-teal-ink)] hover:bg-[var(--accent-teal-hover)]"
            >
              Isara
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
