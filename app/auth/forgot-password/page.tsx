"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("verify");
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token || token.length < 6) {
      setError("Please enter the 6-digit verification code sent to Telegram");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
    }, 700);
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
            <h2 className="text-2xl font-semibold tracking-tight">
              {step === "request" && "Forgot password"}
              {step === "verify" && "Enter verification code"}
              {step === "success" && "Password reset complete"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {step === "request" && "Enter your phone number to receive a 6-digit Telegram reset code"}
              {step === "verify" && `A code was dispatched to your Telegram account linked to ${phone}`}
              {step === "success" && "Your password has been updated. You may now sign in."}
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {step === "request" && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+251911223344"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                <Send className="h-3.5 w-3.5" />
                {loading ? "Sending Telegram Code..." : "Send Telegram Code"}
              </button>

              <p className="text-center text-xs text-neutral-500">
                <Link href="/auth/login" className="text-neutral-900 hover:underline dark:text-neutral-100">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Check your Telegram app for a message containing your 6-digit code.
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  6-Digit Telegram Verification Code
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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-9 w-full items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {loading ? "Resetting Password..." : "Confirm & Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep("request")}
                className="flex items-center justify-center gap-1 w-full text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              >
                <ArrowLeft className="h-3 w-3" />
                Change phone number / Resend code
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-4">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-semibold">Password Reset Successful!</p>
                  <p className="mt-1">
                    Your password has been changed and active sessions have been updated.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/auth/login")}
                className="flex h-9 w-full items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Sign In With New Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
