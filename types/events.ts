// Events domain types

export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type EventVisibility = "public" | "invite_only" | "approval_required" | "private";
export type GenderRestriction = "NO_RESTRICTION" | "MALE_ONLY" | "FEMALE_ONLY";
export type CallerStatus =
  | "none"
  | "registered"
  | "confirmed"
  | "pending_payment"
  | "waitlisted"
  | "invited"
  | "pending"
  | "approved"
  | "denied";

export interface EventCard {
  event_id: string;
  title: string;
  banner_url?: string;
  source_name: string;
  source_type: "masjid" | "club" | "connection";
  start_time: string;
  end_time?: string;
  location_name: string;
  distance_km?: number;
  price: number;
  currency: string;
  is_free: boolean;
  visibility: EventVisibility;
  has_tickets: boolean;
  is_beginner_friendly: boolean;
  friends_attending: FriendAttending[];
  friends_count: number;
  tags: string[];
  caller_status: CallerStatus;
  spots_left?: number;
  total_capacity?: number;
}

export interface FriendAttending {
  user_id: string;
  name: string;
  avatar_url?: string;
}

export interface EventDetail extends EventCard {
  description: string;
  organizer_id: string;
  organizer_name: string;
  organizer_avatar?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  registered: number;
  capacity?: number;
  sale_ends_at?: string;
  has_revert_host: boolean;
  revert_welcome_message?: string;
  gender_restriction: GenderRestriction;
  volunteer_roles: VolunteerRole[];
  ticket_tiers: TicketTier[];
  pending_approvals?: number;
}

export interface VolunteerRole {
  role_id: string;
  name: string;
  description: string;
  slots: number;
  filled: number;
  badge_type: string;
  skills: string[];
  application_status: "none" | "applied" | "assigned";
}

export interface TicketTier {
  tier_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  capacity?: number;
  sold: number;
  sale_starts_at?: string;
  sale_ends_at?: string;
  max_per_order: number;
  min_per_order: number;
  is_visible: boolean;
  is_sold_out: boolean;
  early_bird_price?: number;
  early_bird_ends_at?: string;
}

export interface DiscoverFilters {
  search?: string;
  type?: "event" | "hangout" | "club_hangout" | "all";
  gender?: GenderRestriction;
  tags?: string[];
  is_beginner_friendly?: boolean;
  has_tickets?: boolean;
  date_from?: string;
  date_to?: string;
  radius_km?: number;
  page?: number;
  per_page?: number;
}

export interface AdminEventRow {
  event_id: string;
  title: string;
  thumbnail_url?: string;
  location_name: string;
  start_time: string;
  end_time?: string;
  registered: number;
  capacity?: number;
  status: EventStatus;
  visibility: EventVisibility;
  has_tickets: boolean;
  revenue?: number;
  currency: string;
  pending_approvals?: number;
  volunteer_roles_count?: number;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  has_tickets: boolean;
  price?: number;
  currency: string;
  visibility: EventVisibility;
  gender_restriction: GenderRestriction;
  is_beginner_friendly: boolean;
  host_a_revert: boolean;
  revert_welcome_message?: string;
  tags: string[];
  enable_volunteer_roles: boolean;
}
