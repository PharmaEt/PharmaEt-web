"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type ApiUser } from "@/lib/mock-data";

export type UserRole = "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer";

interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
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

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Default demo owner session
          const defaultUser: ApiUser = {
            id: 1,
            branch_id: null,
            name: "Bilal Ahmed",
            email: "bilal@pharmaet.com",
            phone: "+251911223344",
            role: "owner",
            status: "active",
            telegram_chat_id: "123456789",
            created_at: "2026-07-28T10:00:00.000000Z",
            updated_at: "2026-07-28T10:00:00.000000Z",
          };
          setUser(defaultUser);
        }
      } catch {
        // ignore
      }
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = async (phone: string) => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const userData: ApiUser = {
          id: 1,
          branch_id: null,
          name: "Bilal Ahmed",
          email: "bilal@pharmaet.com",
          phone,
          role: "owner",
          status: "active",
          telegram_chat_id: "123456789",
          created_at: "2026-07-28T10:00:00.000000Z",
          updated_at: "2026-07-28T10:00:00.000000Z",
        };
        localStorage.setItem("token", "1|mock-token-abc123");
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsLoading(false);
        resolve();
      }, 600);
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/auth/login";
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  const role = user?.role ?? "cashier";
  const isOwner = role === "owner";
  const isManager = role === "manager";
  const isInventory = role === "inventory_officer";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
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
