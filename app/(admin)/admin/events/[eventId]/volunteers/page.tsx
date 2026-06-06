"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEventStore } from "@/store/eventStore";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { ActiveEventBanner } from "@/components/admin/ActiveEventBanner";
import {
  useVolunteerRoles,
  useAssignedRoster,
  useCreateRole,
  useUpdateRole,
  useAssignVolunteer,
  useAwardBadge,
} from "@/hooks/useVolunteers";
import type {
  AvailableVolunteerRole,
  AssignedVolunteer,
  VolunteerRoleFormData,
} from "@/types/volunteers";

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */

const MOCK_ROLES: AvailableVolunteerRole[] = [
  {
    role_id: "role-001",
    event_id: "evt-001",
    event_title: "Annual Youth Gala",
    event_date: "2026-11-23",
    role_name: "Registration Desk",
    description: "Greet attendees, verify tickets, and hand out name tags at the main entrance.",
    slots: 4,
    filled: 4,
    badge_type: "Registration Desk",
    skills: ["Organized", "Friendly", "Punctual"],
    application_status: "none",
  },
  {
    role_id: "role-002",
    event_id: "evt-001",
    event_title: "Annual Youth Gala",
    event_date: "2026-11-23",
    role_name: "Door Greeter",
    description: "Welcome guests with a smile and direct them to the prayer hall or dining area.",
    slots: 4,
    filled: 2,
    badge_type: "Door Greeter",
    skills: ["Arabic Speaking", "Warm Personality"],
    application_status: "none",
  },
  {
    role_id: "role-003",
    event_id: "evt-001",
    event_title: "Annual Youth Gala",
    event_date: "2026-11-23",
    role_name: "Kitchen Helper",
    description: "Assist with food preparation, serving, and keeping the dining area tidy.",
    slots: 6,
    filled: 1,
    badge_type: "Kitchen Helper",
    skills: ["Food Safe", "Team Player"],
    application_status: "none",
  },
];

interface MockApplicant {
  application_id: string;
  role_id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  badges_earned: number;
  message: string;
  applied_at: string;
  status: "applied" | "assigned" | "rejected";
}

const MOCK_APPLICANTS: MockApplicant[] = [
  { application_id: "app-001", role_id: "role-002", user_id: "u-001", name: "Ahmad Bin Yusuf", email: "ahmad@example.com", badges_earned: 8, message: "I volunteered at the last gala and would love to help welcome everyone this year. I'm fluent in Arabic and English.", applied_at: new Date(Date.now() - 2 * 864e5).toISOString(), status: "applied" },
  { application_id: "app-002", role_id: "role-002", user_id: "u-002", name: "Layla Mahmoud",   email: "layla@example.com", badges_earned: 3, message: "Happy to help make the event welcoming for all guests.", applied_at: new Date(Date.now() - 3 * 36e5).toISOString(), status: "applied" },
  { application_id: "app-003", role_id: "role-002", user_id: "u-003", name: "Yusuf Karimi",    email: "yusuf@example.com", badges_earned: 12, message: "I have experience greeting at 5 previous events.", applied_at: new Date(Date.now() - 5 * 36e5).toISOString(), status: "applied" },
  { application_id: "app-004", role_id: "role-003", user_id: "u-004", name: "Maryam Javed",    email: "maryam@example.com", badges_earned: 6, message: "Love helping in the kitchen and ensuring guests are well fed.", applied_at: new Date(Date.now() - 864e5).toISOString(), status: "applied" },
  { application_id: "app-005", role_id: "role-003", user_id: "u-005", name: "Ibrahim Noor",    email: "ibrahim@example.com", badges_earned: 2, message: "Available all day and happy to assist wherever needed.", applied_at: new Date(Date.now() - 2 * 36e5).toISOString(), status: "applied" },
];

const MOCK_ASSIGNED: AssignedVolunteer[] = [
  { assignment_id: "asgn-001", user_id: "u-010", name: "Omar Farooq",  email: "omar@example.com", role_id: "role-001", role_name: "Registration Desk", badge_type: "Registration Desk", assigned_at: new Date(Date.now() - 5 * 864e5).toISOString(), badge_awarded: true },
  { assignment_id: "asgn-002", user_id: "u-011", name: "Fatima Nour",  email: "fatima@example.com", role_id: "role-001", role_name: "Registration Desk", badge_type: "Registration Desk", assigned_at: new Date(Date.now() - 4 * 864e5).toISOString(), badge_awarded: true },
  { assignment_id: "asgn-003", user_id: "u-012", name: "Zaid Hassan",  email: "zaid@example.com", role_id: "role-002", role_name: "Door Greeter", badge_type: "Door Greeter", assigned_at: new Date(Date.now() - 3 * 864e5).toISOString(), badge_awarded: false },
  { assignment_id: "asgn-004", user_id: "u-013", name: "Sarah Malik",  email: "sarah@example.com", role_id: "role-002", role_name: "Door Greeter", badge_type: "Door Greeter", assigned_at: new Date(Date.now() - 2 * 864e5).toISOString(), badge_awarded: false },
];

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 36e5);
  const days  = Math.floor(diff / 864e5);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/* ─────────────────────────────────────────────────────────────────
   ASSIGN VOLUNTEER MODAL
───────────────────────────────────────────────────────────────── */

interface AssignModalProps {
  applicant: MockApplicant | null;
  role: AvailableVolunteerRole | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventId: string;
}

function AssignVolunteerModal({ applicant, role, isOpen, onClose, onSuccess, eventId }: AssignModalProps) {
  const [autoReject, setAutoReject]   = useState(false);
  const [status, setStatus]           = useState<"idle" | "submitting" | "success">("idle");
  const { mutateAsync: assignVol }    = useAssignVolunteer(eventId, role?.role_id ?? "");

  const slotsRemaining = role ? role.slots - role.filled : 0;
  const isFinalSlot    = slotsRemaining === 1;
  const pendingForRole = MOCK_APPLICANTS.filter((a) => a.role_id === role?.role_id && a.status === "applied").length;

  const handleConfirm = async () => {
    if (!applicant || !role) return;
    setStatus("submitting");
    try {
      await assignVol({ application_id: applicant.application_id, status: "assigned" });
      setStatus("success");
      toast.success(`${applicant.name} assigned to ${role.role_name}!`);
      setTimeout(() => { setStatus("idle"); onSuccess(); onClose(); }, 600);
    } catch {
      toast.error("Failed to assign volunteer.");
      setStatus("idle");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && applicant && role && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-[400px] bg-white rounded-[2rem] shadow-2xl border border-outline/10 p-8 overflow-hidden relative">

              {/* Header */}
              <div className="text-center space-y-2 mb-7">
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                </div>
                <h2 className="font-['Plus_Jakarta_Sans'] text-[22px] font-extrabold text-primary">
                  Confirm Assignment
                </h2>
                <p className="text-on-surface-variant text-[13px]">
                  Assigning to <span className="font-bold text-primary">{role.role_name}</span>
                </p>
              </div>

              {/* Applicant strip */}
              <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-4 border border-outline/10 mb-5">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[15px] shrink-0">
                  {getInitials(applicant.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-[14px] truncate">{applicant.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="material-symbols-outlined text-secondary text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                      {applicant.badges_earned} Badges Earned
                    </span>
                  </div>
                </div>
              </div>

              {/* Slots remaining */}
              <div className="flex justify-between items-center py-3 border-b border-outline/10 mb-5">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Slots Remaining After</span>
                <div className="flex items-center gap-2">
                  <span className={`font-['Plus_Jakarta_Sans'] font-black text-[18px] ${slotsRemaining - 1 <= 0 ? "text-error" : "text-primary"}`}>
                    {Math.max(0, slotsRemaining - 1)}
                  </span>
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest">of {role.slots}</span>
                </div>
              </div>

              {/* Auto-reject toggle — shown when final slot */}
              <AnimatePresence>
                {isFinalSlot && pendingForRole > 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-error/5 rounded-2xl p-4 border border-error/15 flex items-start gap-3 mb-5 cursor-pointer"
                    onClick={() => setAutoReject(!autoReject)}
                  >
                    <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                      autoReject ? "bg-error border-error" : "bg-white border-outline/30"
                    }`}>
                      {autoReject && <span className="material-symbols-outlined text-on-error text-[13px]">check</span>}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-on-surface">
                        Role is now full. Auto-reject other {pendingForRole - 1} applicants?
                      </p>
                      <p className="text-[10px] text-outline font-semibold mt-0.5 uppercase tracking-wider">
                        They will receive a polite notification
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="space-y-3">
                <button onClick={handleConfirm}
                  disabled={status === "submitting" || status === "success"}
                  className={`w-full py-4 rounded-full font-['Plus_Jakarta_Sans'] font-bold text-[14px] shadow-lg transition-all flex items-center justify-center gap-2 ${
                    status === "success" ? "bg-primary text-on-primary" :
                    status === "submitting" ? "bg-primary/80 text-on-primary cursor-wait" :
                    "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]"
                  }`}>
                  <AnimatePresence mode="wait">
                    {status === "submitting" ? (
                      <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                        Processing...
                      </motion.div>
                    ) : status === "success" ? (
                      <motion.div key="done" initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                        className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Assigned!
                      </motion.div>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Confirm Assignment
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button onClick={onClose} disabled={status === "submitting"}
                  className="w-full py-3 text-outline font-bold text-[12px] uppercase tracking-widest hover:text-error transition-colors">
                  Cancel
                </button>
              </div>

              {/* Decorative blur */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-fixed/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ROLE CARD
───────────────────────────────────────────────────────────────── */

function RoleCard({
  role, onViewApplicants, onDelete, onEdit,
  applicantCount,
}: {
  role: AvailableVolunteerRole;
  onViewApplicants: () => void;
  onDelete: () => void;
  onEdit: () => void;
  applicantCount: number;
}) {
  const pct      = role.slots > 0 ? Math.round((role.filled / role.slots) * 100) : 100;
  const isFull   = role.filled >= role.slots;
  const isActive = !isFull && role.filled > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all group p-5 ${
        isActive ? "border-primary/15 ring-1 ring-primary/15" : "border-outline/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-primary leading-snug">
            {role.role_name}
          </h3>
          <p className="text-[12px] text-on-surface-variant mt-0.5 line-clamp-2">
            {role.description}
          </p>
        </div>
        <button onClick={onDelete}
          className="text-error opacity-30 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-error-container rounded-lg shrink-0">
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          {isFull ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-on-primary-fixed-variant bg-primary-fixed px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              All Slots Filled
              <span className="material-symbols-outlined text-[13px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-on-surface-variant">
              {role.slots - role.filled} slots open
            </span>
          )}
          <span className="text-[11px] font-semibold text-on-surface-variant">
            {role.filled} / {role.slots} filled
          </span>
        </div>
        <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isFull ? "bg-primary" : "bg-primary"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7 }}
          />
        </div>
      </div>

      {/* Badge + Skills */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-[12px] text-primary font-semibold">
          <span className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          Earns: {role.badge_type} badge
        </div>
        <div className="flex flex-wrap gap-1.5">
          {role.skills.map((skill) => (
            <span key={skill}
              className="text-[10px] bg-surface-container text-on-surface-variant font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onEdit}
          className="flex-1 border border-primary text-primary rounded-full py-2 text-[12px] font-semibold hover:bg-primary/5 transition-colors">
          Edit Role
        </button>
        <button onClick={onViewApplicants}
          className="flex-1 flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container rounded-full py-2 text-[12px] font-bold hover:opacity-90 transition-colors">
          View Applicants
          <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${
            applicantCount > 0 ? "bg-primary text-on-primary" : "bg-surface-container text-outline"
          }`}>
            {applicantCount}
          </span>
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CREATE / EDIT ROLE FORM
───────────────────────────────────────────────────────────────── */

const FORM_INITIAL: VolunteerRoleFormData = {
  name: "", description: "", slots: 0,
  badge_type: "General Volunteer", skills: [], requirements: "",
};

const BADGE_OPTIONS = ["General Volunteer", "Registration Desk", "Door Greeter", "Kitchen Helper", "AV Tech", "Custom"];

function RoleForm({
  eventId, editing, onCancel,
}: {
  eventId: string;
  editing: AvailableVolunteerRole | null;
  onCancel: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm]   = useState<VolunteerRoleFormData>(
    editing ? { name: editing.role_name, description: editing.description, slots: editing.slots, badge_type: editing.badge_type, skills: editing.skills, requirements: "" }
             : FORM_INITIAL
  );
  const [skillInput, setSkillInput] = useState("");

  const { mutateAsync: createRole, isPending: creating } = useCreateRole(eventId);
  const { mutateAsync: updateRole, isPending: updating } = useUpdateRole(eventId, editing?.role_id ?? "");

  const set = (k: keyof VolunteerRoleFormData, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) set("skills", [...form.skills, s]);
    setSkillInput("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Role name is required."); return; }
    if (editing) {
      await updateRole(form);
      toast.success("Role updated!");
    } else {
      await createRole(form);
      toast.success("Role created!");
    }
    qc.invalidateQueries({ queryKey: ["volunteer-roles", eventId] });
    onCancel();
  };

  return (
    <div className="bg-surface-container-low rounded-2xl border border-outline/10 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-outline/10 pb-4">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-[20px]">post_add</span>
        </div>
        <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-primary">
          {editing ? "Edit Role" : "Create New Role"}
        </h2>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5">Role Name</label>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Kitchen Helper"
            className="w-full bg-white border-0 border-b border-outline focus:border-primary focus:ring-0 transition-all px-4 py-3 rounded-t-lg text-[13px]" />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            rows={3} placeholder="Explain the responsibilities..."
            className="w-full bg-white border-0 border-b border-outline focus:border-primary focus:ring-0 transition-all px-4 py-3 rounded-t-lg text-[13px] resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5">Slots</label>
            <input type="number" min={0} value={form.slots}
              onChange={(e) => set("slots", parseInt(e.target.value) || 0)}
              className="w-full bg-white border-0 border-b border-outline focus:border-primary focus:ring-0 transition-all px-4 py-3 rounded-t-lg text-[13px]" />
            <p className="text-[10px] text-outline mt-1 italic px-1">0 = Unlimited slots</p>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5">Badge Earned</label>
            <select value={form.badge_type} onChange={(e) => set("badge_type", e.target.value)}
              className="w-full bg-white border-0 border-b border-outline focus:border-primary focus:ring-0 transition-all px-4 py-3 rounded-t-lg text-[13px]">
              {BADGE_OPTIONS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5">Skills Needed</label>
          <div className="flex flex-wrap gap-2 p-3 bg-white rounded-t-lg border-b border-outline min-h-[44px]">
            {form.skills.map((skill) => (
              <span key={skill} className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {skill}
                <button onClick={() => set("skills", form.skills.filter((s) => s !== skill))}
                  className="material-symbols-outlined text-[13px]">close</button>
              </span>
            ))}
            <input
              type="text" value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              placeholder="Add skill... (Enter)"
              className="border-0 focus:ring-0 p-0 text-[12px] bg-transparent flex-1 min-w-[80px]"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={creating || updating}
          className="flex-1 bg-primary text-on-primary rounded-full py-3 font-bold text-[13px] shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60">
          {creating || updating ? "Saving..." : editing ? "Update Role" : "Save Role"}
        </button>
        <button onClick={onCancel}
          className="px-5 py-3 border border-outline/25 text-on-surface rounded-full text-[13px] font-semibold hover:bg-surface-container transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   RIGHT PANEL — APPLICANTS + ROSTER TABS
───────────────────────────────────────────────────────────────── */

function RightPanel({
  eventId, roles, selectedRoleId,
}: {
  eventId: string;
  roles: AvailableVolunteerRole[];
  selectedRoleId: string | null;
}) {
  const qc = useQueryClient();
  const [panelTab, setPanelTab] = useState<"applicants" | "roster">("applicants");
  const [roleFilter, setRoleFilter] = useState(selectedRoleId ?? "all");
  const [assignTarget, setAssignTarget] = useState<MockApplicant | null>(null);

  const { data: rosterData } = useAssignedRoster(eventId);
  const roster: AssignedVolunteer[] = rosterData?.data ?? MOCK_ASSIGNED;
  const { mutateAsync: awardAll, isPending: awarding } = useAwardBadge(eventId);

  // When selectedRoleId changes externally, update filter
  React.useEffect(() => {
    if (selectedRoleId) setRoleFilter(selectedRoleId);
  }, [selectedRoleId]);

  const filteredApplicants = roleFilter === "all"
    ? MOCK_APPLICANTS
    : MOCK_APPLICANTS.filter((a) => a.role_id === roleFilter);

  const filteredRoster = roleFilter === "all"
    ? roster
    : roster.filter((a) => a.role_id === roleFilter);

  const assignTargetRole = roles.find((r) => r.role_id === assignTarget?.role_id) ?? null;

  const totalPending  = MOCK_APPLICANTS.filter((a) => a.status === "applied").length;
  const totalAssigned = roster.length;

  return (
    <>
      <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden sticky top-6">
        {/* Tab header */}
        <div className="flex border-b border-outline/10 px-5 pt-5">
          <button onClick={() => setPanelTab("applicants")}
            className={`pb-3.5 px-4 text-[13px] font-semibold border-b-2 transition-all ${
              panelTab === "applicants" ? "border-primary text-primary font-bold" : "border-transparent text-outline hover:text-primary"
            }`}>
            Applicants
            {totalPending > 0 && (
              <span className="ml-1.5 text-[10px] bg-primary text-on-primary rounded-full w-4 h-4 inline-flex items-center justify-center font-bold">
                {totalPending}
              </span>
            )}
          </button>
          <button onClick={() => setPanelTab("roster")}
            className={`pb-3.5 px-4 text-[13px] font-semibold border-b-2 transition-all ${
              panelTab === "roster" ? "border-primary text-primary font-bold" : "border-transparent text-outline hover:text-primary"
            }`}>
            Assigned Roster
            <span className="ml-1.5 text-[10px] text-outline">({totalAssigned})</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Role filter */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-on-surface-variant font-semibold whitespace-nowrap">
              Filter by Role:
            </span>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 bg-surface-container-low border-0 rounded-full px-4 py-2 text-[12px] focus:ring-1 focus:ring-primary font-semibold">
              <option value="all">All Roles</option>
              {roles.map((r) => {
                const count = panelTab === "applicants"
                  ? MOCK_APPLICANTS.filter((a) => a.role_id === r.role_id).length
                  : roster.filter((a) => a.role_id === r.role_id).length;
                return (
                  <option key={r.role_id} value={r.role_id}>
                    {r.role_name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <AnimatePresence mode="wait">
            {panelTab === "applicants" ? (
              <motion.div key="applicants"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} className="space-y-4"
              >
                {filteredApplicants.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-outline text-4xl block mb-2">person_search</span>
                    <p className="text-[13px] text-on-surface-variant font-semibold">No applicants for this role yet</p>
                  </div>
                ) : (
                  filteredApplicants.map((app) => {
                    const appRole = roles.find((r) => r.role_id === app.role_id);
                    return (
                      <div key={app.application_id}
                        className="p-4 border border-outline/10 rounded-2xl hover:bg-surface-container-low/40 transition-colors">
                        {/* Applicant header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[12px] shrink-0">
                            {getInitials(app.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-on-surface text-[13px] truncate">{app.name}</h4>
                              <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-0.5 rounded shrink-0">
                                {timeAgo(app.applied_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-primary font-bold mt-0.5">
                              <span className="material-symbols-outlined text-[13px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                              {app.badges_earned} Badges Earned
                            </div>
                          </div>
                        </div>

                        {/* Role chip */}
                        {roleFilter === "all" && appRole && (
                          <span className="inline-block mb-2 px-2.5 py-0.5 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] font-bold">
                            {appRole.role_name}
                          </span>
                        )}

                        {/* Message */}
                        <div className="bg-surface-container-low border-l-4 border-primary/25 p-3 rounded-r-xl mb-3 italic text-[12px] text-on-surface-variant">
                          "{app.message}"
                        </div>

                        {/* Status + assign */}
                        <div className="flex items-center justify-between">
                          <span className="bg-primary-fixed text-on-primary-fixed-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                            Applied
                          </span>
                          <button onClick={() => setAssignTarget(app)}
                            className="bg-primary text-on-primary rounded-full px-5 py-1.5 text-[12px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all">
                            Assign
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div key="roster"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} className="space-y-3"
              >
                {/* Award badges CTA */}
                {filteredRoster.some((v) => !v.badge_awarded) && (
                  <button onClick={async () => { await awardAll({}); toast.success("Badges awarded!"); qc.invalidateQueries(); }}
                    disabled={awarding}
                    className="w-full flex items-center justify-center gap-2 border border-primary text-primary py-2.5 rounded-full text-[12px] font-bold hover:bg-primary/5 transition-colors disabled:opacity-60">
                    <span className="material-symbols-outlined text-[16px]">military_tech</span>
                    {awarding ? "Awarding..." : "Award All Pending Badges"}
                  </button>
                )}

                {filteredRoster.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-outline text-4xl block mb-2">group</span>
                    <p className="text-[13px] text-on-surface-variant font-semibold">No volunteers assigned yet</p>
                  </div>
                ) : (
                  filteredRoster.map((vol) => (
                    <div key={vol.assignment_id}
                      className="flex items-center gap-3 p-3 border border-outline/10 rounded-xl hover:bg-surface-container-low/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[11px] shrink-0">
                        {vol.avatar_url
                          ? <img src={vol.avatar_url} className="w-full h-full object-cover rounded-full" />
                          : getInitials(vol.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-on-surface truncate">{vol.name}</p>
                        <p className="text-[11px] text-outline">{vol.role_name}</p>
                      </div>
                      {vol.badge_awarded ? (
                        <span className="flex items-center gap-1 text-[10px] text-on-primary-fixed-variant bg-primary-fixed px-2 py-0.5 rounded-full font-bold">
                          <span className="material-symbols-outlined text-[12px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                          Awarded
                        </span>
                      ) : (
                        <span className="text-[10px] text-outline bg-surface-container px-2 py-0.5 rounded-full font-semibold">
                          Pending Badge
                        </span>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Assign modal */}
      <AssignVolunteerModal
        applicant={assignTarget}
        role={assignTargetRole}
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        onSuccess={() => {
          setAssignTarget(null);
          qc.invalidateQueries({ queryKey: ["volunteer-roles", eventId] });
          qc.invalidateQueries({ queryKey: ["assigned-roster", eventId] });
        }}
        eventId={eventId}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

export default function AdminVolunteersPage() {
  const { activeEvent } = useEventStore();
  const eventId = activeEvent?.event_id ?? "";
  const qc = useQueryClient();

  const [showForm, setShowForm]       = useState(false);
  const [editingRole, setEditingRole] = useState<AvailableVolunteerRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const { data: rolesData, isLoading: rolesLoading } = useVolunteerRoles(eventId);
  const roles: AvailableVolunteerRole[] = rolesData?.data ?? MOCK_ROLES;

  const totalAssigned = MOCK_ASSIGNED.length;
  const totalPending  = MOCK_APPLICANTS.filter((a) => a.status === "applied").length;

  const handleDeleteRole = (roleId: string) => {
    toast.success("Role deleted.");
    qc.invalidateQueries({ queryKey: ["volunteer-roles", eventId] });
  };

  const handleEditRole = (role: AvailableVolunteerRole) => {
    setEditingRole(role);
    setShowForm(true);
  };

  return (
    <>
      <AdminTopBar
        breadcrumbs={[
          { label: "My Events", href: "/admin/events" },
          { label: "Volunteers" },
        ]}
      />

      <ActiveEventBanner pageName="volunteers" />

      {!activeEvent ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <span className="material-symbols-outlined text-outline text-[48px] mb-4">volunteer_activism</span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface mb-2">
            No event selected
          </h2>
          <p className="text-[13px] text-outline max-w-xs">
            Go to My Events and select an event to manage volunteer roles.
          </p>
        </div>
      ) : (
        <div className="px-6 pt-6 pb-16 max-w-[1200px] mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div className="space-y-2">
              <nav className="flex items-center gap-1 text-[11px] text-outline">
                <span>{activeEvent.title}</span>
                <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                <span className="text-primary font-bold">Volunteer Roles</span>
              </nav>
              <h1 className="font-['Plus_Jakarta_Sans'] text-[24px] font-extrabold text-primary">
                Role Management
              </h1>
              <div className="flex flex-wrap items-center gap-5 text-[12px] text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  {totalAssigned} volunteers assigned
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">assignment</span>
                  {roles.length} roles defined
                </span>
                <span className="flex items-center gap-1.5 text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                  {totalPending} applicants pending
                </span>
              </div>
            </div>
            <button onClick={() => { setEditingRole(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-primary text-on-primary rounded-full px-6 py-2.5 font-bold text-[13px] hover:opacity-90 active:scale-95 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Role
            </button>
          </div>

          {/* ── 12-col grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ── LEFT: Roles + form (7 cols) ── */}
            <div className="lg:col-span-7 space-y-5">

              {/* Role cards */}
              {rolesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-outline/10 h-48 animate-pulse" />
                ))
              ) : roles.length === 0 ? (
                <div className="bg-white rounded-2xl border border-outline/10 py-16 text-center">
                  <span className="material-symbols-outlined text-outline text-[40px] block mb-2">volunteer_activism</span>
                  <p className="text-[13px] text-on-surface-variant font-semibold mb-3">No roles defined yet</p>
                  <button onClick={() => setShowForm(true)}
                    className="px-5 py-2 bg-primary text-on-primary rounded-full text-[13px] font-bold">
                    Create First Role
                  </button>
                </div>
              ) : (
                roles.map((role) => {
                  const count = MOCK_APPLICANTS.filter((a) => a.role_id === role.role_id && a.status === "applied").length;
                  return (
                    <RoleCard key={role.role_id}
                      role={role}
                      applicantCount={count}
                      onViewApplicants={() => setSelectedRole(role.role_id)}
                      onDelete={() => handleDeleteRole(role.role_id)}
                      onEdit={() => handleEditRole(role)}
                    />
                  );
                })
              )}

              {/* Create / Edit form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <RoleForm
                      eventId={eventId}
                      editing={editingRole}
                      onCancel={() => { setShowForm(false); setEditingRole(null); }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT: Applicants + Roster panel (5 cols) ── */}
            <div className="lg:col-span-5">
              <RightPanel
                eventId={eventId}
                roles={roles}
                selectedRoleId={selectedRole}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}