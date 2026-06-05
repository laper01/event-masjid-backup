// Hangouts domain types

export type HangoutStatus = "upcoming" | "active" | "completed" | "cancelled";
export type HangoutVisibility = "public" | "invite_only";

export interface HangoutParticipant {
  user_id: string;
  name: string;
  avatar_url?: string;
}

export interface HangoutDetailData {
  hangout_id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_name: string;
  organizer_avatar?: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  capacity?: number;
  participants_count: number;
  spots_left?: number;
  gender_restriction: string;
  visibility: HangoutVisibility;
  is_beginner_friendly: boolean;
  tags: string[];
  banner_url?: string;
  participants: HangoutParticipant[];
  caller_rsvp_status: "none" | "confirmed";
  is_organizer: boolean;
  status: HangoutStatus;
}

export interface MyHangoutCard {
  hangout_id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_name: string;
  organizer_avatar?: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  distance_km?: number;
  capacity?: number;
  participants_count: number;
  spots_left?: number;
  gender_restriction: string;
  visibility: string;
  is_beginner_friendly: boolean;
  tags: string[];
  banner_url?: string;
  status: HangoutStatus;
  role: "organizer" | "attendee";
  rsvp_status?: "confirmed";
}

export interface CreateHangoutFormData {
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  gender_restriction: string;
  visibility: HangoutVisibility;
  is_beginner_friendly: boolean;
  tags: string[];
}

export interface HangoutInstance {
  hangout_id: string;
  series_id?: string;
  title: string;
  date: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  location_detail?: string;
  capacity?: number;
  participants_count: number;
  spots_left?: number;
  is_exception: boolean;
  is_recurring: boolean;
  recurrence_label?: string;
  series_description?: string;
  caller_rsvp_status: "none" | "confirmed";
  is_past?: boolean;
  is_cancelled?: boolean;
}

export interface RecurrenceRule {
  series_id: string;
  title: string;
  frequency: "weekly" | "biweekly" | "monthly";
  day_of_week: number;
  start_time: string;
  end_time?: string;
  location_name: string;
  capacity?: number;
  series_start_date: string;
  series_end_date?: string;
}
