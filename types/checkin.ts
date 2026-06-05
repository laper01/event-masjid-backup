// Check-in & Scanner domain types

export interface AttendeeRow {
  rsvp_id: string;
  ticket_id?: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  tier_name?: string;
  checked_in: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  rsvp_status: string;
}

export interface TicketDetailData {
  ticket_id: string;
  rsvp_id: string;
  user_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_avatar?: string;
  tier_name: string;
  amount_paid: number;
  currency: string;
  promo_code_used?: string;
  purchased_at: string;
  checked_in: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  qr_token: string;
  scan_history: ScanHistoryEntry[];
}

export interface ScanHistoryEntry {
  scanned_at: string;
  result: "success" | "already_scanned" | "invalid";
}

export type ScanErrorType = "invalid_qr" | "expired_ticket" | "cancelled_ticket" | "wrong_event";

export interface ScanResult {
  ticket_id: string;
  rsvp_id: string;
  attendee_name: string;
  attendee_avatar?: string;
  tier_name: string;
  event_title: string;
  scan_time: string;
}

export interface CheckInStats {
  total_registered: number;
  total_checked_in: number;
  check_in_rate: number;
  last_check_in_at?: string;
}
