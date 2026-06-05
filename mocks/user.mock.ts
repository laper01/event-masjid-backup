import type { UserProfile, UserPreferences, ActivityItem } from "@/types/user";

export const mockCurrentUser: UserProfile = {
  user_id: "usr-current",
  name: "Ahmad Bin Yusuf",
  email: "ahmad@example.com",
  avatar_url: undefined,
  bio: "Community member and volunteer at ISNA Plainfield",
  city: "Plainfield, IN",
  joined_at: "2025-01-15T00:00:00Z",
  is_verified: true,
  events_attended: 12,
  badges_earned: 3,
  connections_count: 24,
};

export const mockUserPreferences: UserPreferences = {
  interests: ["Religious Study", "Community", "Sports"],
  radius_km: 15,
  location_name: "Plainfield, IN",
  latitude: 39.6773,
  longitude: -86.3644,
  notification_rsvp: true,
  notification_events: true,
  notification_connections: false,
};

export const mockActivityFeed: ActivityItem[] = [
  {
    activity_id: "act-001",
    activity_type: "ticket_purchase",
    actor_name: "Ahmad Bin Yusuf",
    actor_avatar: undefined,
    event_id: "evt-002",
    event_title: "Annual Community Gala Dinner",
    amount: 20.0,
    currency: "USD",
    created_at: "2026-06-04T09:45:00Z",
    is_new: true,
  },
  {
    activity_id: "act-002",
    activity_type: "approval_request",
    actor_name: "Omar Farooq",
    actor_avatar: undefined,
    event_id: "evt-002",
    event_title: "Annual Community Gala Dinner",
    created_at: "2026-06-04T09:30:00Z",
    is_new: true,
  },
  {
    activity_id: "act-003",
    activity_type: "new_rsvp",
    actor_name: "Zaid Hassan",
    actor_avatar: undefined,
    event_id: "evt-001",
    event_title: "Arabic Calligraphy Workshop",
    created_at: "2026-06-04T09:15:00Z",
    is_new: false,
  },
  {
    activity_id: "act-004",
    activity_type: "check_in",
    actor_name: "Ibrahim Khan",
    actor_avatar: undefined,
    event_id: "evt-001",
    event_title: "Arabic Calligraphy Workshop",
    created_at: "2026-06-04T09:00:00Z",
    is_new: false,
  },
  {
    activity_id: "act-005",
    activity_type: "volunteer_apply",
    actor_name: "Fatima Al-Rashid",
    actor_avatar: undefined,
    event_id: "evt-001",
    event_title: "Arabic Calligraphy Workshop",
    created_at: "2026-06-04T08:45:00Z",
    is_new: false,
  },
];

// US-based mosque locations for autocomplete
export const mockMosqueLocations = [
  {
    name: "Islamic Center of Greater Houston",
    address: "3110 Old Spanish Trail, Houston TX 77054",
    latitude: 29.7004,
    longitude: -95.3698,
  },
  {
    name: "Islamic Society of Boston",
    address: "204 Prospect St, Cambridge MA 02139",
    latitude: 42.3776,
    longitude: -71.1167,
  },
  {
    name: "Dar Al-Hijrah Mosque",
    address: "3159 Row St, Falls Church VA 22044",
    latitude: 38.8773,
    longitude: -77.17,
  },
  {
    name: "MCA Silicon Valley",
    address: "3003 Scott Blvd, Santa Clara CA 95054",
    latitude: 37.3573,
    longitude: -121.9692,
  },
  {
    name: "ISNA Headquarters",
    address: "6555 South County Road 750 East, Plainfield IN 46168",
    latitude: 39.6773,
    longitude: -86.3644,
  },
  {
    name: "Masjid Al-Islam",
    address: "1065 Cascade Ave SW, Atlanta GA 30310",
    latitude: 33.7282,
    longitude: -84.4327,
  },
];
