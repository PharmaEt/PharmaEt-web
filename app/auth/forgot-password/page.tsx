"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="hidden flex-1 items-center justify-center bg-[#0C0C0C] lg:flex">
        <div className="px-12 text-center">
          <span className="inline-flex h-10 items-center rounded bg-white px-2 text-lg font-semibold text-black">
            Rx
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
            PharmaET
          </h1>
          <p className="mt-3 text-sm text-neutral-400">
            Pharmacy Management System
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <span className="inline-flex h-8 items-center rounded bg-neutral-900 px-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-black">
              Rx
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Enter your phone number and we&apos;ll send you a reset link
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                If an account exists with that phone number, you&apos;ll receive a password reset link shortly.
              </div>
              <Link
                href="/auth/login"
                className="flex h-9 w-full items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
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
                className="flex h-9 w-full items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Send reset link
              </button>

              <p className="text-center text-sm text-neutral-500">
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
