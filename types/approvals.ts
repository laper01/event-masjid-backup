// Approvals & Invites domain types

export type ApprovalStatus = "pending" | "approved" | "denied";
export type DirectInviteStatus = "pending" | "accepted" | "expired" | "revoked";
export type AccessSource = "invite_link" | "direct_invite" | "approval" | "public";

export interface ApprovalRequest {
  request_id: string;
  event_id: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_avatar?: string;
  applicant_joined_at: string;
  message: string;
  submitted_at: string;
  status: ApprovalStatus;
  organizer_reply?: string;
  decided_at?: string;
  decided_by?: string;
  history: ApplicantHistory[];
  previous_events_attended: number;
  is_verified: boolean;
}

export interface ApplicantHistory {
  event_title: string;
  action: string;
  date: string;
}

export interface DecidedRequest {
  request_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_avatar?: string;
  message: string;
  submitted_at: string;
  status: "approved" | "denied";
  organizer_reply?: string;
  decided_at: string;
  decided_by: string;
  has_registered: boolean;
}

export interface DirectInvite {
  invite_id: string;
  token: string;
  invited_by_name: string;
  message?: string;
  expires_at?: string;
  uses_left?: number;
}

export interface DirectInviteRecord {
  invite_id: string;
  recipient_id?: string;
  recipient_name: string;
  recipient_email: string;
  recipient_avatar?: string;
  personal_message?: string;
  status: DirectInviteStatus;
  sent_at: string;
  expires_at?: string;
  accepted_at?: string;
}

export interface AccessMember {
  rsvp_id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  access_source: AccessSource;
  granted_at: string;
  invite_id?: string;
  ticket_id?: string;
  rsvp_status: string;
}

export interface UserSearchResult {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  is_already_registered: boolean;
  is_already_invited: boolean;
}
