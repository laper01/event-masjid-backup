// Clubs domain types

export type ClubVisibility = "public" | "approval_required" | "private";
export type MemberStatus = "none" | "pending" | "active" | "denied";

export interface ClubAdmin {
  user_id: string;
  name: string;
  avatar_url?: string;
  role: string;
}

export interface ClubMemberPreview {
  user_id: string;
  name: string;
  avatar_url?: string;
}

export interface UpcomingHangout {
  hangout_id: string;
  title: string;
  start_time: string;
  location_name: string;
  rsvp_status: "none" | "confirmed";
}

export interface ClubDetailData {
  club_id: string;
  name: string;
  description: string;
  category: string;
  visibility: ClubVisibility;
  city: string;
  country: string;
  member_count: number;
  founded_at: string;
  cover_image_url?: string;
  is_active: boolean;
  admin: ClubAdmin;
  member_preview: ClubMemberPreview[];
  upcoming_hangouts: UpcomingHangout[];
  caller_member_status: MemberStatus;
  is_admin: boolean;
}

export interface ClubCard {
  club_id: string;
  name: string;
  category: string;
  visibility: ClubVisibility;
  city: string;
  member_count: number;
  cover_image_url?: string;
  admin_name: string;
  description_short: string;
  tags: string[];
  caller_member_status: MemberStatus;
  is_admin: boolean;
}

export interface ClubMemberRequest {
  request_id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  request_message?: string;
  requested_at: string;
  previous_events_attended: number;
}

export interface ClubSettings {
  club_id: string;
  name: string;
  description: string;
  category: string;
  visibility: ClubVisibility;
  city: string;
  cover_image_url?: string;
  is_active: boolean;
}
