import type {
  CleaningDutyState,
  ClientLead,
  DemoAppState,
  DemoAuthAccount,
  LabelQueueItem,
  LeadProduct,
  LeadStatus,
  MoreKnowledgeCategory,
  SharedCleaningRosterState,
  WorkAreaOption,
} from "@/types/intern";

export const APP_BUILD_TAG = "build D_1UsqZ3";

export const WORK_AREA_OPTIONS: WorkAreaOption[] = [
  "Other",
  "IT / software development",
  "IT QA / testing",
  "Sticker maker",
  "Stock count / Locations",
  "Client outreach",
];

export const LEAD_PRODUCTS: LeadProduct[] = [
  "B2B ERP",
  "Booking Platform",
  "ERP + Booking Bundle",
  "Custom Apparel / Merch",
];

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Follow-up needed",
  "Closed / Won",
  "Not a fit",
];

export const INITIAL_CLEANING_DUTY: CleaningDutyState = {
  reminderTriggeredAt430: false,
};

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatHoursMinutes(decimalHours: number): string {
  const totalMinutes = Math.max(0, Math.round(decimalHours * 60));
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hrs}h ${String(mins).padStart(2, "0")}m`;
}

export const CLEANERS_PER_DAY = 3;

export const INITIAL_CLEANING_ROSTER: SharedCleaningRosterState = {
  dayNumber: 1,
  lastCalendarDate: "2026-11-26",
  assignedAccountIds: ["acc-jericho", "acc-franz", "acc-jeffry"],
  completedTodayByAccount: {},
  totalCleaningsByAccount: {
    "acc-jericho": 0,
    "acc-franz": 0,
    "acc-jeffry": 0,
    "acc-johndale": 0,
    "acc-justine": 0,
    "acc-mark": 0,
    "acc-stephen": 0,
    "acc-tyron": 0,
    "acc-denmark": 0,
    "acc-xyrus": 0,
    "acc-ronnie": 0,
    "acc-reyco": 0,
    "acc-owen": 0,
  },
};

export const INITIAL_LABEL_JOBS: LabelQueueItem[] = [
  {
    id: "lbl-1",
    designName: "Ashai Classic Tee — Black (Mass Cut Batch A)",
    sizeSummary: "S: 20 · M: 30 · L: 25",
    quantity: 75,
    locationCode: "PREP-T1",
    done: false,
  },
  {
    id: "lbl-2",
    designName: "Varsity Polo Uniform — Navy",
    sizeSummary: "M: 24 · L: 20 · XL: 16",
    quantity: 60,
    locationCode: "RACK-B2",
    done: false,
  },
  {
    id: "lbl-3",
    designName: "Drifit Event Singlet — Teal",
    sizeSummary: "S: 14 · M: 18 · L: 12",
    quantity: 44,
    locationCode: "PREP-T3",
    done: false,
  },
];

export const MORE_KNOWLEDGE_CATEGORIES: MoreKnowledgeCategory[] = [
  {
    id: "prepare",
    label: "PREPARE",
    badgeCount: 179,
    items: [
      {
        id: "prep-labels",
        title: "Labels & QR stickers (179 pending)",
        subtitle: "Print queue, sticker sizing, at barcode alignment",
        keywords: ["label", "labels", "qr", "sticker", "print", "179"],
        guideSteps: [
          "Buksan ang Labels queue mula sa Home o More bago mag-print.",
          "Siguraduhing malinaw ang thermal print at nababasa ng Scanner.",
          "I-group ang stickers ayon sa design at size para hindi malito sa packing.",
        ],
      },
      {
        id: "prep-mass-cut",
        title: "Mass cut & bundle prep checklist",
        subtitle: "Pagsusuri ng size breakdown bago mag-sticker",
        keywords: ["mass cut", "mass", "cut", "bundle", "size", "prep"],
        guideSteps: [
          "I-verify ang bilang ng bawat bundle kumpara sa cutting sheet.",
          "Ihiwalay ang mga pirasong may defect o kulang na print bago lagyan ng QR.",
        ],
      },
      {
        id: "prep-ayos",
        title: "Ayos ng lugar (Zones & labels)",
        subtitle: "Section, istante, locker, rack, at patong codes",
        keywords: ["ayos", "lugar", "zone", "rack", "istante", "locker"],
        guideSteps: [
          "Sundin ang format na ZONE-RACK-LAYER sa bawat bagong shelf tag.",
          "Panatilihing walang nakaharang sa mga aisle papuntang fire extinguisher.",
        ],
      },
    ],
  },
  {
    id: "stock-buying",
    label: "STOCK & BUYING",
    items: [
      {
        id: "sb-stock-count",
        title: "Stock Count (Factory floor)",
        subtitle: "Walang presyo, walang PO — physical count lang",
        keywords: ["stock", "count", "bilang", "pabrika", "inventory"],
        guideSteps: [
          "Bilangin nang dalawang beses ang mga bundle na higit sa 50 pcs.",
          "Hindi nagbabago ang live stock ledger habang nasa intern count mode.",
        ],
      },
      {
        id: "sb-scanner",
        title: "Scanner & Locations lookup",
        subtitle: "Hanapin ang laman ng istante o kinaroroonan ng item",
        keywords: ["scanner", "locations", "scan", "istante", "table"],
        guideSteps: [
          "Gamitin ang Scanner para sa mabilisang paghahanap gamit ang camera.",
          "Kung madilim o malabo ang label, gamitin ang Locations manual picker.",
        ],
      },
      {
        id: "sb-safety",
        title: "Shop safety & expiry reminders",
        subtitle: "Fire extinguisher at pintura expiry monitoring",
        keywords: ["fire extinguisher", "pintura", "abiso", "safety", "expire"],
        guideSteps: [
          "I-check ang Abiso sa Telepono prompt para sa morning expiry alerts.",
          "I-report agad sa supervisor kung may malapit nang mag-expire na gamit.",
        ],
      },
    ],
  },
];

export const SAMPLE_DEMO_LEADS: ClientLead[] = [
  {
    id: "lead-sample-1",
    businessName: "Afiya Staycation & Resort",
    contactPerson: "Marco Reyes",
    contactChannel: "0917-555-0148 / FB Page",
    leadUrl: "https://afiyastaycation.com",
    nextFollowUp: "2026-11-30",
    product: "Booking Platform",
    status: "Interested",
    notes: "Asked for demo link and weekend check-in workflow overview.",
    createdAtLabel: "Demo sample",
  },
  {
    id: "lead-sample-2",
    businessName: "Northline Garment Co.",
    contactPerson: "Clarisse Tan",
    contactChannel: "clarisse@northlinegarments.example",
    leadUrl: "https://northlinegarments.example",
    nextFollowUp: "2026-12-02",
    product: "B2B ERP",
    status: "Contacted",
    notes: "Sent intro deck; follow up after production team review.",
    createdAtLabel: "Demo sample",
  },
];

export const DEMO_ACCOUNTS: DemoAuthAccount[] = [
  {
    id: "acc-jericho",
    username: "Jericho",
    password: "jericho2026",
    profile: {
      fullName: "jericho del Socorro",
      initials: "JD",
      roleLabel: "Intern",
      targetHours: 240,
      currentTrack: "IT / software development",
    },
    initialLoggedHours: 22.09,
    initialShiftStartLabel: "8:25 AM",
    initialShiftTrack: "IT / software development",
    initialTimedIn: true,
    initialCleaningAssigned: true,
  },
  {
    id: "acc-franz",
    username: "Franz",
    password: "franz2026",
    profile: {
      fullName: "Franz",
      initials: "FR",
      roleLabel: "Intern",
      targetHours: 500,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:15 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-jeffry",
    username: "Jeffry",
    password: "jeffry2026",
    profile: {
      fullName: "Jeffry",
      initials: "JF",
      roleLabel: "Intern",
      targetHours: 600,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:20 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-johndale",
    username: "Johndale",
    password: "johndale2026",
    profile: {
      fullName: "Johndale",
      initials: "JN",
      roleLabel: "Intern",
      targetHours: 500,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:22 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-justine",
    username: "Justine",
    password: "justine2026",
    profile: {
      fullName: "Justine",
      initials: "JT",
      roleLabel: "Intern",
      targetHours: 600,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:18 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-mark",
    username: "Mark",
    password: "mark2026",
    profile: {
      fullName: "Mark",
      initials: "MK",
      roleLabel: "Intern",
      targetHours: 600,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:24 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-stephen",
    username: "Stephen",
    password: "stephen2026",
    profile: {
      fullName: "Stephen",
      initials: "ST",
      roleLabel: "Intern",
      targetHours: 240,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:19 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-tyron",
    username: "Tyron",
    password: "tyron2026",
    profile: {
      fullName: "Tyron",
      initials: "TY",
      roleLabel: "Intern",
      targetHours: 600,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:21 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-denmark",
    username: "denmark",
    password: "denmark2026",
    profile: {
      fullName: "Denmark",
      initials: "DM",
      roleLabel: "Intern",
      targetHours: 600,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:23 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-xyrus",
    username: "Xyrus",
    password: "xyrus2026",
    profile: {
      fullName: "Xyrus",
      initials: "XY",
      roleLabel: "Intern",
      targetHours: 500,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:17 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-ronnie",
    username: "Ronnie",
    password: "ronnie2026",
    profile: {
      fullName: "Ronnie",
      initials: "RN",
      roleLabel: "Intern",
      targetHours: 240,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:26 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-reyco",
    username: "Reyco",
    password: "reyco2026",
    profile: {
      fullName: "Reyco",
      initials: "RC",
      roleLabel: "Intern",
      targetHours: 240,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:20 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
  {
    id: "acc-owen",
    username: "owen",
    password: "owen2026",
    profile: {
      fullName: "Owen",
      initials: "OW",
      roleLabel: "Intern",
      targetHours: 240,
      currentTrack: "Intern",
    },
    initialLoggedHours: 16.0,
    initialShiftStartLabel: "8:28 AM",
    initialShiftTrack: "Intern",
    initialTimedIn: true,
    initialCleaningAssigned: false,
  },
];

export function createInitialStateForAccount(
  account: DemoAuthAccount,
  signedIn = true
): DemoAppState {
  return {
    signedIn,
    accountId: account.id,
    username: account.username,
    notificationsEnabled: false,
    notificationPromptDismissed: false,
    timedIn: account.initialTimedIn,
    activeShiftStartLabel: account.initialShiftStartLabel,
    activeShiftTrack: account.initialShiftTrack,
    totalLoggedHours: account.initialLoggedHours,
    profile: { ...account.profile },
    cleaningDuty: {
      ...INITIAL_CLEANING_DUTY,
    },
    cleaningRoster: {
      ...INITIAL_CLEANING_ROSTER,
      assignedAccountIds: [...INITIAL_CLEANING_ROSTER.assignedAccountIds],
      completedTodayByAccount: {},
      totalCleaningsByAccount: {
        ...INITIAL_CLEANING_ROSTER.totalCleaningsByAccount,
      },
    },
    workdays: [
      {
        id: `${account.id}-day-2026-11-26`,
        taskTitle: account.initialShiftTrack,
        dateLabel: "Thu, Nov 26 · ngayon",
        timeRangeLabel: `${account.initialShiftStartLabel} – bukas pa`,
        hoursWorked: null,
        isCurrentShift: true,
        workArea: "Other",
        accomplishment: "",
      },
      {
        id: `${account.id}-day-2026-11-25`,
        taskTitle: "IT QA",
        dateLabel: "Wed, Nov 25",
        timeRangeLabel: "8:29 AM – 5:16 PM",
        hoursWorked: 7.51,
        workArea: "Other",
        accomplishment: "",
      },
      {
        id: `${account.id}-day-2026-11-24`,
        taskTitle: "IT QA / testing",
        dateLabel: "Tue, Nov 24",
        timeRangeLabel: "8:03 AM – 5:01 PM",
        hoursWorked: 7.94,
        workArea: "Other",
        accomplishment: "",
      },
      {
        id: `${account.id}-day-2026-11-23`,
        taskTitle: "Sticker maker",
        dateLabel: "Mon, Nov 23",
        timeRangeLabel: "9:21 AM – 5:03 PM",
        hoursWorked: 6.64,
        workArea: "Other",
        accomplishment: "",
      },
    ],
    requests: [],
    leads: [],
    labelJobs: INITIAL_LABEL_JOBS.map((job) => ({ ...job })),
  };
}

export const INITIAL_DEMO_STATE: DemoAppState = createInitialStateForAccount(
  DEMO_ACCOUNTS[0],
  false
);
