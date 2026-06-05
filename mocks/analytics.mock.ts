import type { AttendanceAnalytics, RevenueAnalytics, VolunteerAnalytics } from "@/types/analytics";

export const mockAttendanceAnalytics: AttendanceAnalytics = {
  total_registered: 157,
  total_attended: 142,
  no_show_count: 15,
  attendance_rate: 90.4,
  waitlist_count: 23,
  cancellation_count: 8,
  daily_registrations: [
    { date: "2026-11-15", count: 12 },
    { date: "2026-11-16", count: 18 },
    { date: "2026-11-17", count: 25 },
    { date: "2026-11-18", count: 31 },
    { date: "2026-11-19", count: 28 },
    { date: "2026-11-20", count: 22 },
    { date: "2026-11-21", count: 21 },
  ],
};

export const mockRevenueAnalytics: RevenueAnalytics = {
  total_revenue: 3140.0,
  total_tickets: 157,
  total_refunds: 350.0,
  net_revenue: 2790.0,
  currency: "USD",
  tier_breakdown: [
    {
      tier_name: "Early Bird",
      tickets_sold: 50,
      revenue: 1000.0,
      refunded: 0,
      net_revenue: 1000.0,
    },
    {
      tier_name: "Standard Admission",
      tickets_sold: 90,
      revenue: 4050.0,
      refunded: 350.0,
      net_revenue: 3700.0,
    },
    {
      tier_name: "VIP Table",
      tickets_sold: 17,
      revenue: 5950.0,
      refunded: 0,
      net_revenue: 5950.0,
    },
  ],
  daily_revenue: [
    { date: "2026-11-15", revenue: 200.0, ticket_count: 8 },
    { date: "2026-11-16", revenue: 360.0, ticket_count: 14 },
    { date: "2026-11-17", revenue: 520.0, ticket_count: 20 },
    { date: "2026-11-18", revenue: 680.0, ticket_count: 26 },
    { date: "2026-11-19", revenue: 480.0, ticket_count: 19 },
    { date: "2026-11-20", revenue: 440.0, ticket_count: 17 },
    { date: "2026-11-21", revenue: 460.0, ticket_count: 18 },
  ],
  promo_code_usage: 23,
  promo_discount: 185.0,
};

export const mockVolunteerAnalytics: VolunteerAnalytics = {
  total_volunteers: 12,
  total_applications: 28,
  total_badges_awarded: 8,
  pending_badges: 4,
  roles: [
    {
      role_id: "role-001",
      role_name: "Guest Welcoming",
      badge_type: "Door Greeter",
      slots: 4,
      filled: 4,
      applied: 9,
      badges_awarded: 4,
      pending_badges: 0,
    },
    {
      role_id: "role-002",
      role_name: "Event Setup",
      badge_type: "Event Setup",
      slots: 6,
      filled: 6,
      applied: 11,
      badges_awarded: 2,
      pending_badges: 4,
    },
    {
      role_id: "role-003",
      role_name: "Photography",
      badge_type: "Media Volunteer",
      slots: 2,
      filled: 2,
      applied: 8,
      badges_awarded: 2,
      pending_badges: 0,
    },
  ],
};
