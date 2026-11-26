import type {
  CleaningCompletionRecord,
  CleaningRotationState,
  CleaningTask,
  ClientLead,
  DemoAppState,
  InternAccount,
  LabelQueueItem,
  LeadProduct,
  LeadStatus,
  MoreKnowledgeCategory,
  WeekdayIndex,
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

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export const WEEKDAY_FULL_LABELS = [
  "Lunes",
  "Martes",
  "Miyerkules",
  "Huwebes",
  "Biyernes",
] as const;

export const SAMPLE_INTERN_ACCOUNTS: InternAccount[] = [
  {
    id: "intern-jericho",
    fullName: "jericho del Socorro",
    initials: "JD",
    roleLabel: "Intern",
    currentTrack: "IT / software development",
    isYou: true,
  },
  {
    id: "intern-mica",
    fullName: "Micaela Santos",
    initials: "MS",
    roleLabel: "Intern",
    currentTrack: "IT QA / testing",
  },
  {
    id: "intern-paolo",
    fullName: "Paolo Reyes",
    initials: "PR",
    roleLabel: "Intern",
    currentTrack: "IT / software development",
  },
  {
    id: "intern-trisha",
    fullName: "Trisha Villanueva",
    initials: "TV",
    roleLabel: "Intern",
    currentTrack: "Client outreach",
  },
  {
    id: "intern-kenneth",
    fullName: "Kenneth Bautista",
    initials: "KB",
    roleLabel: "Intern",
    currentTrack: "IT QA / testing",
  },
];

export const CLEANING_TASKS: CleaningTask[] = [
  {
    id: "walis-mop",
    title: "Walis at Mop ng Floor",
    shortLabel: "Walis & Mop",
    description:
      "Magwalis at mag-mop ng sahig sa main work area, aisle, at walkway ng opisina.",
    areaLabel: "Main Floor & Walkway",
    checklist: [
      "Walisin ang alikabok at maliliit na kalat sa ilalim ng mga mesa at upuan.",
      "Mag-mop gamit ang malinis na tubig at disinfectant solution.",
      "Patuyuin ang sahig at ibalik sa ayos ang walis at mop pagkatapos.",
    ],
  },
  {
    id: "punas-mesa",
    title: "Punas ng Mesa at Workstation",
    shortLabel: "Punas Mesa",
    description:
      "Punasan ang mga mesa, common tables, at ayusin ang mga nakakalat na upuan at gamit.",
    areaLabel: "Workstations & Tables",
    checklist: [
      "Punasan ang ibabaw ng mga mesa gamit ang malinis na basahan at alcohol/cleaner.",
      "Ibalik sa tamang puwesto ang mga upuan at shared supplies.",
      "Siguraduhing walang natirang baso o papel sa mga common table.",
    ],
  },
  {
    id: "tapon-basura",
    title: "Tapon ng Basura at Retaso",
    shortLabel: "Basura",
    description:
      "Kolektahin ang lahat ng basurahan, itapon sa tamang tapunan, at palitan ng bagong liner.",
    areaLabel: "Trash Bins & Disposal",
    checklist: [
      "Ipunin ang basura mula sa workstation bins, pantry, at common area.",
      "Ihiwalay ang nabubulok, di-nabubulok, at malilinis na scrap/papel.",
      "Maglagay ng bagong trash bag sa bawat basurahan.",
    ],
  },
  {
    id: "ayos-pantry",
    title: "Ayos ng Pantry at Drinking Area",
    shortLabel: "Pantry",
    description:
      "Linisin ang lababo, punasan ang water dispenser at counter, at ayusin ang pantry area.",
    areaLabel: "Pantry & Sink",
    checklist: [
      "Punasan ang counter, microwave/oven top, at paligid ng water dispenser.",
      "Siguraduhing malinis ang lababo at walang baradong food scraps.",
      "I-check kung may stock pa ng dishwashing liquid at sponge.",
    ],
  },
  {
    id: "linis-cr",
    title: "Linis ng CR at Hugasan",
    shortLabel: "CR & Hugasan",
    description:
      "Linisin ang CR, salamin, at hugasan ng kamay; i-check ang sabon at tissue stock.",
    areaLabel: "Restroom & Wash Area",
    checklist: [
      "Punasan ang salamin, lababo, at gripo sa hugasan ng kamay.",
      "Buhusan at linisin ang sahig at toilet bowl ng CR.",
      "I-check at i-refill kung kailangan ang hand soap at tissue.",
    ],
  },
];

export function getCompletionKey(
  weekOffset: number,
  dayIndex: number,
  internId: string
): string {
  return `${weekOffset}:${dayIndex}:${internId}`;
}

/**
 * Deterministic 5x5 Latin Square rotation:
 * - Every intern gets 5 distinct cleaning tasks across Mon–Fri (zero duplicates in a week).
 * - On any given day, all 5 interns have 5 distinct tasks (zero overlap on the same day).
 * - Advancing weekOffset shifts the starting task by 1 so the weekly order also rolls fairly.
 */
export function getAssignedCleaningTask(
  internIndex: number,
  dayIndex: WeekdayIndex,
  weekOffset: number
): CleaningTask {
  const count = CLEANING_TASKS.length;
  const idx = (((internIndex + dayIndex + weekOffset) % count) + count) % count;
  return CLEANING_TASKS[idx];
}

export function getInternIndex(internId: string): number {
  const idx = SAMPLE_INTERN_ACCOUNTS.findIndex((acc) => acc.id === internId);
  return idx >= 0 ? idx : 0;
}

export function getWeekDateRangeLabel(weekOffset: number): string {
  const baseMonday = new Date(2026, 10, 23); // Mon, Nov 23, 2026
  const start = new Date(baseMonday);
  start.setDate(baseMonday.getDate() + weekOffset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${fmt.format(start)} – ${fmt.format(end)}, ${end.getFullYear()}`;
}

function buildInitialCompletions(): Record<string, CleaningCompletionRecord> {
  const completions: Record<string, CleaningCompletionRecord> = {};
  const completedTimes = ["4:35 PM", "4:42 PM", "4:48 PM", "4:50 PM", "4:55 PM"];
  // Mon (0), Tue (1), Wed (2) already completed in Week 1; Thu (3) is today (active)
  for (let day = 0; day < 3; day++) {
    SAMPLE_INTERN_ACCOUNTS.forEach((intern, internIdx) => {
      const task = getAssignedCleaningTask(internIdx, day as WeekdayIndex, 0);
      completions[getCompletionKey(0, day, intern.id)] = {
        completedAtLabel: completedTimes[(internIdx + day) % completedTimes.length],
        taskId: task.id,
      };
    });
  }
  return completions;
}

export const INITIAL_CLEANING_ROTATION: CleaningRotationState = {
  weekOffset: 0,
  activeDayIndex: 3, // Thu, Nov 26 · ngayon
  attendanceByIntern: {
    "intern-jericho": { present: true, timeInLabel: "8:25 AM" },
    "intern-mica": { present: true, timeInLabel: "8:18 AM" },
    "intern-paolo": { present: true, timeInLabel: "8:30 AM" },
    "intern-trisha": { present: true, timeInLabel: "8:12 AM" },
    "intern-kenneth": { present: true, timeInLabel: "8:22 AM" },
  },
  completions: buildInitialCompletions(),
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

export const INITIAL_DEMO_STATE: DemoAppState = {
  signedIn: true,
  activeInternId: "intern-jericho",
  notificationsEnabled: false,
  notificationPromptDismissed: false,
  timedIn: true,
  activeShiftStartLabel: "8:25 AM",
  activeShiftTrack: "IT / software development",
  totalLoggedHours: 22.09,
  profile: {
    fullName: "jericho del Socorro",
    initials: "JD",
    roleLabel: "Intern",
    targetHours: 240,
    currentTrack: "IT / software development",
  },
  cleaningRotation: INITIAL_CLEANING_ROTATION,
  workdays: [
    {
      id: "day-2026-11-26",
      taskTitle: "IT / software development",
      dateLabel: "Thu, Nov 26 · ngayon",
      timeRangeLabel: "8:25 AM – bukas pa",
      hoursWorked: null,
      isCurrentShift: true,
      workArea: "Other",
      accomplishment: "",
    },
    {
      id: "day-2026-11-25",
      taskTitle: "IT QA",
      dateLabel: "Wed, Nov 25",
      timeRangeLabel: "8:29 AM – 5:16 PM",
      hoursWorked: 7.51,
      workArea: "Other",
      accomplishment: "",
    },
    {
      id: "day-2026-11-24",
      taskTitle: "IT QA / testing",
      dateLabel: "Tue, Nov 24",
      timeRangeLabel: "8:03 AM – 5:01 PM",
      hoursWorked: 7.94,
      workArea: "Other",
      accomplishment: "",
    },
    {
      id: "day-2026-11-23",
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
  labelJobs: INITIAL_LABEL_JOBS,
};
