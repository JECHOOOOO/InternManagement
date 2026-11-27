import { formatHoursMinutes, WORK_AREA_OPTIONS } from "@/data/demoData";
import type { WorkAreaOption, WorkdayLog } from "@/types/intern";

export interface WorklogSummary {
  loggedHours: number;
  targetHours: number;
  remainingHours: number;
  percentComplete: number;
  loggedLabel: string;
  remainingLabel: string;
  totalDays: number;
  savedReportsCount: number;
  pendingReportsCount: number;
}

export function normalizeWorkArea(value: string): WorkAreaOption {
  return WORK_AREA_OPTIONS.includes(value as WorkAreaOption)
    ? (value as WorkAreaOption)
    : "Other";
}

export function resolveShiftTrack(
  selectedTask: string,
  customTask: string
): string {
  if (selectedTask === "Other" && customTask.trim()) {
    return customTask.trim();
  }
  return selectedTask;
}

export function summarizeWorklogs(params: {
  totalLoggedHours: number;
  targetHours?: number;
  workdays: WorkdayLog[];
}): WorklogSummary {
  const targetHours = params.targetHours && params.targetHours > 0 ? params.targetHours : 240;
  const loggedHours = Math.max(0, params.totalLoggedHours);
  const remainingHours = Math.max(0, targetHours - loggedHours);
  const percentComplete = Math.min(
    100,
    Math.round((loggedHours / targetHours) * 100)
  );
  const totalDays = params.workdays.length;
  const savedReportsCount = params.workdays.filter((day) =>
    Boolean(day.accomplishment.trim())
  ).length;

  return {
    loggedHours,
    targetHours,
    remainingHours,
    percentComplete,
    loggedLabel: formatHoursMinutes(loggedHours),
    remainingLabel: formatHoursMinutes(remainingHours),
    totalDays,
    savedReportsCount,
    pendingReportsCount: Math.max(0, totalDays - savedReportsCount),
  };
}
