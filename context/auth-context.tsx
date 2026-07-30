"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type ApiUser } from "@/lib/mock-data";

interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
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
          telegram_chat_id: null,
          created_at: "2026-07-28T10:00:00.000000Z",
          updated_at: "2026-07-28T10:00:00.000000Z",
        };
        localStorage.setItem("token", "1|mock-token-abc123");
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsLoading(false);
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
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
