"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCreateEvent } from "@/hooks/useEvents";
import { EventLocationMap } from "@/components/admin/event-form/EventLocationMap";

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */

type Step = 1 | 2 | 3 | 4;
type EventType = "masjid" | "hangout" | "club";
type Visibility = "public" | "invite_only" | "approval_required" | "private";
type Gender = "NO_RESTRICTION" | "MALE_ONLY" | "FEMALE_ONLY";
type PublishMode = "now" | "schedule";

interface FormData {
  /* Step 1 */
  event_type: EventType;
  masjid_affiliation: string;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  livestream_url: string;
  /* Step 2 */
  visibility: Visibility;
  capacity: number;
  gender_restriction: Gender;
  requires_rsvp: boolean;
  /* Step 3 */
  is_beginner_friendly: boolean;
  host_a_revert: boolean;
  revert_welcome_message: string;
  tags: string[];
  enable_volunteer_roles: boolean;
  /* Step 4 */
  publish_mode: PublishMode;
  schedule_date: string;
  schedule_time: string;
}

const INITIAL: FormData = {
  event_type: "masjid",
  masjid_affiliation: "",
  title: "",
  description: "",
  start_date: "",
  start_time: "",
  end_date: "",
  end_time: "",
  location_name: "",
  address: "",
  latitude: undefined,
  longitude: undefined,
  livestream_url: "",
  visibility: "public",
  capacity: 50,
  gender_restriction: "NO_RESTRICTION",
  requires_rsvp: true,
  is_beginner_friendly: false,
  host_a_revert: false,
  revert_welcome_message: "",
  tags: [],
  enable_volunteer_roles: false,
  publish_mode: "now",
  schedule_date: "",
  schedule_time: "",
};

const ALL_TAGS = [
  "Sports", "Education", "Community", "Fundraising",
  "Youth", "Sisters Only", "Ramadan", "Lectures",
  "Health", "Arts", "Technology", "Revert Support",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (eventId: string) => void;
}

/* ─────────────────────────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────────────────────────── */

const STEPS = [
  { n: 1, label: "Basic Info" },
  { n: 2, label: "Access" },
  { n: 3, label: "Settings" },
  { n: 4, label: "Review" },
];

function Stepper({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((s, i) => {
        const done   = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done   ? "bg-primary-fixed text-primary" :
                active ? "bg-primary text-on-primary ring-4 ring-primary/20" :
                         "bg-surface-container-high text-outline"
              }`}>
                {done
                  ? <span className="material-symbols-outlined text-[16px]">check</span>
                  : s.n}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
                active ? "text-primary" : done ? "text-primary" : "text-outline"
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 mb-4 mx-1 ${s.n < current ? "bg-primary" : "bg-outline/20"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   REUSABLE FIELD COMPONENTS
───────────────────────────────────────────────────────────────── */

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-outline/10 shadow-sm p-5 space-y-4 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[13px] font-bold text-on-surface mb-1.5">
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-outline ${props.className ?? ""}`}
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none placeholder:text-outline ${props.className ?? ""}`}
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-surface-container-highest"}`}
    >
      <motion.div
        className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STEP 1 — BASIC INFO
───────────────────────────────────────────────────────────────── */

function Step1({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const EVENT_TYPES: { id: EventType; icon: string; label: string }[] = [
    { id: "masjid",  icon: "mosque",       label: "Masjid" },
    { id: "hangout", icon: "celebration",  label: "Hangout" },
    { id: "club",    icon: "hub",          label: "Club" },
  ];

  return (
    <div className="space-y-5">
      {/* Event type */}
      <div>
        <Label>Event Type</Label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container-low rounded-xl">
          {EVENT_TYPES.map((t) => (
            <button key={t.id} type="button"
              onClick={() => set("event_type", t.id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-[12px] font-bold transition-all ${
                form.event_type === t.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Basic details */}
      <SectionCard>
        <div>
          <Label>Masjid Affiliation</Label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <Input
              type="text"
              className="pl-10"
              placeholder="Search for your Masjid..."
              value={form.masjid_affiliation}
              onChange={(e) => set("masjid_affiliation", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label required>Event Title</Label>
          <Input
            type="text"
            placeholder="e.g. Annual Eid Community Gathering 1447H"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            rows={4}
            placeholder="Share more details about what attendees can expect..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </SectionCard>

      {/* Schedule */}
      <SectionCard>
        <h3 className="font-bold text-primary text-[14px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">schedule</span>
          Schedule
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </div>
          <div>
            <Label>Start Time</Label>
            <Input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </div>
          <div>
            <Label>End Time</Label>
            <Input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} />
          </div>
        </div>
      </SectionCard>

      {/* Location */}
      <SectionCard>
        <h3 className="font-bold text-primary text-[14px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">near_me</span>
          Venue & Location
        </h3>
        <div>
          <Label required>Location Name</Label>
          <Input
            type="text"
            placeholder="e.g. Main Prayer Hall or Central Park"
            value={form.location_name}
            onChange={(e) => set("location_name", e.target.value)}
          />
        </div>
        <div>
          <Label>Address</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">location_on</span>
              <Input
                type="text"
                className="pl-10"
                placeholder="Street address..."
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
            <button type="button"
              onClick={() => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  const { latitude, longitude } = pos.coords;
                  set("latitude" as keyof FormData, latitude);
                  set("longitude" as keyof FormData, longitude);
                  // Reverse geocode to get address
                  try {
                    const res = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                      { headers: { "User-Agent": "EventsMasjidsIO/1.0" } }
                    );
                    const data = await res.json();
                    if (data.display_name) {
                      set("address", data.display_name);
                    }
                  } catch {}
                });
              }}
              className="px-4 bg-secondary-container text-on-secondary-container rounded-xl hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[20px]">my_location</span>
            </button>
          </div>
        </div>
        {/* Live Leaflet Map — updates automatically when address is typed */}
        <EventLocationMap
          address={form.address}
          locationName={form.location_name}
          onCoordinatesFound={(lat, lng) => {
            set("latitude" as keyof FormData, lat);
            set("longitude" as keyof FormData, lng);
          }}
          onAddressChange={(addr) => set("address", addr)}
        />
      </SectionCard>

      {/* Media */}
      <SectionCard>
        <div>
          <Label>Event Banner</Label>
          <div className="border-2 border-dashed border-outline/20 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary-fixed/5 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-on-surface">Tap to upload banner</p>
              <p className="text-[11px] text-outline mt-0.5">JPG, PNG up to 10MB (16:9 recommended)</p>
            </div>
          </div>
        </div>
        <div>
          <Label>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">live_tv</span>
              Livestream Link (Optional)
            </span>
          </Label>
          <Input
            type="url"
            placeholder="https://youtube.com/live/..."
            value={form.livestream_url}
            onChange={(e) => set("livestream_url", e.target.value)}
          />
        </div>
      </SectionCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STEP 2 — ACCESS & VISIBILITY
───────────────────────────────────────────────────────────────── */

function Step2({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const VIS_OPTIONS: { id: Visibility; icon: string; label: string; desc: string }[] = [
    { id: "public",            icon: "public",        label: "Public",            desc: "Anyone can see and join this event on the platform." },
    { id: "invite_only",       icon: "link",          label: "Invite Only",       desc: "Only people with the link can view and join." },
    { id: "approval_required", icon: "verified_user", label: "Approval Required", desc: "Users must request access; you approve attendees." },
    { id: "private",           icon: "lock",          label: "Private",           desc: "Hidden from search. You must explicitly add attendees." },
  ];

  return (
    <div className="space-y-5">
      {/* Warning banner */}
      <AnimatePresence>
        {form.visibility === "private" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 bg-secondary-container/30 border-l-4 border-secondary rounded-xl"
          >
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">warning</span>
            <p className="text-[13px] text-secondary font-semibold leading-snug">
              Switching to Private will auto-deny pending requests. Current attendees will not be affected.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visibility cards */}
      <div>
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3">Event Visibility</p>
        <div className="space-y-2">
          {VIS_OPTIONS.map((opt) => (
            <button key={opt.id} type="button"
              onClick={() => set("visibility", opt.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                form.visibility === opt.id
                  ? "border-primary/40 bg-surface-container-low shadow-sm"
                  : "border-outline/15 hover:border-outline/30 bg-white"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-on-surface">{opt.label}</p>
                <p className="text-[12px] text-on-surface-variant mt-0.5">{opt.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                form.visibility === opt.id ? "border-primary" : "border-outline/30"
              }`}>
                {form.visibility === opt.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Capacity + Gender + RSVP */}
      <SectionCard>
        {/* Capacity */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold text-on-surface">Event Capacity</p>
            <p className="text-[12px] text-outline mt-0.5">Set 0 for unlimited attendees.</p>
          </div>
          <div className="flex items-center bg-surface-container rounded-full p-1 gap-1">
            <button type="button"
              onClick={() => set("capacity", Math.max(0, form.capacity - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">remove</span>
            </button>
            <span className="w-12 text-center font-bold text-[15px] text-on-surface">
              {form.capacity}
            </span>
            <button type="button"
              onClick={() => set("capacity", form.capacity + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">add</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-outline/10" />

        {/* Gender restriction */}
        <div>
          <p className="text-[13px] font-bold text-on-surface mb-2">Gender Restriction</p>
          <div className="flex p-1 bg-surface-container rounded-full border border-outline/10 gap-0.5">
            {[
              { id: "NO_RESTRICTION" as Gender, label: "No Restriction" },
              { id: "MALE_ONLY" as Gender,      label: "Brothers Only" },
              { id: "FEMALE_ONLY" as Gender,    label: "Sisters Only" },
            ].map((g) => (
              <button key={g.id} type="button"
                onClick={() => set("gender_restriction", g.id)}
                className={`flex-1 text-center py-1.5 px-2 rounded-full text-[12px] font-semibold transition-all ${
                  form.gender_restriction === g.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-outline/10" />

        {/* RSVP toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-on-surface">Requires RSVP</p>
            <p className="text-[12px] text-outline mt-0.5">Track attendees and collect details.</p>
          </div>
          <Toggle checked={form.requires_rsvp} onChange={(v) => set("requires_rsvp", v)} />
        </div>
      </SectionCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STEP 3 — SPECIAL SETTINGS
───────────────────────────────────────────────────────────────── */

function Step3({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const toggleTag = (tag: string) => {
    const current = form.tags;
    set("tags", current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]);
  };

  return (
    <div className="space-y-5">
      {/* Revert-friendly */}
      <SectionCard>
        <div className="flex items-center gap-3 pb-4 border-b border-outline/10">
          <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[20px]">favorite</span>
          </div>
          <h3 className="font-bold text-primary text-[15px]">Revert-Friendly Support</h3>
        </div>

        <div className="space-y-3">
          {/* Beginner friendly */}
          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
            <div>
              <p className="text-[13px] font-bold text-on-surface">Beginner Friendly</p>
              <p className="text-[11px] text-outline mt-0.5">Mark this event as accessible for newcomers.</p>
            </div>
            <Toggle checked={form.is_beginner_friendly} onChange={(v) => set("is_beginner_friendly", v)} />
          </div>

          {/* Host a revert */}
          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
            <div>
              <p className="text-[13px] font-bold text-on-surface">Host a Revert Program</p>
              <p className="text-[11px] text-outline mt-0.5">Dedicated mentors for new Muslims.</p>
            </div>
            <Toggle checked={form.host_a_revert} onChange={(v) => set("host_a_revert", v)} />
          </div>

          {/* Welcome message */}
          <AnimatePresence>
            {form.host_a_revert && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              >
                <Label>Welcome Message</Label>
                <Textarea
                  rows={3}
                  placeholder="Enter a warm message for first-time attendees..."
                  value={form.revert_welcome_message}
                  onChange={(e) => set("revert_welcome_message", e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionCard>

      {/* Event categories */}
      <SectionCard>
        <h3 className="font-bold text-primary text-[13px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">sell</span>
          Event Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => {
            const selected = form.tags.includes(tag);
            return (
              <button key={tag} type="button"
                onClick={() => toggleTag(tag)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                  selected
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {tag}
                {selected && (
                  <span className="material-symbols-outlined text-[14px]">close</span>
                )}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Volunteer roles */}
      <div className="relative bg-white border border-primary/15 rounded-2xl p-5 flex items-center gap-4 overflow-hidden group hover:border-primary/30 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent" />
        <div className="relative w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-[28px]">volunteer_activism</span>
        </div>
        <div className="relative flex-1">
          <h4 className="font-bold text-primary text-[14px]">Volunteer Roles</h4>
          <p className="text-[12px] text-on-surface-variant mt-0.5">Empower your community by creating specific volunteer roles.</p>
          <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-secondary font-semibold bg-secondary-container/30 px-2 py-1 rounded-lg">
            <span className="material-symbols-outlined text-[13px]">info</span>
            You can add volunteer roles after publishing.
          </span>
        </div>
        <span className="relative material-symbols-outlined text-outline/30 group-hover:text-primary/40 transition-colors text-[32px]">
          arrow_forward_ios
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STEP 4 — REVIEW & PUBLISH
───────────────────────────────────────────────────────────────── */

function Step4({
  form, set, onEditStep,
}: {
  form: FormData;
  set: (k: keyof FormData, v: unknown) => void;
  onEditStep: (s: Step) => void;
}) {
  const VIS_LABEL: Record<Visibility, string> = {
    public: "Public (Listed)",
    invite_only: "Invite Only",
    approval_required: "Approval Required",
    private: "Private",
  };

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
        {/* Banner preview */}
        <div className="h-40 bg-gradient-to-br from-primary-fixed to-primary-fixed-dim flex items-end p-4">
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg text-[12px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            Banner Preview
          </span>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Name + type */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-outline/10">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Event Name</p>
                <button type="button" onClick={() => onEditStep(1)}
                  className="text-primary text-[11px] font-bold flex items-center gap-0.5 hover:underline">
                  <span className="material-symbols-outlined text-[13px]">edit</span> Edit
                </button>
              </div>
              <p className="font-bold text-primary text-[14px] leading-snug">
                {form.title || "No title yet"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Type</p>
              <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-[12px] font-bold capitalize">
                {form.event_type}
              </span>
            </div>
          </div>

          {/* Date + visibility + tickets */}
          <div className="grid grid-cols-3 gap-3 pb-4 border-b border-outline/10">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Date & Time</p>
              <p className="text-[12px] text-on-surface flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                {form.start_date || "—"}
              </p>
              <p className="text-[12px] text-on-surface flex items-center gap-1 mt-0.5 font-semibold">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {form.start_time || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Visibility</p>
              <p className="text-[12px] text-on-surface flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">public</span>
                {VIS_LABEL[form.visibility]}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Capacity</p>
              <p className="text-[12px] text-on-surface flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">group</span>
                {form.capacity === 0 ? "Unlimited" : `${form.capacity} spots`}
              </p>
            </div>
          </div>

          {/* Tags */}
          {form.tags.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Categories</p>
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span key={tag} className="bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {form.description && (
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Description</p>
              <p className="text-[12px] text-on-surface-variant leading-relaxed line-clamp-3">
                {form.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Publishing strategy */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-outline/10 space-y-4">
        <h3 className="font-bold text-primary text-[15px]">Publishing Strategy</h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Publish now */}
          <button type="button"
            onClick={() => set("publish_mode", "now")}
            className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all ${
              form.publish_mode === "now"
                ? "border-primary bg-primary-fixed/10"
                : "border-outline/15 bg-white hover:border-outline/30"
            }`}
          >
            <span className="material-symbols-outlined text-primary text-[22px] mb-2">bolt</span>
            <p className={`text-[13px] font-bold mb-1 ${form.publish_mode === "now" ? "text-primary" : "text-on-surface"}`}>
              Publish Now
            </p>
            <p className="text-[11px] text-on-surface-variant leading-snug">
              Make this event visible to the community immediately.
            </p>
            {form.publish_mode === "now" && (
              <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[12px]">check</span>
              </div>
            )}
          </button>

          {/* Schedule */}
          <button type="button"
            onClick={() => set("publish_mode", "schedule")}
            className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all ${
              form.publish_mode === "schedule"
                ? "border-primary bg-primary-fixed/10"
                : "border-outline/15 bg-white hover:border-outline/30"
            }`}
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[22px] mb-2">calendar_month</span>
            <p className={`text-[13px] font-bold mb-1 ${form.publish_mode === "schedule" ? "text-primary" : "text-on-surface"}`}>
              Schedule for Later
            </p>
            <p className="text-[11px] text-on-surface-variant leading-snug">
              Choose a date for this event to automatically go live.
            </p>
            {form.publish_mode === "schedule" && (
              <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[12px]">check</span>
              </div>
            )}
          </button>
        </div>

        {/* Schedule picker */}
        <AnimatePresence>
          {form.publish_mode === "schedule" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <Label>Release Date</Label>
                <Input type="date" value={form.schedule_date} onChange={(e) => set("schedule_date", e.target.value)} />
              </div>
              <div>
                <Label>Release Time</Label>
                <Input type="time" value={form.schedule_time} onChange={(e) => set("schedule_time", e.target.value)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info note */}
        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
          <p className="text-[12px] text-on-surface-variant leading-relaxed">
            Your event will appear in the Masjids.io directory and search results. You can always change visibility later in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SUCCESS STATE
───────────────────────────────────────────────────────────────── */

function SuccessState({ title, onClose, onView }: { title: string; onClose: () => void; onView: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-8 px-4"
    >
      {/* Confetti dots */}
      {[...Array(8)].map((_, i) => (
        <motion.div key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: ["#b3efd4","#f6df83","#002d1f","#97d3b9"][i % 4] }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: (Math.cos((i / 8) * Math.PI * 2)) * 80,
            y: (Math.sin((i / 8) * Math.PI * 2)) * 80,
            opacity: 0,
          }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
      ))}

      {/* Check icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center mb-6"
      >
        <span className="material-symbols-outlined text-primary text-[40px]"
          style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="font-['Plus_Jakarta_Sans'] text-[28px] font-extrabold text-primary mb-2"
      >
        Mubarak! 🎉
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="text-on-surface-variant text-[14px] mb-2"
      >
        <span className="font-semibold text-on-surface">{title}</span> has been published successfully.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-[12px] text-outline mb-8"
      >
        It is now live on the Events.Masjids.io platform.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="flex flex-col gap-2 w-full max-w-xs"
      >
        <button onClick={onView}
          className="w-full py-3 bg-primary text-on-primary rounded-full font-bold text-[14px] hover:opacity-90 active:scale-95 transition-all">
          View Live Event
        </button>
        <button onClick={onClose}
          className="w-full py-3 text-primary font-semibold text-[14px] hover:underline">
          Back to Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────────────────────────────── */

export function CreateEventModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep]       = useState<Step>(1);
  const [form, setForm]       = useState<FormData>(INITIAL);
  const [success, setSuccess] = useState(false);
  const [newEventId, setNewEventId] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();
  const qc        = useQueryClient();
  const { mutateAsync: createEvent, isPending } = useCreateEvent();

  /* Close on ESC */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  /* Reset on open */
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setForm(INITIAL);
      setSuccess(false);
      setNewEventId("");
    }
  }, [isOpen]);

  /* Scroll to top on step change */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const set = (key: keyof FormData, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleClose = () => {
    onClose();
  };

  /* Validation per step */
  const canAdvance = (): boolean => {
    if (step === 1) return form.title.trim().length > 0 && form.location_name.trim().length > 0;
    if (step === 4) return true;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      toast.error("Please fill in the required fields.");
      return;
    }
    if (step < 4) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handlePublish = async () => {
    if (!form.title.trim()) {
      toast.error("Event title is required.");
      return;
    }
    try {
      const res = await createEvent({
        title:                   form.title,
        description:             form.description,
        start_time:              form.start_date && form.start_time
          ? `${form.start_date}T${form.start_time}:00Z`
          : new Date().toISOString(),
        end_time:                form.end_date && form.end_time
          ? `${form.end_date}T${form.end_time}:00Z`
          : undefined,
        location_name:           form.location_name,
        address:                 form.address || undefined,
        latitude:                form.latitude,
        longitude:               form.longitude,
        capacity:                form.capacity || undefined,
        has_tickets:             false,
        price:                   0,
        currency:                "USD",
        visibility:              form.visibility,
        gender_restriction:      form.gender_restriction,
        is_beginner_friendly:    form.is_beginner_friendly,
        host_a_revert:           form.host_a_revert,
        revert_welcome_message:  form.revert_welcome_message || undefined,
        tags:                    form.tags,
        enable_volunteer_roles:  form.enable_volunteer_roles,
      });

      const eventId = res?.data?.event_id ?? "evt-new";
      setNewEventId(eventId);
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      onSuccess?.(eventId);
    } catch {
      toast.error("Failed to create event. Please try again.");
    }
  };

  const STEP_LABEL: Record<Step, string> = {
    1: "General Event Details",
    2: "Access & Visibility",
    3: "Special Settings",
    4: "Review & Publish",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl bg-background rounded-2xl shadow-2xl border border-outline/10 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-extrabold text-primary">
                    {success ? "Event Published!" : "Create Event"}
                  </h2>
                  {!success && (
                    <p className="text-[12px] text-outline mt-0.5">Step {step} of 4 · {STEP_LABEL[step]}</p>
                  )}
                </div>
                <button onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-outline text-[22px]">close</span>
                </button>
              </div>

              {/* Stepper */}
              {!success && (
                <div className="px-6 py-3 shrink-0">
                  <Stepper current={step} />
                </div>
              )}

              {/* Scrollable content */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={success ? "success" : step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    {success ? (
                      <SuccessState
                        title={form.title}
                        onClose={handleClose}
                        onView={() => { handleClose(); router.push(`/admin/events/${newEventId}`); }}
                      />
                    ) : step === 1 ? (
                      <Step1 form={form} set={set} />
                    ) : step === 2 ? (
                      <Step2 form={form} set={set} />
                    ) : step === 3 ? (
                      <Step3 form={form} set={set} />
                    ) : (
                      <Step4 form={form} set={set} onEditStep={(s) => setStep(s)} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sticky footer */}
              {!success && (
                <div className="px-6 py-4 border-t border-outline/10 bg-surface-container-low/50 rounded-b-2xl shrink-0 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-outline hidden sm:block">
                    STEP {step} OF 4
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    {/* Cancel / Back */}
                    {step === 1 ? (
                      <button type="button" onClick={handleClose}
                        className="px-5 py-2.5 border border-outline/25 rounded-full text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
                        Cancel
                      </button>
                    ) : (
                      <button type="button" onClick={handleBack}
                        className="flex items-center gap-1.5 px-5 py-2.5 border border-outline/25 rounded-full text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                      </button>
                    )}

                    {/* Save as draft (step 3+) */}
                    {step >= 3 && (
                      <button type="button"
                        className="hidden sm:block px-4 py-2.5 text-[13px] font-semibold text-outline hover:text-primary transition-colors">
                        Save as Draft
                      </button>
                    )}

                    {/* Next / Publish */}
                    {step < 4 ? (
                      <button type="button" onClick={handleNext}
                        className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
                        Next Step
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    ) : (
                      <button type="button" onClick={handlePublish} disabled={isPending}
                        className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-60">
                        {isPending ? (
                          <>
                            <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            Publish Event
                            <span className="material-symbols-outlined text-[18px]">send</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreateEventModal;