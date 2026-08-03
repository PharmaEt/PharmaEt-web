"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

import { resetPassword } from "@/lib/api/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone) {
      setError("Please enter your registered phone number");
      return;
    }

    if (!token || token.length < 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        phone,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="hidden flex-1 items-center justify-center bg-[#0C0C0C] lg:flex">
        <div className="px-12 text-center">
          <span className="inline-flex h-10 items-center rounded bg-white px-2 text-lg font-semibold text-black">
            Rx
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
            PharmaEt
          </h1>
          <p className="mt-3 text-sm text-neutral-400">
            Pharmacy Management System
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden">
            <span className="inline-flex h-8 items-center rounded bg-neutral-900 px-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-black">
              Rx
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Enter your phone, 6-digit Telegram code, and your new password.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-semibold">Password Reset Successful!</p>
                  <p className="mt-1">
                    Your password has been changed successfully. You may now sign in with your new credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/auth/login")}
                className="flex h-9 w-full items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Dispatched via Telegram to your registered account.
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+251911223344"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  6-Digit Telegram Reset Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 849201"
                  required
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm font-mono tracking-widest text-center placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-9 w-full items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <p className="text-center text-xs text-neutral-500">
                <Link href="/auth/login" className="text-neutral-900 hover:underline dark:text-neutral-100">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
