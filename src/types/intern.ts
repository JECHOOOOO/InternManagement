export type NavRoute = "/dashboard" | "/oras" | "/more";

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
  | "Cash Advance"
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
  assignedToday: boolean;
  reminderTriggeredAt430: boolean;
  photoDataUrl?: string;
  photoFileName?: string;
  note: string;
  submittedAtLabel?: string;
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

export interface DemoAppState {
  signedIn: boolean;
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
}
