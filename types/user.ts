// User & Profile domain types

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  joined_at: string;
  is_verified: boolean;
  events_attended: number;
  badges_earned: number;
  connections_count: number;
}

export interface UserPreferences {
  interests: string[];
  radius_km: number;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  gender_filter?: string;
  notification_rsvp: boolean;
  notification_events: boolean;
  notification_connections: boolean;
}

export interface Connection {
  connection_id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  mutual_events: number;
  connected_since: string;
}

export interface ActivityItem {
  activity_id: string;
  activity_type:
    | "new_rsvp"
    | "ticket_purchase"
    | "approval_request"
    | "check_in"
    | "cancellation"
    | "volunteer_apply"
    | "new_member";
  actor_name: string;
  actor_avatar?: string;
  event_id?: string;
  event_title?: string;
  amount?: number;
  currency?: string;
  created_at: string;
  is_new: boolean;
}
