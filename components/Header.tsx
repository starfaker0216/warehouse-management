"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import PillNav, { type PillNavItem } from "./PillNav";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const { employee, logout, isAuthenticated } = useAuth();

  // Don't show header on login page
  if (pathname === "/login") {
    return null;
  }

  // Build navigation items
  const navItems: PillNavItem[] = [];

  // Add Quản Lý link only for admin users
  if (isAuthenticated && employee?.role === "admin") {
    navItems.push({
      label: "Nhập Hàng",
      href: "/import",
      ariaLabel: "Nhập hàng"
    });
    navItems.push({
      label: "Lịch sử",
      href: "/history",
      ariaLabel: "Lịch sử"
    });
    navItems.push({
      label: "Thu / Chi",
      href: "/income-expense",
      ariaLabel: "Thu Chi"
    });
    navItems.push({
      label: "Thống Kê",
      href: "/statistics",
      ariaLabel: "Thống kê"
    });
    navItems.push({
      label: "Quản Lý",
      href: "/admin/create-account",
      ariaLabel: "Quản lý"
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* PillNav Navigation */}
          {isAuthenticated ? (
            <div className="flex-1 relative h-full flex items-center">
              <div className="pill-nav-container">
                <PillNav
                  logo="/logo.svg"
                  logoAlt="Kho Hàng Điện Thoại"
                  items={navItems}
                  activeHref={pathname}
                  baseColor="#000000"
                  pillColor="#18181b"
                  hoveredPillTextColor="#ffffff"
                  pillTextColor="#FFFFFF"
                  initialLoadAnimation={true}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Kho Hàng Điện Thoại
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Quản lý kho hàng
                </p>
              </div>
            </div>
          )}

          {/* Right Side: User Info and Logout */}
          {isAuthenticated && employee ? (
            <div className="flex items-center gap-4">
              {/* User Info */}
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Hello, {employee.name}
              </p>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="group flex items-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-all duration-200 hover:scale-105 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <svg
                  className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Đăng Xuất</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40"
            >
              Đăng Nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
