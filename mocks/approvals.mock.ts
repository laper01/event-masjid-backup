import type { ApprovalRequest, DirectInviteRecord, AccessMember } from "@/types/approvals";

export const mockPendingRequests: ApprovalRequest[] = [
  {
    request_id: "req-001",
    event_id: "evt-002",
    user_id: "usr-002",
    applicant_name: "Omar Farooq",
    applicant_email: "omar@example.com",
    applicant_avatar: undefined,
    applicant_joined_at: "2025-03-15T00:00:00Z",
    message:
      "I am a regular community member who has attended many events at our masjid. I would love to attend this gathering and meet others.",
    submitted_at: "2026-06-03T10:00:00Z",
    status: "pending",
    history: [],
    previous_events_attended: 7,
    is_verified: true,
  },
  {
    request_id: "req-002",
    event_id: "evt-002",
    user_id: "usr-003",
    applicant_name: "Zaid Hassan",
    applicant_email: "zaid@example.com",
    applicant_avatar: undefined,
    applicant_joined_at: "2025-08-20T00:00:00Z",
    message:
      "I heard great things about this event and would love to join the community gathering.",
    submitted_at: "2026-06-03T11:30:00Z",
    status: "pending",
    history: [],
    previous_events_attended: 3,
    is_verified: false,
  },
];

export const mockDirectInvites: DirectInviteRecord[] = [
  {
    invite_id: "inv-001",
    recipient_id: "usr-010",
    recipient_name: "Fatima Al-Rashid",
    recipient_email: "fatima@example.com",
    recipient_avatar: undefined,
    personal_message: "We would love to have you join us for this special gathering!",
    status: "accepted",
    sent_at: "2026-05-28T10:00:00Z",
    accepted_at: "2026-05-29T14:30:00Z",
  },
  {
    invite_id: "inv-002",
    recipient_id: "usr-011",
    recipient_name: "Yusuf Malik",
    recipient_email: "yusuf@example.com",
    recipient_avatar: undefined,
    personal_message: undefined,
    status: "pending",
    sent_at: "2026-06-01T09:00:00Z",
    expires_at: "2026-06-08T09:00:00Z",
  },
];

export const mockAccessMembers: AccessMember[] = [
  {
    rsvp_id: "rsvp-001",
    user_id: "usr-001",
    name: "Ahmad Bin Yusuf",
    email: "ahmad@example.com",
    avatar_url: undefined,
    access_source: "direct_invite",
    granted_at: "2026-05-29T14:30:00Z",
    invite_id: "inv-001",
    rsvp_status: "confirmed",
  },
  {
    rsvp_id: "rsvp-002",
    user_id: "usr-002",
    name: "Omar Farooq",
    email: "omar@example.com",
    avatar_url: undefined,
    access_source: "approval",
    granted_at: "2026-06-02T09:15:00Z",
    rsvp_status: "confirmed",
  },
  {
    rsvp_id: "rsvp-003",
    user_id: "usr-004",
    name: "Ibrahim Khan",
    email: "ibrahim@example.com",
    avatar_url: undefined,
    access_source: "public",
    granted_at: "2026-06-03T08:00:00Z",
    rsvp_status: "pending_payment",
  },
];
