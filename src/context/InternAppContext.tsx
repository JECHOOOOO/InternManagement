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
  createInitialStateForAccount,
  DEMO_ACCOUNTS,
  INITIAL_DEMO_STATE,
  SAMPLE_DEMO_LEADS,
} from "@/data/demoData";
import {
  areAllAssignedDone,
  assignOnTimeInIfEligible,
  recordCleaningProof,
  removeCleaningProof,
  rollRosterToNextDay,
} from "@/lib/cleaningRoster";
import {
  clearAccountAndRosterStorage,
  findAccountById,
  isManagedStorageKey,
  persistAccountBeforeSignOut,
  readAccountState,
  readActiveSessionState,
  readThemePreference,
  writeAppState,
  writeThemePreference,
  type AppTheme,
} from "@/lib/storageAdapter";
import type {
  ClientLead,
  DemoAppState,
  InternRequestItem,
  LeadStatus,
  WorkAreaOption,
} from "@/types/intern";

export type { AppTheme };

type Listener = () => void;

const listeners = new Set<Listener>();
let clientCachedState: DemoAppState | null = null;

const themeListeners = new Set<Listener>();
let cachedTheme: AppTheme | null = null;

function readThemeSnapshot(): AppTheme {
  if (typeof window === "undefined") return "dark";
  if (cachedTheme !== null) return cachedTheme;
  cachedTheme = readThemePreference();
  return cachedTheme;
}

function getServerThemeSnapshot(): AppTheme {
  return "dark";
}

function subscribeTheme(listener: Listener): () => void {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function setThemeStore(next: AppTheme) {
  cachedTheme = next;
  writeThemePreference(next);
  for (const listener of themeListeners) {
    listener();
  }
}

function readSnapshot(): DemoAppState {
  if (typeof window === "undefined") return INITIAL_DEMO_STATE;
  if (clientCachedState !== null) return clientCachedState;
  clientCachedState = readActiveSessionState();
  return clientCachedState;
}

function getServerSnapshot(): DemoAppState {
  return INITIAL_DEMO_STATE;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const handleStorage = (e: StorageEvent) => {
    if (isManagedStorageKey(e.key)) {
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
  writeAppState(next);
  for (const listener of listeners) {
    listener();
  }
}

function updateStore(updater: (prev: DemoAppState) => DemoAppState) {
  emitChange(updater(readSnapshot()));
}

function formatCurrentTimeLabel(): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
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
          // Demo continues even if browser blocks notification prompt
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
        return {
          ...prev,
          timedIn: true,
          timeInPhotoDataUrl: timeInPhotoDataUrl ?? prev.timeInPhotoDataUrl,
          activeShiftStartLabel: nowLabel,
          activeShiftTrack: nextTrack,
          workdays: updatedDays,
          cleaningRoster: assignOnTimeInIfEligible(
            prev.cleaningRoster,
            prev.accountId
          ),
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
      updateStore((prev) => ({
        ...prev,
        cleaningDuty: {
          ...prev.cleaningDuty,
          reminderTriggeredAt430: true,
        },
        cleaningRoster: recordCleaningProof(prev.cleaningRoster, prev.accountId, {
          completedAtLabel: submittedAtLabel,
          photoDataUrl,
          photoFileName,
          note: note.trim(),
        }),
      }));
      announce(`Output ng paglilinis na-submit (${submittedAtLabel}).`);
    },
    [announce]
  );

  const clearCleaningProof = useCallback(() => {
    updateStore((prev) => ({
      ...prev,
      cleaningRoster: removeCleaningProof(prev.cleaningRoster, prev.accountId),
    }));
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
      cleaningRoster: rollRosterToNextDay(prev.cleaningRoster),
    }));

    announce(
      "Bagong araw na — mag-time in at kumuha ng picture para sa rolling attendance."
    );
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
        (acc) =>
          acc.username.toLowerCase() === normalized && acc.password === password
      );
      if (!matched) {
        return {
          ok: false,
          error:
            "Mali ang username o password. I-check ang account na binigay ng admin.",
        };
      }
      emitChange(readAccountState(matched.id, true));
      announce(`Signed in as ${matched.profile.fullName}.`);
      return { ok: true };
    },
    [announce]
  );

  const signOut = useCallback(() => {
    const current = readSnapshot();
    persistAccountBeforeSignOut(current);
    emitChange({ ...current, signedIn: false });
    announce("Signed out.");
  }, [announce]);

  const signInDemo = useCallback(() => {
    emitChange(readAccountState(DEMO_ACCOUNTS[0].id, true));
    announce(`Signed in as ${DEMO_ACCOUNTS[0].profile.fullName}.`);
  }, [announce]);

  const resetDemoData = useCallback(() => {
    const current = readSnapshot();
    const account = findAccountById(current.accountId);
    clearAccountAndRosterStorage(account.id);
    emitChange(createInitialStateForAccount(account, current.signedIn));
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
