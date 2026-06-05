// Tickets domain types

export type PurchaseStatus = "completed" | "pending" | "refunded" | "cancelled" | "failed";
export type AttendanceStatus = "attended" | "no_show" | "unknown";
export type WaitlistStatus = "none" | "waitlisted";
export type RefundStatus = "not_applicable" | "processing" | "completed" | "failed";
export type CancellationSource = "user" | "organizer" | "system";
export type TicketType = "paid" | "free_rsvp" | "waitlisted";

export interface WaitlistedTicket {
  ticket_id: string;
  event_id: string;
  event_title: string;
  event_banner_url?: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  distance_km?: number;
  waitlist_position: number;
  tier_name?: string;
  joined_waitlist_at: string;
}

export interface BadgeEarned {
  badge_type: string;
  awarded_at: string;
  role_name?: string;
}

export interface PastTicket {
  ticket_id: string;
  event_id: string;
  event_title: string;
  event_banner_url?: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  tier_name?: string;
  amount_paid?: number;
  currency?: string;
  attendance_status: AttendanceStatus;
  checked_in_at?: string;
  badge_earned?: BadgeEarned;
  was_volunteer: boolean;
  volunteer_role?: string;
}

export interface CancelledTicket {
  ticket_id: string;
  event_id: string;
  event_title: string;
  event_banner_url?: string;
  original_start_time: string;
  location_name: string;
  tier_name?: string;
  amount_paid: number;
  currency: string;
  cancelled_at: string;
  cancellation_source: CancellationSource;
  refund_status: RefundStatus;
  refund_amount?: number;
  refund_initiated_at?: string;
  refund_completed_at?: string;
}

export interface UpcomingTicket {
  ticket_id: string;
  rsvp_id: string;
  event_id: string;
  event_title: string;
  event_banner_url?: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  tier_name?: string;
  amount_paid?: number;
  currency?: string;
  status: "confirmed" | "pending_payment" | "waitlisted";
  qr_token?: string;
  waitlist_position?: number;
}

export interface TicketPurchase {
  purchase_id: string;
  ticket_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_avatar?: string;
  tier_id: string;
  tier_name: string;
  quantity: number;
  amount_paid: number;
  currency: string;
  status: PurchaseStatus;
  promo_code_used?: string;
  discount_amount?: number;
  purchased_at: string;
  checked_in: boolean;
  checked_in_at?: string;
  refund_status?: string;
}

export interface PromoDiscount {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  display: string;
}

export interface OrderLine {
  label: string;
  amount: number;
  type: "item" | "discount" | "total";
}
