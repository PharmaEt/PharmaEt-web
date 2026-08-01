"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  Building2,
  Users,
  Truck,
  Tag,
  Pill,
  Sparkles,
  Package,
  AlertTriangle,
  ArrowLeftRight,
  ClipboardList,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavSection {
  label: string;
  items: { label: string; href: string; icon: LucideIcon }[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [
      { label: "Branches", href: "/branches", icon: Building2 },
      { label: "Users", href: "/users", icon: Users },
      { label: "Suppliers", href: "/suppliers", icon: Truck },
      { label: "Categories", href: "/categories", icon: Tag },
      { label: "Medicines", href: "/medicines", icon: Pill },
      { label: "Cosmetics", href: "/cosmetics", icon: Sparkles },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "Stock", href: "/stock", icon: Package },
      { label: "Stock Alerts", href: "/stock#alerts", icon: AlertTriangle },
      { label: "Stock Movements", href: "/stock-movements", icon: ArrowLeftRight },
      { label: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "POS", href: "/pos", icon: ShoppingCart },
      { label: "Sales History", href: "/sales", icon: Receipt },
    ],
  },
  {
    label: "Analytics",
    items: [{ label: "Reports", href: "/reports", icon: BarChart3 }],
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.includes("#")) return pathname === href.split("#")[0];
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[220px] flex-col bg-[#0C0C0C] transition-transform duration-100 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-[52px] items-center gap-2 px-4">
          <span className="text-lg font-medium text-neutral-200">PharmaET</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {navSections.map((section) => (
            <div key={section.label} className="mt-6">
              <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-neutral-600">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-100 ${active
                      ? "bg-white/10 text-white"
                      : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                      }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-neutral-800 p-3">
          <Link
            href="/profile"
            onClick={onClose}
            className={`mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-100 ${pathname === "/profile"
              ? "bg-white/10 text-white"
              : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
              }`}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={onClose}
            className={`mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-100 ${pathname === "/settings"
              ? "bg-white/10 text-white"
              : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
              }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
