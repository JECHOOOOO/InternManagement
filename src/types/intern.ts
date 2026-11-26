export type NavRoute = "/dashboard" | "/oras" | "/request" | "/more";

export type WorkAreaOption =
  | "Other"
  | "IT / software development"
  | "IT QA / testing"
  | "Sticker maker"
  | "Stock count / Locations"
  | "Client outreach";

export interface WorkdayLog {
  id: string;
  taskTitle: string;
  dateLabel: string;
  timeRangeLabel: string;
  hoursWorked: number | null;
  isCurrentShift?: boolean;
  workArea: WorkAreaOption;
  accomplishment: string;
  savedAtLabel?: string;
}

export type RequestCategory =
  | "Leave"
  | "Materials"
  | "Time-in correction";

export type LeaveType =
  | "Vacation leave"
  | "Sick leave"
  | "Emergency leave"
  | "School / OJT requirement";

export interface InternRequestItem {
  id: string;
  category: RequestCategory;
  title: string;
  summary: string;
  details: string;
  status: "Pending (demo)";
  createdAtLabel: string;
}

export type LeadProduct =
  | "B2B ERP"
  | "Booking Platform"
  | "ERP + Booking Bundle"
  | "Custom Apparel / Merch";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Follow-up needed"
  | "Closed / Won"
  | "Not a fit";

export interface ClientLead {
  id: string;
  businessName: string;
  contactPerson: string;
  contactChannel: string;
  leadUrl: string;
  nextFollowUp: string;
  product: LeadProduct;
  status: LeadStatus;
  notes: string;
  createdAtLabel: string;
}

export interface CleaningDutyState {
  reminderTriggeredAt430: boolean;
}

export interface CleaningProofRecord {
  completedAtLabel: string;
  photoDataUrl: string;
  photoFileName: string;
  note: string;
}

export interface SharedCleaningRosterState {
  dayNumber: number;
  lastCalendarDate: string;
  /** Up to 3 intern account IDs assigned to clean today */
  assignedAccountIds: string[];
  /** Per-account proof submitted today, keyed by accountId */
  completedTodayByAccount: Record<string, CleaningProofRecord>;
  /** Silent per-account total cleaning count (strict 1-1-1 before 2-2-2 before 3-3-3) */
  totalCleaningsByAccount: Record<string, number>;
}

export interface LabelQueueItem {
  id: string;
  designName: string;
  sizeSummary: string;
  quantity: number;
  locationCode: string;
  done: boolean;
}

export interface MoreKnowledgeCategory {
  id: "prepare" | "stock-buying";
  label: string;
  badgeCount?: number;
  items: {
    id: string;
    title: string;
    subtitle: string;
    keywords: string[];
    guideSteps: string[];
  }[];
}

export interface InternProfile {
  fullName: string;
  initials: string;
  roleLabel: string;
  avatarDataUrl?: string;
  targetHours: number;
  currentTrack: string;
}

export interface DemoAuthAccount {
  id: string;
  username: string;
  password: string;
  profile: InternProfile;
  initialLoggedHours: number;
  initialShiftStartLabel: string;
  initialShiftTrack: string;
  initialTimedIn: boolean;
  initialCleaningAssigned: boolean;
}

export interface DemoAppState {
  signedIn: boolean;
  accountId: string;
  username: string;
  notificationsEnabled: boolean;
  notificationPromptDismissed: boolean;
  timedIn: boolean;
  activeShiftStartLabel: string;
  activeShiftTrack: string;
  totalLoggedHours: number;
  workdays: WorkdayLog[];
  requests: InternRequestItem[];
  leads: ClientLead[];
  labelJobs: LabelQueueItem[];
  profile: InternProfile;
  cleaningDuty: CleaningDutyState;
  cleaningRoster: SharedCleaningRosterState;
}
