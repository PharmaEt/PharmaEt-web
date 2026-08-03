"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type ApiUser } from "@/lib/mock-data";
import { loginUser, getSelfProfile, logoutUser } from "@/lib/api/auth";
import { checkApiHealth } from "@/lib/api/health";

export type UserRole = "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer";

interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isApiOnline: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (userData: ApiUser) => void;
  switchRole: (newRole: UserRole) => void;
  isOwner: boolean;
  isManager: boolean;
  canManageBranches: boolean;
  canManageUsers: boolean;
  canManageCatalog: boolean;
  canVoidSale: boolean;
  canUpdateSettings: boolean;
  canDeleteRecords: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiOnline, setIsApiOnline] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        await checkApiHealth();
        setIsApiOnline(true);
      } catch {
        setIsApiOnline(false);
      }
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token) {
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            // ignore JSON parse error
          }
        }
        try {
          const profileResponse = await getSelfProfile();
          if (profileResponse?.user) {
            setUser(profileResponse.user);
            localStorage.setItem("user", JSON.stringify(profileResponse.user));
          }
        } catch (err: unknown) {
          if (err instanceof Error && (err.message.toLowerCase().includes("unauthenticated") || err.message.includes("401"))) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            document.cookie = "auth_token=; path=/; max-age=0";
            setUser(null);
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
              window.location.href = "/auth/login";
            }
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }

    restoreSession();
  }, []);

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUser({ phone, password });
      const { token, user: userData } = response;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      document.cookie = `auth_token=${token}; path=/; max-age=86400`;
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "auth_token=; path=/; max-age=0";
      setUser(null);
      window.location.href = "/auth/login";
    }
  };

  const updateCurrentUser = (userData: ApiUser) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updatedUser: ApiUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const role = user?.role ?? "owner";
  const isOwner = role === "owner";
  const isManager = role === "manager";
  const isInventory = role === "inventory_officer";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isApiOnline,
        login,
        logout,
        updateCurrentUser,
        switchRole,
        isOwner,
        isManager,
        canManageBranches: isOwner,
        canManageUsers: isOwner || isManager,
        canManageCatalog: isOwner || isManager || isInventory,
        canVoidSale: isOwner || isManager,
        canUpdateSettings: isOwner,
        canDeleteRecords: isOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
