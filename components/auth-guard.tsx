"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated && !isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [hydrated, isAuthenticated, isLoading, router]);

  if (!hydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
