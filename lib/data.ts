/**
 * Application-wide data constants.
 * Centralised here so all content can be updated from one file.
 */

/* ─────────────────────────────────────────────
   NAVIGATION LINKS
   ───────────────────────────────────────────── */
export const NAV_LINKS = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "Events", href: "#events" },
  { label: "Venues", href: "#venues" },
  { label: "Analytics", href: "#analytics" },
  { label: "Settings", href: "#settings" },
] as const;

/* ─────────────────────────────────────────────
   HERO STATS (DASHBOARD PREVIEW)
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
   FEATURES SECTION
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
      "Secure, fast entry using our mobile check-in app. Scan tickets in milliseconds with zero friction.",
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
  bgColor: string;
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
    imageSrc:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
    imageAlt: "Elegant community dinner setup with warm lighting",
    bgColor: "#f3f4f3",
  },
  {
    id: "leadership-workshop",
    category: "EDUCATION",
    title: "Leadership Workshop",
    date: "Nov 02",
    time: "10:00 AM",
    price: "FREE",
    action: "Reserve Spot",
    imageSrc:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    imageAlt: "Modern workshop venue with people collaborating",
    bgColor: "#eeeeed",
  },
  {
    id: "3-on-3-basketball",
    category: "YOUTH",
    title: "3-on-3 Basketball",
    date: "Nov 15",
    time: "9:00 AM",
    price: 15,
    action: "Purchase Ticket",
    imageSrc:
      "https://images.unsplash.com/photo-1546519638405-a4d2c8671ba3?w=400&h=300&fit=crop",
    imageAlt: "Basketball court with players in action",
    bgColor: "#f3f4f3",
  },
  {
    id: "grand-charity-gala",
    category: "FUNDRAISER",
    title: "Grand Charity Gala",
    date: "Dec 10",
    time: "7:00 PM",
    price: 120,
    action: "Purchase Ticket",
    imageSrc:
      "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400&h=300&fit=crop",
    imageAlt: "Elegant gala venue with floral decorations",
    bgColor: "#eeeeed",
  },
];

/* ─────────────────────────────────────────────
   STATS TICKER (SOCIAL PROOF)
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
