import type {
  AssignedWorkLink,
  ClientLead,
  DemoAppState,
  LabelQueueItem,
  LeadProduct,
  LeadStatus,
  MoreKnowledgeCategory,
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

export const INITIAL_ASSIGNED_WORK: AssignedWorkLink[] = [
  {
    id: "stock-count",
    title: "Stock Count",
    description:
      "Bilangin ang pabrika — walang presyo, walang PO, hindi nagbabago ang stock.",
    category: "Stock & Buying",
    demoSummary:
      "Demo preview of factory floor counting mode. Interns count physical pieces by rack/section without viewing supplier pricing or altering live inventory.",
    demoChecklist: [
      "Piliin ang section o rack label bago magbilang.",
      "I-record ang aktuwal na bilang kada design at size.",
      "I-flag kung may hindi tugma sa sticker label (walang stock mutation sa mode na ito).",
    ],
  },
  {
    id: "gumawa-ng-sticker",
    title: "Gumawa ng sticker",
    description:
      "Ilang QR sticker kada design at size, at ang mga hakbang — walang PO.",
    category: "Prepare",
    demoSummary:
      "Demo preview for calculating and batching QR garment stickers per design and size breakdown without exposing purchase order details.",
    demoChecklist: [
      "I-check ang size breakdown (XS–3XL) para sa assigned batch.",
      "I-print ang tamang dami ng QR stickers at i-verify ang scan.",
      "I-mark sa Labels queue kapag naidikit at na-verify na.",
    ],
  },
  {
    id: "ayos-ng-lugar",
    title: "Ayos ng lugar",
    description:
      "Ilagay ang mga section, istante, locker, rack at patong ng isang lugar — ang code sa label.",
    category: "Operations",
    demoSummary:
      "Demo preview for mapping physical storage zones (sections, shelves, lockers, racks, and layers) using label codes.",
    demoChecklist: [
      "Tiyakin na may malinaw na location code ang bawat istante o rack.",
      "I-assign ang tamang zone/patong level bago maglagay ng bagong batch.",
    ],
  },
  {
    id: "scanner",
    title: "Scanner",
    description:
      "I-scan ang label ng lugar para makita ang laman at dami, o ang sticker ng gamit para makita kung nasaan.",
    category: "Stock & Buying",
    demoSummary:
      "Demo lookup preview simulating QR label scanning for location contents or item whereabouts.",
    demoChecklist: [
      "Sample location code: RACK-A2-L3 (32 pcs assorted tees)",
      "Sample sticker tag: ASH-QR-1048 (Prep Table 2 · Ready for packing)",
    ],
  },
  {
    id: "locations",
    title: "Locations",
    description:
      "Pumili ng istante, locker o table para makita ang laman — walang scan.",
    category: "Stock & Buying",
    demoSummary:
      "Manual browse view for shelves, lockers, and prep tables when a camera scanner is not available.",
    demoChecklist: [
      "Prep Table 1 — 48 pending QR stickers",
      "Rack B1 · Shelf 2 — Cotton hoodies (M, L, XL)",
      "Locker 4 — Packing tapes & thermal rolls",
    ],
  },
];

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
