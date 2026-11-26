"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  INITIAL_CLEANING_DUTY,
  INITIAL_DEMO_STATE,
  SAMPLE_DEMO_LEADS,
} from "@/data/demoData";
import type {
  ClientLead,
  DemoAppState,
  InternRequestItem,
  LeadStatus,
  WorkAreaOption,
} from "@/types/intern";

const STORAGE_KEY = "ashai-intern-demo-state-v3";

type Listener = () => void;
const listeners = new Set<Listener>();
let clientCachedState: DemoAppState | null = null;

function mergeWithDefaults(parsed: Partial<DemoAppState>): DemoAppState {
  return {
    ...INITIAL_DEMO_STATE,
    ...parsed,
    profile: {
      ...INITIAL_DEMO_STATE.profile,
      ...(parsed.profile ?? {}),
    },
    cleaningDuty: {
      ...INITIAL_CLEANING_DUTY,
      ...(parsed.cleaningDuty ?? {}),
    },
    workdays:
      Array.isArray(parsed.workdays) && parsed.workdays.length > 0
        ? parsed.workdays
        : INITIAL_DEMO_STATE.workdays,
    requests: Array.isArray(parsed.requests)
      ? parsed.requests
      : INITIAL_DEMO_STATE.requests,
    leads: Array.isArray(parsed.leads) ? parsed.leads : INITIAL_DEMO_STATE.leads,
    labelJobs:
      Array.isArray(parsed.labelJobs) && parsed.labelJobs.length > 0
        ? parsed.labelJobs
        : INITIAL_DEMO_STATE.labelJobs,
  };
}

function readSnapshot(): DemoAppState {
  if (typeof window === "undefined") return INITIAL_DEMO_STATE;
  if (clientCachedState !== null) return clientCachedState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    clientCachedState = raw
      ? mergeWithDefaults(JSON.parse(raw) as Partial<DemoAppState>)
      : INITIAL_DEMO_STATE;
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
    if (e.key === STORAGE_KEY) {
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

function updateStore(updater: (prev: DemoAppState) => DemoAppState) {
  const next = updater(readSnapshot());
  clientCachedState = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }
  for (const listener of listeners) {
    listener();
  }
}

interface InternAppContextValue {
  state: DemoAppState;
  liveMessage: string;
  announce: (msg: string) => void;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  dismissNotificationPrompt: () => void;
  toggleTimeInOut: (trackName?: string) => void;
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
  updateAvatarDataUrl: (dataUrl: string | undefined) => void;
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
  const [liveMessage, setLiveMessage] = useState("");

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
    (trackName?: string) => {
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
          activeShiftStartLabel: nowLabel,
          activeShiftTrack: nextTrack,
          workdays: updatedDays,
          cleaningDuty: {
            ...prev.cleaningDuty,
            assignedToday: true,
          },
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
          assignedToday: true,
          reminderTriggeredAt430: true,
          photoDataUrl,
          photoFileName,
          note: note.trim(),
          submittedAtLabel,
        },
      }));
      announce(`Output ng paglilinis na-submit (${submittedAtLabel}).`);
    },
    [announce]
  );

  const clearCleaningProof = useCallback(() => {
    updateStore((prev) => ({
      ...prev,
      cleaningDuty: {
        ...prev.cleaningDuty,
        photoDataUrl: undefined,
        photoFileName: undefined,
        note: "",
        submittedAtLabel: undefined,
      },
    }));
    announce("Na-clear ang picture ng paglilinis.");
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

  const signOut = useCallback(() => {
    updateStore((prev) => ({ ...prev, signedIn: false }));
    announce("Signed out of demo session.");
  }, [announce]);

  const signInDemo = useCallback(() => {
    updateStore((prev) => ({ ...prev, signedIn: true }));
    announce("Signed in to demo intern account.");
  }, [announce]);

  const resetDemoData = useCallback(() => {
    clientCachedState = INITIAL_DEMO_STATE;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    for (const listener of listeners) {
      listener();
    }
    announce("Demo data reset to initial state.");
  }, [announce]);

  const value = useMemo<InternAppContextValue>(
    () => ({
      state,
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
      updateAvatarDataUrl,
      signOut,
      signInDemo,
      resetDemoData,
    }),
    [
      state,
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
      updateAvatarDataUrl,
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
