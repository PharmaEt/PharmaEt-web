"use client";

import { useAuth } from "@/context/auth-context";

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      Logout
    </button>
  );
}
