import {
  CLEANERS_PER_DAY,
  DEMO_ACCOUNTS,
  getTodayIsoDate,
  INITIAL_CLEANING_ROSTER,
} from "@/data/demoData";
import type {
  CleaningProofRecord,
  SharedCleaningRosterState,
} from "@/types/intern";

/**
 * Pure domain module for the hidden 3-interns-per-day rolling cleaning roster.
 * Invariant: strict level-by-level fairness (1-1-1 across all interns before any 2,
 * 2-2-2 before any 3, etc.), gated on actual Time-In with photo.
 */

export function areAllAssignedDone(roster: SharedCleaningRosterState): boolean {
  return (
    roster.assignedAccountIds.length > 0 &&
    roster.assignedAccountIds.every((id) =>
      Boolean(roster.completedTodayByAccount[id])
    )
  );
}

export function assignOnTimeInIfEligible(
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

export function recordCleaningProof(
  roster: SharedCleaningRosterState,
  accountId: string,
  proof: CleaningProofRecord
): SharedCleaningRosterState {
  if (!roster.assignedAccountIds.includes(accountId)) {
    return roster;
  }
  const alreadyDoneToday = Boolean(roster.completedTodayByAccount[accountId]);
  const prevCount = roster.totalCleaningsByAccount[accountId] ?? 0;

  return {
    ...roster,
    completedTodayByAccount: {
      ...roster.completedTodayByAccount,
      [accountId]: proof,
    },
    totalCleaningsByAccount: {
      ...roster.totalCleaningsByAccount,
      [accountId]: alreadyDoneToday ? prevCount : prevCount + 1,
    },
  };
}

export function removeCleaningProof(
  roster: SharedCleaningRosterState,
  accountId: string
): SharedCleaningRosterState {
  if (!roster.assignedAccountIds.includes(accountId)) {
    return roster;
  }
  const wasDone = Boolean(roster.completedTodayByAccount[accountId]);
  const nextCompleted = { ...roster.completedTodayByAccount };
  delete nextCompleted[accountId];
  const prevCount = roster.totalCleaningsByAccount[accountId] ?? 0;

  return {
    ...roster,
    completedTodayByAccount: nextCompleted,
    totalCleaningsByAccount: {
      ...roster.totalCleaningsByAccount,
      [accountId]: wasDone ? Math.max(0, prevCount - 1) : prevCount,
    },
  };
}

export function rollRosterToNextDay(
  roster: SharedCleaningRosterState
): SharedCleaningRosterState {
  return {
    ...roster,
    dayNumber: roster.dayNumber + 1,
    timedInTodayAccountIds: [],
    assignedAccountIds: [],
    completedTodayByAccount: {},
  };
}

export function normalizeRoster(
  parsed?: Partial<SharedCleaningRosterState>,
  todayIso: string = getTodayIsoDate()
): SharedCleaningRosterState {
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

  if (merged.lastCalendarDate !== todayIso) {
    if (merged.assignedAccountIds.length === 0 || areAllAssignedDone(merged)) {
      return {
        ...rollRosterToNextDay(merged),
        lastCalendarDate: todayIso,
      };
    }
    return {
      ...merged,
      lastCalendarDate: todayIso,
    };
  }

  return merged;
}
