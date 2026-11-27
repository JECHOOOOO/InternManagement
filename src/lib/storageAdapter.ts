import {
  createInitialStateForAccount,
  DEMO_ACCOUNTS,
  INITIAL_CLEANING_DUTY,
  INITIAL_CLEANING_ROSTER,
  INITIAL_DEMO_STATE,
} from "@/data/demoData";
import { normalizeRoster } from "@/lib/cleaningRoster";
import type {
  DemoAppState,
  DemoAuthAccount,
  SharedCleaningRosterState,
} from "@/types/intern";

/**
 * Local browser storage adapter at the persistence seam.
 * Keeps exact v7 / ashai-theme-v1 keys so existing demo sessions stay intact.
 */

export const SESSION_KEY = "ashai-intern-session-v7";
export const ACCOUNT_KEY_PREFIX = "ashai-intern-account-v7:";
export const ROSTER_KEY = "ashai-intern-cleaning-roster-v7";
export const THEME_KEY = "ashai-theme-v1";

export type AppTheme = "dark" | "light";

export function findAccountById(
  accountId: string | null | undefined
): DemoAuthAccount {
  return DEMO_ACCOUNTS.find((acc) => acc.id === accountId) ?? DEMO_ACCOUNTS[0];
}

export function isManagedStorageKey(key: string | null): boolean {
  return (
    key === SESSION_KEY ||
    key === ROSTER_KEY ||
    Boolean(key && key.startsWith(ACCOUNT_KEY_PREFIX))
  );
}

export function readSharedRoster(): SharedCleaningRosterState {
  if (typeof window === "undefined") return INITIAL_CLEANING_ROSTER;
  try {
    const raw = window.localStorage.getItem(ROSTER_KEY);
    return raw
      ? normalizeRoster(JSON.parse(raw) as Partial<SharedCleaningRosterState>)
      : normalizeRoster();
  } catch {
    return normalizeRoster();
  }
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

export function readAccountState(
  accountId: string,
  signedIn: boolean
): DemoAppState {
  const account = findAccountById(accountId);
  if (typeof window === "undefined") {
    return createInitialStateForAccount(account, signedIn);
  }
  try {
    const raw = window.localStorage.getItem(`${ACCOUNT_KEY_PREFIX}${account.id}`);
    return raw
      ? mergeAccountState(
          account.id,
          JSON.parse(raw) as Partial<DemoAppState>,
          signedIn
        )
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

export function readActiveSessionState(): DemoAppState {
  if (typeof window === "undefined") return INITIAL_DEMO_STATE;
  try {
    const activeAccountId = window.localStorage.getItem(SESSION_KEY);
    if (!activeAccountId) {
      return {
        ...INITIAL_DEMO_STATE,
        cleaningRoster: readSharedRoster(),
      };
    }
    const account = DEMO_ACCOUNTS.find((acc) => acc.id === activeAccountId);
    if (!account) {
      return {
        ...INITIAL_DEMO_STATE,
        cleaningRoster: readSharedRoster(),
      };
    }
    return readAccountState(account.id, true);
  } catch {
    return INITIAL_DEMO_STATE;
  }
}

export function writeAppState(next: DemoAppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ROSTER_KEY, JSON.stringify(next.cleaningRoster));
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

export function persistAccountBeforeSignOut(current: DemoAppState): void {
  if (typeof window === "undefined" || !current.signedIn) return;
  try {
    window.localStorage.setItem(
      `${ACCOUNT_KEY_PREFIX}${current.accountId}`,
      JSON.stringify(current)
    );
  } catch {
    // Ignore storage errors
  }
}

export function clearAccountAndRosterStorage(accountId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${ACCOUNT_KEY_PREFIX}${accountId}`);
    window.localStorage.removeItem(ROSTER_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function readThemePreference(): AppTheme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function writeThemePreference(next: AppTheme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
    // Ignore storage errors
  }
  document.documentElement.dataset.theme = next;
}
