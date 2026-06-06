"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEventStore } from "@/store/eventStore";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { ActiveEventBanner } from "@/components/admin/ActiveEventBanner";
import {
  useTicketTiers,
  useAdminPurchases,
} from "@/hooks/useTickets";
import { useCheckIn } from "@/hooks/useCheckIn";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TicketPurchase, PurchaseStatus } from "@/types/tickets";

/* ─────────────────────────────────────────────────────────────────
   LOCAL TYPES — TicketTier (not in global types yet)
───────────────────────────────────────────────────────────────── */

interface TicketTier {
  tier_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  capacity: number;
  sold: number;
  is_active: boolean;
  sale_start?: string;
  sale_end?: string;
}

interface PromoCode {
  promo_id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  usage_count: number;
  usage_limit?: number;
  is_active: boolean;
  expires_at?: string;
  applicable_tiers: string[]; // "all" or tier_ids
}

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA — used until backend endpoints are live
───────────────────────────────────────────────────────────────── */

const MOCK_TIERS: TicketTier[] = [
  {
    tier_id: "tier-001",
    name: "General Admission",
    description: "Standard entry to the event hall and refreshment area. Includes gift bag.",
    price: 25,
    currency: "USD",
    capacity: 500,
    sold: 390,
    is_active: true,
    sale_start: "2026-05-20T08:00:00Z",
    sale_end: "2026-11-01T08:00:00Z",
  },
  {
    tier_id: "tier-002",
    name: "VIP Early Access",
    description: "Premium front-row seating and backstage access with dinner.",
    price: 85,
    currency: "USD",
    capacity: 150,
    sold: 150,
    is_active: false,
    sale_end: "2026-10-25T00:00:00Z",
  },
];

const MOCK_PROMOS: PromoCode[] = [
  {
    promo_id: "promo-001",
    code: "EID2026",
    discount_type: "percentage",
    discount_value: 20,
    usage_count: 14,
    usage_limit: 100,
    is_active: true,
    expires_at: "2026-06-20T00:00:00Z",
    applicable_tiers: ["all"],
  },
  {
    promo_id: "promo-002",
    code: "COMMUNITY",
    discount_type: "fixed",
    discount_value: 5,
    usage_count: 88,
    is_active: true,
    applicable_tiers: ["all"],
  },
];

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */

const PURCHASE_STATUS: Record<PurchaseStatus, { cls: string; label: string }> = {
  completed: { cls: "bg-primary/10 text-primary", label: "Confirmed" },
  pending:   { cls: "bg-secondary-fixed-dim/60 text-secondary", label: "Pending" },
  refunded:  { cls: "bg-tertiary-fixed/60 text-on-tertiary-fixed-variant", label: "Refunded" },
  cancelled: { cls: "bg-error-container text-on-error-container", label: "Cancelled" },
  failed:    { cls: "bg-error-container text-on-error-container", label: "Failed" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ─────────────────────────────────────────────────────────────────
   CREATE TIER DRAWER
───────────────────────────────────────────────────────────────── */

interface TierForm {
  name: string;
  description: string;
  price: string;
  currency: string;
  capacity: number;
  max_per_order: number;
}

const TIER_INITIAL: TierForm = {
  name: "", description: "", price: "0",
  currency: "USD", capacity: 100, max_per_order: 10,
};

function CreateTierDrawer({
  isOpen, onClose, eventId,
}: { isOpen: boolean; onClose: () => void; eventId: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<TierForm>(TIER_INITIAL);
  const price = parseFloat(form.price) || 0;

  const set = (k: keyof TierForm, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Tier name is required."); return; }
    // POST /api/events/:eventId/ticket-tiers (mock)
    toast.success(`Tier "${form.name}" created!`);
    qc.invalidateQueries({ queryKey: ["ticket-tiers", eventId] });
    setForm(TIER_INITIAL);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-outline/10 flex items-center justify-between">
              <h2 className="font-['Plus_Jakarta_Sans'] text-[17px] font-bold text-primary">
                Create Ticket Tier
              </h2>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Tier identity */}
              <section className="space-y-4">
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Tier Identity
                </p>
                <div>
                  <label className="block text-[13px] font-bold text-on-surface mb-1.5">
                    Tier Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. VIP Access"
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-on-surface mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Describe what's included..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </section>

              <div className="h-px bg-outline/10" />

              {/* Pricing */}
              <section className="space-y-4">
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Pricing
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-on-surface mb-1.5">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[13px]">$</span>
                      <input
                        type="number" min={0} step={0.01}
                        value={form.price}
                        onChange={(e) => set("price", e.target.value)}
                        className="w-full pl-7 pr-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-on-surface mb-1.5">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => set("currency", e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] focus:outline-none focus:border-primary transition-all"
                    >
                      <option>USD</option>
                      <option>GBP</option>
                      <option>EUR</option>
                      <option>MYR</option>
                      <option>IDR</option>
                    </select>
                  </div>
                </div>

                {/* Free RSVP notice */}
                <AnimatePresence>
                  {price === 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 bg-primary-fixed/30 p-3 rounded-xl"
                    >
                      <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">info</span>
                      <p className="text-[12px] text-primary font-semibold">
                        This tier will be listed as a <strong>Free RSVP</strong>.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <div className="h-px bg-outline/10" />

              {/* Inventory */}
              <section className="space-y-4">
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Inventory
                </p>
                {[
                  { label: "Total Capacity", key: "capacity" as keyof TierForm },
                  { label: "Max per Order",  key: "max_per_order" as keyof TierForm },
                ].map(({ label, key }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-on-surface">{label}</span>
                    <div className="flex items-center bg-surface-container rounded-full p-1 gap-1">
                      <button type="button"
                        onClick={() => set(key, Math.max(1, (form[key] as number) - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-primary text-[18px]">remove</span>
                      </button>
                      <span className="w-12 text-center font-bold text-[15px]">
                        {form[key] as number}
                      </span>
                      <button type="button"
                        onClick={() => set(key, (form[key] as number) + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-primary text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </section>

              <div className="h-px bg-outline/10" />

              {/* Live preview */}
              <section className="space-y-3">
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Attendee View Preview
                </p>
                <div className="bg-surface-container-low rounded-2xl p-5 border border-outline/10">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-[15px]">
                      {form.name || "New Tier"}
                    </p>
                    <div className="w-10 h-6 bg-primary rounded-full relative shrink-0">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <p className="text-[12px] text-outline mb-3 line-clamp-2">
                    {form.description || "Tier description will appear here..."}
                  </p>
                  <div className="h-1.5 w-full bg-surface-container rounded-full mb-3" />
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-[22px]">
                        {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                      </p>
                      <p className="text-[11px] text-outline">0 / {form.capacity} sold</p>
                    </div>
                    <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      On Sale
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline/10 bg-surface-container-low/30 flex gap-3">
              <button onClick={handleCreate}
                className="flex-1 py-3 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
                Create Tier
              </button>
              <button onClick={onClose}
                className="flex-1 py-3 bg-surface-container text-on-surface rounded-full text-[13px] font-semibold hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CREATE PROMO CODE FORM (sheet/drawer)
───────────────────────────────────────────────────────────────── */

interface PromoForm {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  has_limit: boolean;
  usage_limit: number;
  applicable_tiers: string;
}

const PROMO_INITIAL: PromoForm = {
  code: "", discount_type: "percentage", discount_value: "20",
  has_limit: false, usage_limit: 100, applicable_tiers: "all",
};

function CreatePromoDrawer({
  isOpen, onClose, eventId, tiers,
}: {
  isOpen: boolean; onClose: () => void;
  eventId: string; tiers: TicketTier[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<PromoForm>(PROMO_INITIAL);
  const val = parseFloat(form.discount_value) || 0;

  const set = (k: keyof PromoForm, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const autoGenerate = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    set("code", code);
  };

  const handleCreate = () => {
    if (!form.code.trim()) { toast.error("Promo code is required."); return; }
    toast.success(`Promo code "${form.code}" created!`);
    qc.invalidateQueries({ queryKey: ["promo-codes", eventId] });
    setForm(PROMO_INITIAL);
    onClose();
  };

  const discountLabel = form.discount_type === "percentage"
    ? `${val}% off`
    : `$${val.toFixed(2)} off`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-outline/10 flex items-center justify-between">
              <h2 className="font-['Plus_Jakarta_Sans'] text-[17px] font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Create Promo Code
              </h2>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Code field */}
              <section className="space-y-3">
                <label className="block text-[13px] font-bold text-on-surface">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => set("code", e.target.value.toUpperCase())}
                    placeholder="e.g. SAVE20"
                    className="flex-1 px-4 py-2.5 font-mono font-bold uppercase bg-surface-container-low border border-outline/20 rounded-xl text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all tracking-widest"
                  />
                  <button onClick={autoGenerate}
                    className="px-4 bg-primary-fixed text-primary rounded-xl hover:bg-primary-fixed-dim transition-colors"
                    title="Auto-generate">
                    <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
                  </button>
                </div>
                {form.code && (
                  <p className="text-[11px] text-outline">
                    Preview: <span className="font-mono font-bold text-secondary bg-secondary-container/40 px-2 py-0.5 rounded">{form.code}</span>
                  </p>
                )}
              </section>

              {/* Discount type + amount */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-on-surface">Discount Amount</label>
                  <div className="flex bg-surface-container p-1 rounded-lg gap-0.5">
                    {(["percentage", "fixed"] as const).map((t) => (
                      <button key={t} type="button"
                        onClick={() => set("discount_type", t)}
                        className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all ${
                          form.discount_type === t
                            ? "bg-white text-primary shadow-sm"
                            : "text-outline"
                        }`}>
                        {t === "percentage" ? "%" : "$"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number" min={0}
                    value={form.discount_value}
                    onChange={(e) => set("discount_value", e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[20px] font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline font-bold text-[13px]">
                    {form.discount_type === "percentage" ? "%" : "USD"}
                  </span>
                </div>
                {val > 0 && (
                  <div className="flex items-start gap-2 bg-primary-fixed/20 p-3 rounded-xl">
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">info</span>
                    <p className="text-[12px] text-primary font-semibold">
                      A <strong>{discountLabel}</strong> will be applied.{" "}
                      {form.discount_type === "percentage" && val > 0 && (
                        <span className="text-primary/70">e.g. $25 ticket → ${(25 * (1 - val / 100)).toFixed(2)} after discount</span>
                      )}
                    </p>
                  </div>
                )}
              </section>

              {/* Applicable tiers */}
              <section className="space-y-3">
                <label className="block text-[13px] font-bold text-on-surface">Applicable Tiers</label>
                <div className="flex flex-wrap gap-2">
                  <button type="button"
                    onClick={() => set("applicable_tiers", "all")}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                      form.applicable_tiers === "all"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                    }`}>
                    All Tiers
                  </button>
                  {tiers.map((t) => (
                    <button key={t.tier_id} type="button"
                      onClick={() => set("applicable_tiers", t.tier_id)}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                        form.applicable_tiers === t.tier_id
                          ? "bg-primary text-on-primary shadow-sm"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                      }`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Usage limit */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-on-surface">Usage Limit</label>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    form.has_limit
                      ? "bg-surface-container text-on-surface-variant"
                      : "bg-primary-fixed text-primary"
                  }`}>
                    {form.has_limit ? `Max ${form.usage_limit} uses` : "Unlimited uses"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => set("has_limit", !form.has_limit)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.has_limit ? "bg-primary" : "bg-surface-container-highest"
                    }`}>
                    <motion.div
                      className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm"
                      animate={{ x: form.has_limit ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                  <span className="text-[13px] text-on-surface-variant">Enable usage cap</span>
                </div>
                <AnimatePresence>
                  {form.has_limit && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <input
                        type="number" min={1}
                        value={form.usage_limit}
                        onChange={(e) => set("usage_limit", parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="Max number of uses"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Live preview card */}
              <section className="space-y-2">
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Card Preview</p>
                <div className="bg-white border border-outline/15 rounded-xl p-4 flex items-center justify-between overflow-hidden relative">
                  <div className="flex flex-col gap-1.5 z-10">
                    <div className="flex items-center gap-2">
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[17px] text-on-surface tracking-tight">
                        {form.code || "CODE"}
                      </span>
                      <span className="material-symbols-outlined text-outline text-[16px]">content_copy</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[12px] font-semibold text-primary">
                        {val > 0 ? `${discountLabel} · ${form.applicable_tiers === "all" ? "All tiers" : tiers.find(t => t.tier_id === form.applicable_tiers)?.name ?? "Selected tier"}` : "No discount set"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-primary-fixed text-primary px-2.5 py-1 rounded-lg tracking-wider z-10">
                    Active
                  </span>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline/10 bg-surface-container-low/30 flex flex-col gap-2">
              <button onClick={handleCreate}
                className="w-full py-3 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
                Create Promo Code
              </button>
              <button onClick={onClose}
                className="w-full py-2.5 text-outline text-[13px] font-semibold hover:text-primary transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PURCHASE DETAIL DRAWER
───────────────────────────────────────────────────────────────── */

function PurchaseDetailDrawer({
  purchase, isOpen, onClose, eventId,
}: {
  purchase: TicketPurchase | null;
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}) {
  const qc = useQueryClient();
  const { mutateAsync: checkIn, isPending: checkingIn } = useCheckIn(eventId);

  const handleCheckIn = async () => {
    if (!purchase) return;
    await checkIn({ rsvp_id: purchase.ticket_id });
    toast.success(`${purchase.buyer_name} checked in!`);
    qc.invalidateQueries({ queryKey: ["admin-purchases", eventId] });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && purchase && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-outline/10 flex items-center justify-between">
              <h2 className="font-['Plus_Jakarta_Sans'] text-[17px] font-bold text-primary">
                Purchase Detail
              </h2>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Buyer */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[18px] shrink-0">
                  {purchase.buyer_avatar
                    ? <img src={purchase.buyer_avatar} className="w-full h-full object-cover rounded-full" />
                    : getInitials(purchase.buyer_name)}
                </div>
                <div>
                  <p className="font-bold text-on-surface text-[16px]">{purchase.buyer_name}</p>
                  <p className="text-[12px] text-outline">{purchase.buyer_email}</p>
                </div>
                <div className="ml-auto">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    PURCHASE_STATUS[purchase.status]?.cls ?? ""
                  }`}>
                    {PURCHASE_STATUS[purchase.status]?.label ?? purchase.status}
                  </span>
                </div>
              </div>

              <div className="h-px bg-outline/10" />

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Tier",           value: purchase.tier_name },
                  { label: "Amount Paid",    value: formatCurrency(purchase.amount_paid, purchase.currency) },
                  { label: "Quantity",       value: `${purchase.quantity} ticket${purchase.quantity > 1 ? "s" : ""}` },
                  { label: "Purchased",      value: formatDate(purchase.purchased_at) },
                  { label: "Promo Used",     value: purchase.promo_code_used ?? "—" },
                  { label: "Discount",       value: purchase.discount_amount ? formatCurrency(purchase.discount_amount, purchase.currency) : "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-[13px] font-semibold text-on-surface">{value}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-outline/10" />

              {/* Check-in status */}
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-3">Check-in Status</p>
                {purchase.checked_in ? (
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <div>
                      <p className="text-[13px] font-bold">Checked In</p>
                      {purchase.checked_in_at && (
                        <p className="text-[11px] text-outline">{formatDate(purchase.checked_in_at)}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-outline">
                    <span className="material-symbols-outlined text-[22px]">radio_button_unchecked</span>
                    <p className="text-[13px]">Not yet checked in</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-outline/10 bg-surface-container-low/30 space-y-2">
              {!purchase.checked_in && purchase.status === "completed" && (
                <button onClick={handleCheckIn} disabled={checkingIn}
                  className="w-full py-3 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                  {checkingIn ? (
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                  )}
                  {checkingIn ? "Checking in..." : "Manual Check-in"}
                </button>
              )}
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 border border-outline/20 rounded-full text-[13px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
                  View Full History
                </button>
                {purchase.status === "completed" && (
                  <button className="flex-1 py-2.5 bg-error/10 text-error rounded-full text-[13px] font-semibold hover:bg-error/15 transition-colors">
                    Cancel & Refund
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

type PurchaseTab = "all" | "completed" | "pending" | "refunded";

export default function AdminTicketsPage() {
  const { activeEvent } = useEventStore();
  const eventId = activeEvent?.event_id ?? "";

  const [tierDrawer, setTierDrawer]       = useState(false);
  const [promoDrawer, setPromoDrawer]     = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<TicketPurchase | null>(null);
  const [purchaseTab, setPurchaseTab]     = useState<PurchaseTab>("all");
  const [search, setSearch]               = useState("");

  // Hooks
  const { data: tiersData, isLoading: tiersLoading } = useTicketTiers(eventId);
  const { data: purchasesData, isLoading: purchasesLoading } = useAdminPurchases(eventId);

  // Use mock data as fallback
  const tiers: TicketTier[]       = tiersData?.data ?? MOCK_TIERS;
  const purchases: TicketPurchase[] = purchasesData?.data ?? [];
  const promos: PromoCode[]        = MOCK_PROMOS;

  // Stats derived from purchases
  const totalRevenue = purchases
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + p.amount_paid, 0);
  const totalSold    = purchases.filter((p) => p.status === "completed").length;
  const totalCap     = tiers.reduce((s, t) => s + t.capacity, 0);
  const totalRefunds = purchases.filter((p) => p.status === "refunded").length;
  const refundAmount = purchases
    .filter((p) => p.status === "refunded")
    .reduce((s, p) => s + p.amount_paid, 0);

  // Filter purchases
  const filtered = purchases.filter((p) => {
    const matchTab    = purchaseTab === "all" || p.status === purchaseTab;
    const matchSearch = !search ||
      p.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      p.buyer_email.toLowerCase().includes(search.toLowerCase()) ||
      p.tier_name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const TABS: { id: PurchaseTab; label: string }[] = [
    { id: "all",       label: "All" },
    { id: "completed", label: "Confirmed" },
    { id: "pending",   label: "Pending" },
    { id: "refunded",  label: "Refunded" },
  ];

  return (
    <>
      <AdminTopBar
        breadcrumbs={[
          { label: "My Events", href: "/admin/events" },
          { label: "Tickets" },
        ]}
      />

      {/* Active event banner */}
      <ActiveEventBanner pageName="tickets" />

      {/* ── Empty state if no event selected ── */}
      {!activeEvent ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <span className="material-symbols-outlined text-outline text-[48px] mb-4">local_activity</span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface mb-2">
            No event selected
          </h2>
          <p className="text-[13px] text-outline max-w-xs">
            Go to My Events and select an event to manage its tickets, tiers, and promo codes.
          </p>
        </div>
      ) : (
        <div className="px-6 pt-6 pb-16 max-w-[1200px] mx-auto space-y-6">

          {/* ── Revenue summary strip ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex flex-col sm:flex-row gap-6 divide-y sm:divide-y-0 sm:divide-x divide-outline/10 w-full sm:w-auto">
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="font-['Plus_Jakarta_Sans'] text-[26px] font-extrabold text-primary">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="sm:pl-6 pt-3 sm:pt-0">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Sold Tickets</p>
                <p className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-on-surface">
                  {totalSold}{" "}
                  <span className="text-[14px] font-normal text-outline">/ {totalCap} total</span>
                </p>
              </div>
              <div className="sm:pl-6 pt-3 sm:pt-0">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Refunds</p>
                <p className="text-error font-semibold text-[14px]">
                  {totalRefunds} refunded{" "}
                  <span className="text-outline text-[12px]">· {formatCurrency(refundAmount)}</span>
                </p>
              </div>
            </div>
            <button className="text-primary text-[13px] font-bold hover:underline flex items-center gap-1 shrink-0">
              View Full Report
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </motion.div>

          {/* ── Two-column layout ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ── LEFT: Ticket Tiers (8 cols) ── */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-extrabold text-primary">
                  Ticket Tiers
                </h2>
                <button
                  onClick={() => setTierDrawer(true)}
                  className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Tier
                </button>
              </div>

              {tiersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-outline/10 p-5 h-48 animate-pulse" />
                  ))}
                </div>
              ) : tiers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-outline/10 p-10 text-center">
                  <span className="material-symbols-outlined text-outline text-[40px] block mb-2">
                    confirmation_number
                  </span>
                  <p className="text-on-surface-variant text-[13px] font-semibold mb-3">No ticket tiers yet</p>
                  <button onClick={() => setTierDrawer(true)}
                    className="px-5 py-2 bg-primary text-on-primary rounded-full text-[13px] font-bold">
                    Create First Tier
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tiers.map((tier, i) => {
                    const pct = Math.min(Math.round((tier.sold / tier.capacity) * 100), 100);
                    const soldOut = tier.sold >= tier.capacity;
                    return (
                      <motion.div
                        key={tier.tier_id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className={`relative bg-white rounded-2xl border border-outline/10 shadow-sm p-5 overflow-hidden group transition-shadow hover:shadow-md ${
                          !tier.is_active ? "opacity-70" : ""
                        }`}
                      >
                        {/* Sold out overlay */}
                        {soldOut && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="border-4 border-error text-error text-[14px] font-extrabold px-5 py-2 rounded-lg opacity-40 -rotate-12">
                              SOLD OUT
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-3">
                            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-on-surface leading-snug">
                              {tier.name}
                            </h3>
                            <p className="text-[11px] text-outline mt-0.5 line-clamp-2">
                              {tier.description}
                            </p>
                          </div>
                          {/* Active toggle */}
                          <button
                            className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${
                              tier.is_active ? "bg-primary" : "bg-surface-container-highest"
                            }`}
                          >
                            <motion.div
                              className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm"
                              animate={{ x: tier.is_active ? 16 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </button>
                        </div>

                        {/* Progress */}
                        <div className="mb-4 space-y-1.5">
                          <div className="flex justify-between text-[11px] text-outline font-semibold">
                            <span>{pct}% sold</span>
                            <span>{tier.sold} / {tier.capacity} total</span>
                          </div>
                          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${soldOut ? "bg-error" : "bg-primary"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className={`font-bold ${soldOut ? "text-error" : "text-secondary"}`}>
                              {soldOut ? "Sold out" : `${tier.capacity - tier.sold} available`}
                            </span>
                          </div>
                        </div>

                        {/* Price + status */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary text-[22px] leading-none">
                              {tier.price === 0 ? "Free" : formatCurrency(tier.price, tier.currency)}
                            </p>
                            {tier.sale_end && (
                              <p className="text-[10px] text-outline mt-1">
                                Sale ends: {formatDate(tier.sale_end)}
                              </p>
                            )}
                          </div>
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                            soldOut
                              ? "bg-surface-container-high text-outline"
                              : tier.is_active
                              ? "bg-primary-fixed text-on-primary-fixed-variant"
                              : "bg-surface-container text-outline"
                          }`}>
                            {soldOut ? "Sale Ended" : tier.is_active ? "On Sale" : "Inactive"}
                          </span>
                        </div>

                        {/* Hover actions */}
                        <div className="mt-4 pt-3 border-t border-outline/10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex-1 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[12px] font-semibold rounded-full transition-colors">
                            Edit
                          </button>
                          <button className="flex-1 py-1.5 bg-error/10 hover:bg-error/20 text-error text-[12px] font-semibold rounded-full transition-colors">
                            Deactivate
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── RIGHT: Promo Codes (4 cols) ── */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-extrabold text-primary">
                  Promo Codes
                </h2>
                <button
                  onClick={() => setPromoDrawer(true)}
                  className="flex items-center gap-1.5 bg-secondary text-on-secondary px-4 py-2 rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Create
                </button>
              </div>

              <div className="space-y-3">
                {promos.map((promo, i) => {
                  const pct = promo.usage_limit
                    ? Math.round((promo.usage_count / promo.usage_limit) * 100)
                    : Math.min(promo.usage_count, 100);
                  return (
                    <motion.div
                      key={promo.promo_id}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-2xl border border-outline/10 shadow-sm p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-[16px] text-on-surface tracking-tight">
                            {promo.code}
                          </code>
                          <button
                            onClick={() => { navigator.clipboard.writeText(promo.code); toast.success("Copied!"); }}
                            className="text-outline hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          promo.discount_type === "percentage"
                            ? "bg-primary-fixed text-on-primary-fixed-variant"
                            : "bg-secondary-container text-on-secondary-container"
                        }`}>
                          {promo.discount_type === "percentage"
                            ? `${promo.discount_value}% OFF`
                            : `$${promo.discount_value} OFF`}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">Usage</p>
                            <p className="text-[13px] font-bold text-on-surface mt-0.5">
                              {promo.usage_count}{" "}
                              <span className="text-outline font-normal">
                                / {promo.usage_limit ?? "∞"}
                              </span>
                            </p>
                          </div>
                          {promo.expires_at && (
                            <p className="text-[11px] text-outline">
                              Expires {formatDate(promo.expires_at)}
                            </p>
                          )}
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-secondary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.3 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Recent Purchases Table ────────────────────────── */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-extrabold text-primary">
                Recent Purchases
              </h2>
              {/* Filter tabs */}
              <div className="flex bg-surface-container p-1 rounded-full gap-0.5 overflow-x-auto">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setPurchaseTab(t.id)}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                      purchaseTab === t.id
                        ? "bg-white text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-primary"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or ticket tier..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-outline/15 rounded-full text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-surface-container-low/60 border-b border-outline/10">
                      {["Attendee", "Tier", "Amount", "Promo", "Status", "Checked In", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/5">
                    {purchasesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={7} className="px-5 py-4">
                            <div className="h-4 bg-surface-container animate-pulse rounded w-full" />
                          </td>
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                            receipt_long
                          </span>
                          <p className="text-on-surface-variant text-[13px] font-semibold">
                            No purchases found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((purchase, i) => {
                        const status = PURCHASE_STATUS[purchase.status] ?? PURCHASE_STATUS.pending;
                        return (
                          <motion.tr key={purchase.purchase_id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.04 }}
                            className={`hover:bg-surface-container-low/30 transition-colors ${
                              purchase.status === "cancelled" || purchase.status === "refunded"
                                ? "opacity-60"
                                : ""
                            }`}
                          >
                            {/* Attendee */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                  {purchase.buyer_avatar
                                    ? <img src={purchase.buyer_avatar} className="w-full h-full object-cover rounded-full" />
                                    : getInitials(purchase.buyer_name)}
                                </div>
                                <div>
                                  <p className="text-[13px] font-bold text-on-surface">{purchase.buyer_name}</p>
                                  <p className="text-[11px] text-outline">{purchase.buyer_email}</p>
                                </div>
                              </div>
                            </td>
                            {/* Tier */}
                            <td className="px-5 py-3.5 text-[13px] text-on-surface-variant">
                              {purchase.tier_name}
                            </td>
                            {/* Amount */}
                            <td className="px-5 py-3.5 font-bold text-primary text-[13px]">
                              {formatCurrency(purchase.amount_paid, purchase.currency)}
                            </td>
                            {/* Promo */}
                            <td className="px-5 py-3.5">
                              {purchase.promo_code_used ? (
                                <code className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                                  {purchase.promo_code_used}
                                </code>
                              ) : (
                                <span className="text-outline/30 text-[13px]">—</span>
                              )}
                            </td>
                            {/* Status */}
                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${status.cls}`}>
                                {status.label}
                              </span>
                            </td>
                            {/* Checked in */}
                            <td className="px-5 py-3.5">
                              {purchase.checked_in ? (
                                <span className="material-symbols-outlined text-primary text-[20px]"
                                  style={{ fontVariationSettings: "'FILL' 1" }}>
                                  check_circle
                                </span>
                              ) : purchase.status === "cancelled" ? (
                                <span className="material-symbols-outlined text-outline/20 text-[20px]">block</span>
                              ) : (
                                <span className="material-symbols-outlined text-outline/30 text-[20px]">radio_button_unchecked</span>
                              )}
                            </td>
                            {/* Actions */}
                            <td className="px-5 py-3.5">
                              <button
                                onClick={() => setSelectedPurchase(purchase)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 border-t border-outline/10 bg-surface-container-low/20 flex items-center justify-between">
                <span className="text-[11px] text-outline">
                  Showing {filtered.length} of {purchases.length} purchases
                </span>
                <div className="flex gap-1">
                  <button disabled className="w-7 h-7 flex items-center justify-center rounded text-outline/30 cursor-not-allowed">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded text-outline hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Drawers ── */}
      <CreateTierDrawer
        isOpen={tierDrawer}
        onClose={() => setTierDrawer(false)}
        eventId={eventId}
      />
      <CreatePromoDrawer
        isOpen={promoDrawer}
        onClose={() => setPromoDrawer(false)}
        eventId={eventId}
        tiers={tiers}
      />
      <PurchaseDetailDrawer
        purchase={selectedPurchase}
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        eventId={eventId}
      />
    </>
  );
}