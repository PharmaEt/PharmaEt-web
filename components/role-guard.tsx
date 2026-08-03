"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/auth-context";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackUrl = "/" }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const isAllowed = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (hydrated && !isLoading && isAuthenticated && !isAllowed) {
      router.push(fallbackUrl);
    }
  }, [hydrated, isAuthenticated, isAllowed, isLoading, router, fallbackUrl]);

  if (!hydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
      </div>
    );
  }

  if (!isAuthenticated || !isAllowed) {
    return null;
  }

  return <>{children}</>;
}
