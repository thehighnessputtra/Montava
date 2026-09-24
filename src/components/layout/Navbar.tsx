"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  WalletCards,
  ArrowLeftRight,
  Tags,
  Menu,
  X,
  LogOut,
  UserRound,
  PiggyBank,
  Target,
  FileText,
} from "lucide-react";

import { useAuthStore } from "@/stores/authStore";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Wallet",
    href: "/dashboard/wallets",
    icon: WalletCards,
  },
  {
    name: "Transaction",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Category",
    href: "/dashboard/categories",
    icon: Tags,
  },
  {
    name: "Budget",
    href: "/dashboard/budget",
    icon: PiggyBank,
  },
  {
    name: "Financial Goals",
    href: "/dashboard/financial-goals",
    icon: Target,
  },
  {
    name: "Report",
    href: "/dashboard/report",
    icon: FileText,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleNavigation = () => {
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <Link
          href="/dashboard"
          onClick={handleNavigation}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            M
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">
              Monvanta
            </p>

            <p className="text-[11px] text-slate-400">
              Personal Finance
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavigation}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-700"
                  }
                />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200">
            <UserRound size={17} className="text-slate-600" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name || "User"}
            </p>

            <p className="truncate text-xs text-slate-400">
              {user?.email || "-"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={18} strokeWidth={1.8} />

          <span>
            {loggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {sidebarContent}
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link
          href="/dashboard"
          onClick={handleNavigation}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            M
          </div>

          <span className="font-bold tracking-tight text-slate-900">
            Monvanta
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
          aria-label="Buka menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={22} />
        </button>
      </header>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
}