"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
    }
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[400px]"
    >
      <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm p-8 space-y-6">
        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="font-bold text-primary text-2xl">Welcome back</h1>
          <p className="text-on-surface-variant text-body-md">
            Sign in to your account
          </p>
        </div>

        {/* Google Sign-in */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-outline/20 hover:bg-surface-container-low transition-colors font-bold text-on-surface"
        >
          {/* Simple Google G */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-outline/15" />
          <span className="text-outline text-label-sm">or</span>
          <div className="flex-1 h-px bg-outline/15" />
        </div>

        {/* Credentials form */}
        <form onSubmit={handleCredentials} className="space-y-4">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-error-container/30 border border-error/20 rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-error text-label-lg">{error}</p>
            </motion.div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-label-lg text-on-surface-variant font-bold block">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-label-lg text-on-surface-variant font-bold block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-4 py-3 pr-12 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-primary text-label-lg underline hover:opacity-80 transition-opacity"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3.5 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-on-surface-variant text-body-md">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-bold underline">
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
