"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.username.trim()) e.username = "Username is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.password || form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          username: form.username,
          password: form.password,
          gender: form.gender || undefined,
          phoneNumber: form.phoneNumber || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Account created! Signing you in...");

      // Auto sign-in after registration
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const Field = ({
    id,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
  }: {
    id: keyof typeof form;
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
  }) => (
    <div className="space-y-1.5">
      <label className="text-label-lg text-on-surface-variant font-bold block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-on-surface focus:ring-1 outline-none transition-all ${
          error
            ? "border-error focus:border-error focus:ring-error"
            : "border-outline/20 focus:border-primary focus:ring-primary"
        }`}
      />
      {error && (
        <p className="text-error text-label-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[440px]"
    >
      <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm p-8 space-y-6">
        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="font-bold text-primary text-2xl">Create your account</h1>
          <p className="text-on-surface-variant text-body-md">
            Join the community — it&apos;s free
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  s === step
                    ? "bg-primary text-on-primary"
                    : s < step
                    ? "bg-primary-fixed text-primary"
                    : "bg-surface-container text-outline"
                }`}
              >
                {s < step ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  s
                )}
              </div>
              <span className="text-label-sm text-on-surface-variant hidden sm:block">
                {s === 1 ? "Your Info" : "Password"}
              </span>
              {s < 2 && (
                <div
                  className={`flex-1 h-px transition-colors ${
                    s < step ? "bg-primary" : "bg-outline/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if (validateStep1()) setStep(2); } : handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field id="firstName" label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} error={errors.firstName} placeholder="Ahmad" />
                <Field id="lastName" label="Last name" value={form.lastName} onChange={(v) => update("lastName", v)} error={errors.lastName} placeholder="Yusuf" />
              </div>
              <Field id="email" label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} error={errors.email} placeholder="you@example.com" />
              <Field id="username" label="Username" value={form.username} onChange={(v) => update("username", v)} error={errors.username} placeholder="ahmadyusuf" />

              {/* Gender (optional) */}
              <div className="space-y-1.5">
                <label className="text-label-lg text-on-surface-variant font-bold block">
                  Gender <span className="text-outline text-[11px] font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Male", "Female", "Prefer not to say"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => update("gender", form.gender === g.toLowerCase() ? "" : g.toLowerCase())}
                      className={`py-2.5 rounded-full font-bold text-label-lg transition-all ${
                        form.gender === g.toLowerCase()
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {g === "Prefer not to say" ? "Other" : g}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-3.5 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Continue
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </>
          ) : (
            <>
              <Field id="password" label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} error={errors.password} placeholder="Min. 8 characters" />
              <Field id="confirmPassword" label="Confirm password" type="password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} error={errors.confirmPassword} placeholder="Re-enter password" />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-full font-bold bg-surface-container text-on-surface hover:bg-surface-container-high transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-on-primary py-3.5 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Login link */}
        <p className="text-center text-on-surface-variant text-body-md">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
