"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/branches": "Branches",
  "/branches/new": "Add Branch",
  "/users": "Users",
  "/users/new": "Add User",
  "/suppliers": "Suppliers",
  "/categories": "Categories",
  "/medicines": "Medicines",
  "/cosmetics": "Cosmetics",
  "/cosmetics/new": "Add Cosmetic",
  "/stock": "Stock",
  "/stock/new": "Add Stock",
  "/stock-movements": "Stock Movements",
  "/purchase-orders": "Purchase Orders",
  "/pos": "Point of Sale",
  "/sales": "Sales History",
  "/reports": "Reports",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return [{ label: "Dashboard", href: "/", isLast: true }];

    const breadcrumbs = [{ label: "Dashboard", href: "/", isLast: false }];
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      currentPath += `/${parts[i]}`;
      let label = pageTitles[currentPath];

      if (!label) {
        const prev = i > 0 ? `/${parts[i - 1]}` : "";
        if (parts[i] === "new") {
          const parentName = pageTitles[prev]?.replace(/s$/, "") ?? prev.slice(1).replace(/-/g, " ");
          label = `Add ${parentName.charAt(0).toUpperCase() + parentName.slice(1)}`;
        } else if (/^\d+$/.test(parts[i])) {
          const parentName = pageTitles[prev] ?? prev.slice(1).replace(/-/g, " ");
          label = parentName.charAt(0).toUpperCase() + parentName.slice(1);
        } else if (parts[i] === "receive") {
          label = "Receive";
        } else {
          label = parts[i].charAt(0).toUpperCase() + parts[i].slice(1).replace(/-/g, " ");
        }
      }
      breadcrumbs.push({ label, href: currentPath, isLast: false });
    }

    breadcrumbs[breadcrumbs.length - 1].isLast = true;
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-[52px] items-center justify-between border-b border-neutral-200 bg-white pl-[220px] pr-4 dark:border-neutral-800 dark:bg-[#0A0A0A] lg:pl-[220px] max-lg:pl-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 lg:hidden"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <nav className="ml-4 flex items-center gap-1 text-[13px]">
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {idx > 0 && (
                <svg className="mx-0.5 h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
              {crumb.isLast ? (
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {crumb.label}
                </span>
              ) : (
                <span className="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300 hidden sm:inline">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2.5">

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 transition-colors duration-150 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white dark:bg-neutral-100 dark:text-black">
              {user?.name?.charAt(0) || "U"}
            </div>
            <span className="hidden text-[13px] font-medium text-neutral-700 dark:text-neutral-300 md:block">
              {user?.name?.split(" ")[0] || "User"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#0A0A0A]">
                <div className="border-b border-neutral-200 px-3.5 py-2.5 dark:border-neutral-800">
                  <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{user?.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center rounded-md px-3 py-2 text-[13px] text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center rounded-md px-3 py-2 text-[13px] text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    Settings
                  </Link>
                  <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center rounded-md px-3 py-2 text-[13px] text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
