/**
 * Application-wide data constants.
 * Single source of truth for all page content.
 */

/* ─────────────────────────────────────────────
   NAVIGATION
   ───────────────────────────────────────────── */
export const NAV_LINKS = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "Events", href: "#events" },
  { label: "Venues", href: "#venues" },
  { label: "Analytics", href: "#analytics" },
  { label: "Settings", href: "#settings" },
] as const;

/* ─────────────────────────────────────────────
   HERO STATS
   ───────────────────────────────────────────── */
export const HERO_STATS = {
  revenue: "$12,450.00",
  revenueChange: "+16% vs last event",
  ticketsSold: "482 / 500",
  checkIns: 312,
  waitlist: 84,
  eventName: "Annual Youth Gala",
} as const;

export const RECENT_ATTENDEES = [
  {
    id: "1",
    name: "Sarah Ahmed",
    email: "sarah.a@email.com",
    status: "checked-in" as const,
    avatarColor: "#a6f2d1",
    initials: "SA",
  },
  {
    id: "2",
    name: "Omar Farooq",
    email: "o.farooq@email.com",
    status: "pending" as const,
    avatarColor: "#f6df84",
    initials: "OF",
  },
] as const;

/* ─────────────────────────────────────────────
   CORE FEATURES (PRD §4A/B)
   ───────────────────────────────────────────── */
export type Feature = {
  id: string;
  icon: string;
  title: string;
  description: string;
  highlighted: boolean;
};

export const FEATURES: Feature[] = [
  {
    id: "qr-checkins",
    icon: "qr_code_scanner",
    title: "QR Check-ins",
    description:
      "Digital tickets with QR codes that volunteers scan at the door using the UWS Admin App. Zero friction, instant entry.",
    highlighted: false,
  },
  {
    id: "revenue-tracking",
    icon: "monitoring",
    title: "Revenue Tracking",
    description:
      "Direct payouts to your masjid bank account. View detailed reports on sales, refunds, and early-bird performance.",
    highlighted: true,
  },
  {
    id: "automated-receipts",
    icon: "mail",
    title: "Automated Receipts",
    description:
      "Branded ticket confirmation emails and SMS reminders sent automatically upon purchase.",
    highlighted: false,
  },
];

/* ─────────────────────────────────────────────
   COMMUNITY PULSE MECHANICS (PRD §3)
   ───────────────────────────────────────────── */
export type PulseMechanic = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  tag: string;
};

export const PULSE_MECHANICS: PulseMechanic[] = [
  {
    id: "social-proof",
    emoji: "👥",
    title: "Social Proofing",
    description:
      "Every event listing shows a face-pile of friends attending (1st-degree) and mutuals attending (2nd-degree) — removing the social anxiety of going alone.",
    tag: "Baseline Friend Graph",
  },
  {
    id: "third-space",
    emoji: "🕌",
    title: "Third Space Flag",
    description:
      "Events are tagged as Masjid-Based or Community-Based — separating ritual worship from social gathering so you always know the vibe before you go.",
    tag: "Smart Tagging",
  },
  {
    id: "tiered-access",
    emoji: "🔐",
    title: "Tiered Access",
    description:
      "Restrict event visibility to specific UWS Membership Tiers — from Sustaining Members Dinners to Youth-Only Basketball Tournaments.",
    tag: "Membership Integration",
  },
  {
    id: "ping-system",
    emoji: "📲",
    title: "The Ping System",
    description:
      "If an event has low RSVPs 24 hours before it starts, admins can Ping a targeted segment — e.g. 3 spots left for the Real Estate workshop!",
    tag: "Real-Time",
  },
  {
    id: "barakah-pricing",
    emoji: "💛",
    title: "Barakah Pricing",
    description:
      "Support for Pay What You Can or Sponsor a Student tickets. Member discounts applied automatically via UWS tier verification.",
    tag: "Smart Ticketing",
  },
  {
    id: "volunteer-matrix",
    emoji: "🤝",
    title: "Volunteer Matrix",
    description:
      "Task-based signups for specific needs: parking, food service, photography. Volunteers earn Community Badges for every 5 events they help with.",
    tag: "Gamified Service",
  },
];

/* ─────────────────────────────────────────────
   USER PERSONAS (PRD §2)
   ───────────────────────────────────────────── */
export type Persona = {
  id: string;
  role: string;
  avatar: string;
  description: string;
  painPoint: string;
  solution: string;
};

export const PERSONAS: Persona[] = [
  {
    id: "program-director",
    role: "The Program Director",
    avatar: "PD",
    description:
      "Manages a complex calendar of recurring Halaqas, one-off seminars, and large-scale Eid carnivals.",
    painPoint: "Room conflicts, double-booked speakers, no headcount visibility.",
    solution: "Room Booking Logic + Google Calendar sync + real-time RSVP dashboard.",
  },
  {
    id: "youth-leader",
    role: "The Youth & Guild Leader",
    avatar: "YL",
    description:
      "Organizes niche meetups like Muslims in Tech mixers or Sisters Iaido seminars with minimal administrative overhead.",
    painPoint: "Events buried in WhatsApp groups, payments collected via Venmo DMs.",
    solution: "Public discovery feed + Barakah Pricing + member-tier access control.",
  },
  {
    id: "community-member",
    role: "The Community Member",
    avatar: "CM",
    description:
      "Finds active events — hiking, sports, coffee meetups — and sees who in their trusted network is attending.",
    painPoint: "No single feed. Social anxiety about showing up alone somewhere new.",
    solution: "Interest-based feed + Social Proofing face-pile + Revert Buddy System.",
  },
];

/* ─────────────────────────────────────────────
   REVERT / SHAHADAH COMPANION (PRD §4D)
   ───────────────────────────────────────────── */
export const REVERT_FEATURES = [
  {
    id: "friendly-tag",
    label: "Beginner / Revert Friendly",
    description:
      "A dedicated toggle so reverts always know which events are welcoming for newcomers.",
  },
  {
    id: "buddy-system",
    label: "Buddy System",
    description:
      "Established members can volunteer to Host a Revert — promising to meet them at the door so they never walk in alone.",
  },
  {
    id: "interests-filter",
    label: "Interests-Based Feed",
    description:
      "Follow tags like #RevertSupport, #BJJ, #Poetry, or #Entrepreneurship and get a personalised event feed.",
  },
] as const;

/* ─────────────────────────────────────────────
   SUCCESS METRICS (PRD §6)
   ───────────────────────────────────────────── */
export const SUCCESS_METRICS = [
  {
    id: "connection-rate",
    value: "Connection Rate",
    label: "% of attendees who added a new friend within 24 hrs of an event",
    icon: "🔗",
  },
  {
    id: "rsvp-checkin",
    value: "RSVP to Check-in",
    label: "Measuring actual attendance vs. digital intent",
    icon: "✅",
  },
  {
    id: "member-led",
    value: "Member-Led Events",
    label: "Community self-organising beyond top-down masjid programming",
    icon: "🌱",
  },
] as const;

/* ─────────────────────────────────────────────
   EVENTS DATA
   ───────────────────────────────────────────── */
export type EventCategory = "COMMUNITY" | "EDUCATION" | "YOUTH" | "FUNDRAISER";
export type TicketAction = "Purchase Ticket" | "Reserve Spot";

export type EventItem = {
  id: string;
  category: EventCategory;
  title: string;
  date: string;
  time: string;
  price: number | "FREE";
  action: TicketAction;
  imageSrc: string;
  imageAlt: string;
  friendsGoing?: number;
  tag?: string;
};


export const EVENTS: EventItem[] = [
  {
    id: "annual-unity-dinner",
    category: "COMMUNITY",
    title: "Annual Unity Dinner",
    date: "Oct 24",
    time: "6:00 PM",
    price: 25,
    action: "Purchase Ticket",
    imageSrc: "/images/unity-dinner.jpg", 
    imageAlt: "Elegant community dinner setup with warm lighting",
    friendsGoing: 4,
    tag: "Masjid-Based",
  },
  {
    id: "leadership-workshop",
    category: "EDUCATION",
    title: "Leadership Workshop",
    date: "Nov 02",
    time: "10:00 AM",
    price: "FREE",
    action: "Reserve Spot",
    imageSrc: "/images/leadership-workshop.jpg", 
    imageAlt: "Modern workshop venue with people collaborating",
    friendsGoing: 7,
    tag: "Revert Friendly",
  },
  {
    id: "quran-study-group",
    category: "EDUCATION",
    title: "Quran Study Group",
    date: "Nov 15",
    time: "9:00 AM",
    price: 15,
    action: "Purchase Ticket",
   
    imageSrc: "/images/quran-study.jpg", 
    imageAlt: "Basketball court with players in action",
    friendsGoing: 2,
    tag: "Community-Based",
  },
  {
    id: "grand-charity-gala",
    category: "FUNDRAISER",
    title: "Grand Charity Gala",
    date: "Dec 10",
    time: "7:00 PM",
    price: 120,
    action: "Purchase Ticket",
   
    imageSrc: "/images/charity-gala.jpg", 
    imageAlt: "Elegant gala venue with floral decorations",
    friendsGoing: 12,
    tag: "Sustaining Members",
  },
];

/* ─────────────────────────────────────────────
   SOCIAL PROOF STATS
   ───────────────────────────────────────────── */
export const SOCIAL_PROOF_STATS = [
  { value: "200+", label: "Communities" },
  { value: "50k+", label: "Tickets Sold" },
  { value: "98%", label: "Satisfaction" },
  { value: "$2M+", label: "Processed" },
] as const;

/* ─────────────────────────────────────────────
   FOOTER LINKS
   ───────────────────────────────────────────── */
export const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
  { label: "Documentation", href: "/docs" },
] as const;
