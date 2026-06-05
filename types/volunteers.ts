// Volunteers & Badges domain types

export interface AvailableVolunteerRole {
  role_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  role_name: string;
  description: string;
  slots: number;
  filled: number;
  badge_type: string;
  skills: string[];
  application_status: "none" | "applied" | "assigned";
}

export interface VolunteerRoleFormData {
  role_id?: string;
  name: string;
  description: string;
  slots: number;
  badge_type: string;
  skills: string[];
  requirements: string;
  contact_name?: string;
}

export interface AssignedVolunteer {
  assignment_id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role_id: string;
  role_name: string;
  badge_type: string;
  assigned_at: string;
  badge_awarded: boolean;
}

export interface VolunteerRoleStats {
  role_id: string;
  role_name: string;
  badge_type: string;
  slots: number;
  filled: number;
  applied: number;
  badges_awarded: number;
  pending_badges: number;
}

export interface RevertHostRecord {
  host_id: string;
  host_name: string;
  host_avatar?: string;
  journey_text: string;
  topics: string[];
  contact_preference: string;
  assigned_revert?: string;
  is_matched: boolean;
}

export interface HostRevertFormData {
  journey_text: string;
  topics: string[];
  contact_preference: "message" | "in_person" | "either";
  availability_note: string;
}
