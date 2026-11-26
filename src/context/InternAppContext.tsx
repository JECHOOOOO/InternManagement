"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  CLEANERS_PER_DAY,
  createInitialStateForAccount,
  DEMO_ACCOUNTS,
  getTodayIsoDate,
  INITIAL_CLEANING_DUTY,
  INITIAL_CLEANING_ROSTER,
  INITIAL_DEMO_STATE,
  SAMPLE_DEMO_LEADS,
} from "@/data/demoData";
import type {
  ClientLead,
  DemoAppState,
  InternRequestItem,
  LeadStatus,
  SharedCleaningRosterState,
  WorkAreaOption,
} from "@/types/intern";

const SESSION_KEY = "ashai-intern-session-v7";
const ACCOUNT_KEY_PREFIX = "ashai-intern-account-v7:";
const ROSTER_KEY = "ashai-intern-cleaning-roster-v7";
const THEME_KEY = "ashai-theme-v1";

export type AppTheme = "dark" | "light";

const themeListeners = new Set<() => void>();
let cachedTheme: AppTheme | null = null;

function readThemeSnapshot(): AppTheme {
  if (typeof window === "undefined") return "dark";
  if (cachedTheme !== null) return cachedTheme;
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    cachedTheme = saved === "light" ? "light" : "dark";
  } catch {
    cachedTheme = "dark";
  }
  return cachedTheme;
}

function getServerThemeSnapshot(): AppTheme {
  return "dark";
}

function subscribeTheme(listener: () => void): () => void {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function setThemeStore(next: AppTheme) {
  cachedTheme = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Ignore storage errors
    }
    document.documentElement.dataset.theme = next;
  }
  for (const listener of themeListeners) {
    listener();
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();
let clientCachedState: DemoAppState | null = null;

/**
 * Checks whether an intern who just timed in (with a photo) should be added to today's
 * cleaning group (up to CLEANERS_PER_DAY = 3 per day), strictly enforcing 1-1-1 before 2-2-2:
 * - Computes the minimum cleaning count across all interns.
 * - Only assigns the intern if their count equals minCount and fewer than 3 cleaners are assigned today.
 */
function assignOnTimeInIfEligible(
  roster: SharedCleaningRosterState,
  accountId: string
): SharedCleaningRosterState {
  const timedInTodayAccountIds = roster.timedInTodayAccountIds.includes(accountId)
    ? roster.timedInTodayAccountIds
    : [...roster.timedInTodayAccountIds, accountId];

  if (
    roster.assignedAccountIds.includes(accountId) ||
    roster.assignedAccountIds.length >= CLEANERS_PER_DAY
  ) {
    return {
      ...roster,
      timedInTodayAccountIds,
    };
  }

  const counts = DEMO_ACCOUNTS.map(
    (acc) => roster.totalCleaningsByAccount[acc.id] ?? 0
  );
  const minCount = Math.min(...counts);
  const myCount = roster.totalCleaningsByAccount[accountId] ?? 0;

  if (myCount === minCount) {
    return {
      ...roster,
      timedInTodayAccountIds,
      assignedAccountIds: [...roster.assignedAccountIds, accountId],
    };
  }

  return {
    ...roster,
    timedInTodayAccountIds,
  };
}

function areAllAssignedDone(roster: SharedCleaningRosterState): boolean {
  return (
    roster.assignedAccountIds.length > 0 &&
    roster.assignedAccountIds.every((id) =>
      Boolean(roster.completedTodayByAccount[id])
    )
  );
}

function normalizeRoster(
  parsed?: Partial<SharedCleaningRosterState>
): SharedCleaningRosterState {
  const todayIso = getTodayIsoDate();
  const baseCounts: Record<string, number> = {
    ...INITIAL_CLEANING_ROSTER.totalCleaningsByAccount,
  };
  const base: SharedCleaningRosterState = {
    dayNumber: INITIAL_CLEANING_ROSTER.dayNumber,
    lastCalendarDate: todayIso,
    timedInTodayAccountIds: [...INITIAL_CLEANING_ROSTER.timedInTodayAccountIds],
    assignedAccountIds: [...INITIAL_CLEANING_ROSTER.assignedAccountIds],
    completedTodayByAccount: {},
    totalCleaningsByAccount: baseCounts,
  };
  if (!parsed) return base;

  const validCounts: Record<string, number> = { ...baseCounts };
  if (parsed.totalCleaningsByAccount) {
    for (const acc of DEMO_ACCOUNTS) {
      const val = parsed.totalCleaningsByAccount[acc.id];
      if (typeof val === "number" && val >= 0) {
        validCounts[acc.id] = val;
      }
    }
  }

  const validTimedIn = Array.isArray(parsed.timedInTodayAccountIds)
    ? parsed.timedInTodayAccountIds.filter((id) =>
        DEMO_ACCOUNTS.some((acc) => acc.id === id)
      )
    : [];

  const validAssigned = Array.isArray(parsed.assignedAccountIds)
    ? parsed.assignedAccountIds.filter((id) =>
        DEMO_ACCOUNTS.some((acc) => acc.id === id)
      )
    : [];

  const merged: SharedCleaningRosterState = {
    dayNumber:
      typeof parsed.dayNumber === "number" ? parsed.dayNumber : base.dayNumber,
    lastCalendarDate:
      typeof parsed.lastCalendarDate === "string"
        ? parsed.lastCalendarDate
        : todayIso,
    timedInTodayAccountIds: validTimedIn,
    assignedAccountIds: validAssigned,
    completedTodayByAccount:
      parsed.completedTodayByAccount &&
      typeof parsed.completedTodayByAccount === "object"
        ? parsed.completedTodayByAccount
        : {},
    totalCleaningsByAccount: validCounts,
  };

  // Automatic real-day roll ONLY if all assigned interns for yesterday completed cleaning (or none assigned)
  if (merged.lastCalendarDate !== todayIso) {
    if (merged.assignedAccountIds.length === 0 || areAllAssignedDone(merged)) {
      return {
        ...merged,
        dayNumber: merged.dayNumber + 1,
        lastCalendarDate: todayIso,
        timedInTodayAccountIds: [],
        assignedAccountIds: [],
        completedTodayByAccount: {},
      };
    }
    // Keep unfinished interns assigned until they complete their cleaning
    return {
      ...merged,
      lastCalendarDate: todayIso,
    };
  }

  return merged;
}

function readSharedRoster(): SharedCleaningRosterState {
  if (typeof window === "undefined") return INITIAL_CLEANING_ROSTER;
  try {
    const raw = window.localStorage.getItem(ROSTER_KEY);
    const roster = raw
      ? normalizeRoster(JSON.parse(raw) as Partial<SharedCleaningRosterState>)
      : normalizeRoster();
    return roster;
  } catch {
    return normalizeRoster();
  }
}

function findAccountById(accountId: string | null | undefined) {
  return DEMO_ACCOUNTS.find((acc) => acc.id === accountId) ?? DEMO_ACCOUNTS[0];
}

function mergeAccountState(
  accountId: string,
  parsed: Partial<DemoAppState>,
  signedIn: boolean
): DemoAppState {
  const account = findAccountById(accountId);
  const base = createInitialStateForAccount(account, signedIn);
  return {
    ...base,
    ...parsed,
    signedIn,
    accountId: account.id,
    username: account.username,
    profile: {
      ...base.profile,
      ...(parsed.profile ?? {}),
      targetHours: base.profile.targetHours,
    },
    cleaningDuty: {
      ...INITIAL_CLEANING_DUTY,
      ...(parsed.cleaningDuty ?? {}),
    },
    cleaningRoster: readSharedRoster(),
    workdays:
      Array.isArray(parsed.workdays) && parsed.workdays.length > 0
        ? parsed.workdays
        : base.workdays,
    requests: Array.isArray(parsed.requests) ? parsed.requests : base.requests,
    leads: Array.isArray(parsed.leads) ? parsed.leads : base.leads,
    labelJobs:
      Array.isArray(parsed.labelJobs) && parsed.labelJobs.length > 0
        ? parsed.labelJobs
        : base.labelJobs,
  };
}

function readAccountFromStorage(accountId: string, signedIn: boolean): DemoAppState {
  const account = findAccountById(accountId);
  if (typeof window === "undefined") {
    return createInitialStateForAccount(account, signedIn);
  }
  try {
    const raw = window.localStorage.getItem(`${ACCOUNT_KEY_PREFIX}${account.id}`);
    return raw
      ? mergeAccountState(account.id, JSON.parse(raw) as Partial<DemoAppState>, signedIn)
      : {
          ...createInitialStateForAccount(account, signedIn),
          cleaningRoster: readSharedRoster(),
        };
  } catch {
    return {
      ...createInitialStateForAccount(account, signedIn),
      cleaningRoster: readSharedRoster(),
    };
  }
}

function readSnapshot(): DemoAppState {
  if (typeof window === "undefined") return INITIAL_DEMO_STATE;
  if (clientCachedState !== null) return clientCachedState;

  try {
    const activeAccountId = window.localStorage.getItem(SESSION_KEY);
    if (!activeAccountId) {
      clientCachedState = {
        ...INITIAL_DEMO_STATE,
        cleaningRoster: readSharedRoster(),
      };
      return clientCachedState;
    }
    const account = DEMO_ACCOUNTS.find((acc) => acc.id === activeAccountId);
    if (!account) {
      clientCachedState = {
        ...INITIAL_DEMO_STATE,
        cleaningRoster: readSharedRoster(),
      };
      return clientCachedState;
    }
    clientCachedState = readAccountFromStorage(account.id, true);
  } catch {
    clientCachedState = INITIAL_DEMO_STATE;
  }
  return clientCachedState;
}

function getServerSnapshot(): DemoAppState {
  return INITIAL_DEMO_STATE;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === SESSION_KEY ||
      e.key === ROSTER_KEY ||
      (e.key && e.key.startsWith(ACCOUNT_KEY_PREFIX))
    ) {
      clientCachedState = null;
      listener();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function emitChange(next: DemoAppState) {
  clientCachedState = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        ROSTER_KEY,
        JSON.stringify(next.cleaningRoster)
      );
      if (next.signedIn) {
        window.localStorage.setItem(SESSION_KEY, next.accountId);
        window.localStorage.setItem(
          `${ACCOUNT_KEY_PREFIX}${next.accountId}`,
          JSON.stringify(next)
        );
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }
  for (const listener of listeners) {
    listener();
  }
}

function updateStore(updater: (prev: DemoAppState) => DemoAppState) {
  const next = updater(readSnapshot());
  emitChange(next);
}

interface InternAppContextValue {
  state: DemoAppState;
  theme: AppTheme;
  setTheme: (next: AppTheme) => void;
  toggleTheme: () => void;
  liveMessage: string;
  announce: (msg: string) => void;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  dismissNotificationPrompt: () => void;
  toggleTimeInOut: (trackName?: string, timeInPhotoDataUrl?: string) => void;
  saveWorkdayAccomplishment: (
    dayId: string,
    workArea: WorkAreaOption,
    accomplishment: string
  ) => void;
  addRequest: (
    item: Omit<InternRequestItem, "id" | "status" | "createdAtLabel">
  ) => void;
  removeRequest: (id: string) => void;
  addLead: (lead: Omit<ClientLead, "id" | "createdAtLabel">) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  updateLeadNotes: (id: string, notes: string) => void;
  removeLead: (id: string) => void;
  loadSampleLeads: () => void;
  toggleLabelJob: (id: string) => void;
  triggerCleaningReminder430: (active: boolean) => void;
  submitCleaningProof: (
    photoDataUrl: string,
    photoFileName: string,
    note: string
  ) => void;
  clearCleaningProof: () => void;
  advanceCleaningDay: () => { ok: boolean; reason?: string };
  updateAvatarDataUrl: (dataUrl: string | undefined) => void;
  signInWithCredentials: (
    username: string,
    password: string
  ) => { ok: boolean; error?: string };
  signOut: () => void;
  signInDemo: () => void;
  resetDemoData: () => void;
}

const InternAppContext = createContext<InternAppContextValue | null>(null);

function formatCurrentTimeLabel(): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export function InternAppProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
  const theme = useSyncExternalStore(
    subscribeTheme,
    readThemeSnapshot,
    getServerThemeSnapshot
  );
  const [liveMessage, setLiveMessage] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeStore(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: AppTheme = readThemeSnapshot() === "dark" ? "light" : "dark";
    setThemeStore(next);
  }, []);

  const announce = useCallback((msg: string) => {
    setLiveMessage("");
    window.setTimeout(() => {
      setLiveMessage(msg);
    }, 40);
  }, []);

  const toggleNotifications = useCallback(
    async (enabled: boolean) => {
      if (
        enabled &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        try {
          await Notification.requestPermission();
        } catch {
          // Demo continues even if browser blocks or ignores notification prompt
        }
      }
      updateStore((prev) => ({
        ...prev,
        notificationsEnabled: enabled,
        notificationPromptDismissed: true,
      }));
      announce(
        enabled
          ? "Phone notifications enabled in demo mode."
          : "Phone notifications turned off in demo mode."
      );
    },
    [announce]
  );

  const dismissNotificationPrompt = useCallback(() => {
    updateStore((prev) => ({
      ...prev,
      notificationPromptDismissed: true,
    }));
    announce("Reminder snoozed for now.");
  }, [announce]);

  const toggleTimeInOut = useCallback(
    (trackName?: string, timeInPhotoDataUrl?: string) => {
      const nowLabel = formatCurrentTimeLabel();
      let wasTimedIn = false;
      updateStore((prev) => {
        wasTimedIn = prev.timedIn;
        if (prev.timedIn) {
          const updatedDays = prev.workdays.map((day, idx) =>
            idx === 0
              ? {
                ...day,
                isCurrentShift: false,
                timeRangeLabel: `${prev.activeShiftStartLabel} – ${nowLabel}`,
                hoursWorked: day.hoursWorked ?? 1.25,
              }
              : day
          );
          return {
            ...prev,
            timedIn: false,
            totalLoggedHours: Number((prev.totalLoggedHours + 1.25).toFixed(2)),
            workdays: updatedDays,
          };
        }

        const nextTrack = trackName?.trim() || prev.activeShiftTrack;
        const updatedDays = prev.workdays.map((day, idx) =>
          idx === 0
            ? {
              ...day,
              taskTitle: nextTrack,
              isCurrentShift: true,
              timeRangeLabel: `${nowLabel} – bukas pa`,
              hoursWorked: null,
            }
            : day
        );
        const updatedRoster = assignOnTimeInIfEligible(
          prev.cleaningRoster,
          prev.accountId
        );
        return {
          ...prev,
          timedIn: true,
          timeInPhotoDataUrl: timeInPhotoDataUrl ?? prev.timeInPhotoDataUrl,
          activeShiftStartLabel: nowLabel,
          activeShiftTrack: nextTrack,
          workdays: updatedDays,
          cleaningRoster: updatedRoster,
        };
      });
      announce(
        wasTimedIn
          ? `Timed out at ${nowLabel} (demo).`
          : `Timed in at ${nowLabel} (demo).`
      );
    },
    [announce]
  );

  const saveWorkdayAccomplishment = useCallback(
    (dayId: string, workArea: WorkAreaOption, accomplishment: string) => {
      const savedAtLabel = formatCurrentTimeLabel();
      updateStore((prev) => ({
        ...prev,
        workdays: prev.workdays.map((day) =>
          day.id === dayId
            ? {
              ...day,
              workArea,
              accomplishment: accomplishment.trim(),
              savedAtLabel,
            }
            : day
        ),
      }));
      announce("Daily accomplishment saved.");
    },
    [announce]
  );

  const addRequest = useCallback(
    (item: Omit<InternRequestItem, "id" | "status" | "createdAtLabel">) => {
      const created: InternRequestItem = {
        ...item,
        id: `req-${Date.now()}`,
        status: "Pending (demo)",
        createdAtLabel: `Sent ${formatCurrentTimeLabel()}`,
      };
      updateStore((prev) => ({
        ...prev,
        requests: [created, ...prev.requests],
      }));
      announce(`${item.category} request saved in demo list.`);
    },
    [announce]
  );

  const removeRequest = useCallback(
    (id: string) => {
      updateStore((prev) => ({
        ...prev,
        requests: prev.requests.filter((r) => r.id !== id),
      }));
      announce("Request removed from demo list.");
    },
    [announce]
  );

  const addLead = useCallback(
    (lead: Omit<ClientLead, "id" | "createdAtLabel">) => {
      const created: ClientLead = {
        ...lead,
        id: `lead-${Date.now()}`,
        createdAtLabel: `Added ${formatCurrentTimeLabel()}`,
      };
      updateStore((prev) => ({
        ...prev,
        leads: [created, ...prev.leads],
      }));
      announce(`Lead "${lead.businessName}" added.`);
    },
    [announce]
  );

  const updateLeadStatus = useCallback(
    (id: string, status: LeadStatus) => {
      updateStore((prev) => ({
        ...prev,
        leads: prev.leads.map((l) => (l.id === id ? { ...l, status } : l)),
      }));
      announce(`Lead status updated to ${status}.`);
    },
    [announce]
  );

  const updateLeadNotes = useCallback(
    (id: string, notes: string) => {
      updateStore((prev) => ({
        ...prev,
        leads: prev.leads.map((l) => (l.id === id ? { ...l, notes } : l)),
      }));
      announce("Lead notes updated.");
    },
    [announce]
  );

  const removeLead = useCallback(
    (id: string) => {
      updateStore((prev) => ({
        ...prev,
        leads: prev.leads.filter((l) => l.id !== id),
      }));
      announce("Lead removed.");
    },
    [announce]
  );

  const loadSampleLeads = useCallback(() => {
    updateStore((prev) => {
      const existingIds = new Set(prev.leads.map((l) => l.id));
      const newSamples = SAMPLE_DEMO_LEADS.filter((s) => !existingIds.has(s.id));
      return {
        ...prev,
        leads: [...newSamples, ...prev.leads],
      };
    });
    announce("Sample demo leads loaded.");
  }, [announce]);

  const toggleLabelJob = useCallback(
    (id: string) => {
      updateStore((prev) => ({
        ...prev,
        labelJobs: prev.labelJobs.map((job) =>
          job.id === id ? { ...job, done: !job.done } : job
        ),
      }));
      announce("Updated label queue item.");
    },
    [announce]
  );

  const triggerCleaningReminder430 = useCallback(
    (active: boolean) => {
      updateStore((prev) => ({
        ...prev,
        cleaningDuty: {
          ...prev.cleaningDuty,
          reminderTriggeredAt430: active,
        },
      }));
      if (active) {
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification("4:30 PM — Simulan mo na maglinis", {
              body: "Kumuha ng picture ng output ng paglilinis sa Ashai.",
            });
          } catch {
            // Ignore browser notification errors
          }
        }
        announce("4:30 PM Notif: Simulan mo na maglinis!");
      } else {
        announce("4:30 PM reminder preview closed.");
      }
    },
    [announce]
  );

  const submitCleaningProof = useCallback(
    (photoDataUrl: string, photoFileName: string, note: string) => {
      const submittedAtLabel = formatCurrentTimeLabel();
      updateStore((prev) => {
        if (!prev.cleaningRoster.assignedAccountIds.includes(prev.accountId)) {
          return prev;
        }
        const alreadyDoneToday = Boolean(
          prev.cleaningRoster.completedTodayByAccount[prev.accountId]
        );
        const prevCount =
          prev.cleaningRoster.totalCleaningsByAccount[prev.accountId] ?? 0;

        return {
          ...prev,
          cleaningDuty: {
            ...prev.cleaningDuty,
            reminderTriggeredAt430: true,
          },
          cleaningRoster: {
            ...prev.cleaningRoster,
            completedTodayByAccount: {
              ...prev.cleaningRoster.completedTodayByAccount,
              [prev.accountId]: {
                completedAtLabel: submittedAtLabel,
                photoDataUrl,
                photoFileName,
                note: note.trim(),
              },
            },
            totalCleaningsByAccount: {
              ...prev.cleaningRoster.totalCleaningsByAccount,
              [prev.accountId]: alreadyDoneToday ? prevCount : prevCount + 1,
            },
          },
        };
      });
      announce(`Output ng paglilinis na-submit (${submittedAtLabel}).`);
    },
    [announce]
  );

  const clearCleaningProof = useCallback(() => {
    updateStore((prev) => {
      if (!prev.cleaningRoster.assignedAccountIds.includes(prev.accountId)) {
        return prev;
      }
      const wasDone = Boolean(
        prev.cleaningRoster.completedTodayByAccount[prev.accountId]
      );
      const nextCompleted = { ...prev.cleaningRoster.completedTodayByAccount };
      delete nextCompleted[prev.accountId];
      const prevCount =
        prev.cleaningRoster.totalCleaningsByAccount[prev.accountId] ?? 0;

      return {
        ...prev,
        cleaningRoster: {
          ...prev.cleaningRoster,
          completedTodayByAccount: nextCompleted,
          totalCleaningsByAccount: {
            ...prev.cleaningRoster.totalCleaningsByAccount,
            [prev.accountId]: wasDone ? Math.max(0, prevCount - 1) : prevCount,
          },
        },
      };
    });
    announce("Na-clear ang picture ng paglilinis.");
  }, [announce]);

  const advanceCleaningDay = useCallback((): { ok: boolean; reason?: string } => {
    const current = readSnapshot();
    const roster = current.cleaningRoster;
    if (roster.assignedAccountIds.length > 0 && !areAllAssignedDone(roster)) {
      const reason =
        "Hindi pa pwedeng umusad — hindi pa tapos ang lahat ng nakatask sa paglilinis ngayong araw.";
      announce(reason);
      return { ok: false, reason };
    }

    updateStore((prev) => ({
      ...prev,
      timedIn: false,
      timeInPhotoDataUrl: undefined,
      cleaningDuty: {
        reminderTriggeredAt430: false,
      },
      cleaningRoster: {
        ...prev.cleaningRoster,
        dayNumber: prev.cleaningRoster.dayNumber + 1,
        timedInTodayAccountIds: [],
        assignedAccountIds: [],
        completedTodayByAccount: {},
      },
    }));

    announce("Bagong araw na — mag-time in at kumuha ng picture para sa rolling attendance.");
    return { ok: true };
  }, [announce]);

  const updateAvatarDataUrl = useCallback(
    (dataUrl: string | undefined) => {
      updateStore((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatarDataUrl: dataUrl,
        },
      }));
      announce(
        dataUrl ? "Profile photo preview updated." : "Profile photo cleared."
      );
    },
    [announce]
  );

  const signInWithCredentials = useCallback(
    (username: string, password: string): { ok: boolean; error?: string } => {
      const normalized = username.trim().toLowerCase();
      const matched = DEMO_ACCOUNTS.find(
        (acc) => acc.username.toLowerCase() === normalized && acc.password === password
      );
      if (!matched) {
        return {
          ok: false,
          error: "Mali ang username o password. I-check ang account na binigay ng admin.",
        };
      }
      const nextState = readAccountFromStorage(matched.id, true);
      emitChange(nextState);
      announce(`Signed in as ${matched.profile.fullName}.`);
      return { ok: true };
    },
    [announce]
  );

  const signOut = useCallback(() => {
    const current = readSnapshot();
    if (typeof window !== "undefined" && current.signedIn) {
      try {
        window.localStorage.setItem(
          `${ACCOUNT_KEY_PREFIX}${current.accountId}`,
          JSON.stringify(current)
        );
      } catch {
        // Ignore storage errors
      }
    }
    emitChange({ ...current, signedIn: false });
    announce("Signed out.");
  }, [announce]);

  const signInDemo = useCallback(() => {
    const nextState = readAccountFromStorage(DEMO_ACCOUNTS[0].id, true);
    emitChange(nextState);
    announce(`Signed in as ${DEMO_ACCOUNTS[0].profile.fullName}.`);
  }, [announce]);

  const resetDemoData = useCallback(() => {
    const current = readSnapshot();
    const account = findAccountById(current.accountId);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(`${ACCOUNT_KEY_PREFIX}${account.id}`);
        window.localStorage.removeItem(ROSTER_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    const fresh = createInitialStateForAccount(account, current.signedIn);
    emitChange(fresh);
    announce("Demo data reset to initial state.");
  }, [announce]);

  const value = useMemo<InternAppContextValue>(
    () => ({
      state,
      theme,
      setTheme,
      toggleTheme,
      liveMessage,
      announce,
      toggleNotifications,
      dismissNotificationPrompt,
      toggleTimeInOut,
      saveWorkdayAccomplishment,
      addRequest,
      removeRequest,
      addLead,
      updateLeadStatus,
      updateLeadNotes,
      removeLead,
      loadSampleLeads,
      toggleLabelJob,
      triggerCleaningReminder430,
      submitCleaningProof,
      clearCleaningProof,
      advanceCleaningDay,
      updateAvatarDataUrl,
      signInWithCredentials,
      signOut,
      signInDemo,
      resetDemoData,
    }),
    [
      state,
      theme,
      setTheme,
      toggleTheme,
      liveMessage,
      announce,
      toggleNotifications,
      dismissNotificationPrompt,
      toggleTimeInOut,
      saveWorkdayAccomplishment,
      addRequest,
      removeRequest,
      addLead,
      updateLeadStatus,
      updateLeadNotes,
      removeLead,
      loadSampleLeads,
      toggleLabelJob,
      triggerCleaningReminder430,
      submitCleaningProof,
      clearCleaningProof,
      advanceCleaningDay,
      updateAvatarDataUrl,
      signInWithCredentials,
      signOut,
      signInDemo,
      resetDemoData,
    ]
  );

  return (
    <InternAppContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="visually-hidden">
        {liveMessage}
      </div>
    </InternAppContext.Provider>
  );
}

export function useInternApp(): InternAppContextValue {
  const ctx = useContext(InternAppContext);
  if (!ctx) {
    throw new Error("useInternApp must be used inside InternAppProvider");
  }
  return ctx;
}
