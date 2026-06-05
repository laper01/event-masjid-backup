import type { AvailableVolunteerRole, AssignedVolunteer } from "@/types/volunteers";

export const mockVolunteerRoles: AvailableVolunteerRole[] = [
  {
    role_id: "role-010",
    event_id: "evt-020",
    event_title: "Summer Education Series",
    event_date: "2026-07-15T00:00:00Z",
    role_name: "Youth Program Mentor",
    description:
      "Guide and support youth participants during interactive learning sessions at the Islamic Center of Greater Houston.",
    slots: 4,
    filled: 2,
    badge_type: "Youth Mentor",
    skills: ["Teaching", "Youth", "Patience"],
    application_status: "none",
  },
  {
    role_id: "role-011",
    event_id: "evt-021",
    event_title: "Community Awareness Day",
    event_date: "2026-08-02T00:00:00Z",
    role_name: "Media & Socials",
    description:
      "Capture photos and create social media content for the event at Dar Al-Hijrah Mosque in Falls Church, VA.",
    slots: 2,
    filled: 1,
    badge_type: "Media Volunteer",
    skills: ["Photography", "Social Media"],
    application_status: "none",
  },
  {
    role_id: "role-012",
    event_id: "evt-022",
    event_title: "Annual Fundraising Gala",
    event_date: "2026-09-20T00:00:00Z",
    role_name: "Guest Welcoming",
    description:
      "Greet and assist guests at the ISNA Convention Center in Plainfield, Indiana.",
    slots: 6,
    filled: 6,
    badge_type: "Door Greeter",
    skills: ["Friendly", "Punctual"],
    application_status: "none",
  },
];

export const mockAssignedVolunteers: AssignedVolunteer[] = [
  {
    assignment_id: "assign-001",
    user_id: "usr-005",
    name: "Hassan Abdullah",
    email: "hassan@example.com",
    avatar_url: undefined,
    role_id: "role-010",
    role_name: "Youth Program Mentor",
    badge_type: "Youth Mentor",
    assigned_at: "2026-07-01T10:00:00Z",
    badge_awarded: false,
  },
  {
    assignment_id: "assign-002",
    user_id: "usr-006",
    name: "Aisha Karim",
    email: "aisha@example.com",
    avatar_url: undefined,
    role_id: "role-011",
    role_name: "Media & Socials",
    badge_type: "Media Volunteer",
    assigned_at: "2026-07-05T09:00:00Z",
    badge_awarded: true,
  },
];
