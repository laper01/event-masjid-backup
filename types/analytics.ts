// Analytics domain types

export interface TierRevenue {
  tier_name: string;
  tickets_sold: number;
  revenue: number;
  refunded: number;
  net_revenue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  ticket_count: number;
}

export interface AttendanceAnalytics {
  total_registered: number;
  total_attended: number;
  no_show_count: number;
  attendance_rate: number;
  waitlist_count: number;
  cancellation_count: number;
  daily_registrations: DailyRegistration[];
}

export interface DailyRegistration {
  date: string;
  count: number;
}

export interface RevenueAnalytics {
  total_revenue: number;
  total_tickets: number;
  total_refunds: number;
  net_revenue: number;
  currency: string;
  tier_breakdown: TierRevenue[];
  daily_revenue: DailyRevenue[];
  promo_code_usage: number;
  promo_discount: number;
}

export interface VolunteerAnalytics {
  total_volunteers: number;
  total_applications: number;
  total_badges_awarded: number;
  pending_badges: number;
  roles: import("./volunteers").VolunteerRoleStats[];
}

export interface RevertAnalytics {
  total_revert_registrations: number;
  total_hosts: number;
  matched_pairs: number;
  unmatched_reverts: number;
  unmatched_hosts: number;
  hosts: import("./volunteers").RevertHostRecord[];
}
