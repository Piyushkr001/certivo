"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BadgeCheck,
  FileText,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  UserCircle2,
  Menu,
  ChevronLeft,
  ChevronRight,
  SidebarOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/app/auth/AuthContext";

type Role = "admin" | "user";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const userNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Certificates", href: "/dashboard/certificates", icon: BadgeCheck },
  { label: "Verify Certificate", href: "/dashboard/verify", icon: FileText },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Admin Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Issue Certificates", href: "/admin/certificates", icon: BadgeCheck },
  { label: "Interns", href: "/admin/interns", icon: Users },
  { label: "Organizations", href: "/admin/organizations", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function getNavForRole(role: Role | undefined | null): NavItem[] {
  if (role === "admin") return adminNav;
  return userNav; // default to user
}

function SidebarNavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/70"
      )}
      aria-current={active ? "page" : undefined}
      title={item.label}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

const STORAGE_KEY = "certivo_sidebar_collapsed";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // collapsed: true => show icon-only narrow sidebar
  // default behavior: collapsed on md, expanded on lg+
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
      return raw === "true";
    } catch {
      return false;
    }
  });

  // keep persisted state in sync
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  const role = (user?.role as Role | undefined) ?? "user";
  const navItems = getNavForRole(role);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* MOBILE: top bar with sheet trigger */}
      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 md:hidden">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {role === "admin" ? "Admin Dashboard" : "User Dashboard"}
          </span>
          <span className="text-sm font-semibold truncate">
            {user?.name || "Welcome to Certivo"}
          </span>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open menu"
              className="border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <SidebarOpen className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex w-80 flex-col bg-slate-50 p-0 dark:bg-slate-950"
            // ensure the sheet shows a backdrop (shadcn Sheet should) — no extra code needed
          >
            <SheetHeader className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <span className="rounded-md bg-linear-to-r from-blue-600 to-emerald-400 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Certivo
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {role === "admin" ? "Admin" : "User"} Panel
                </span>
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className="flex-1 px-3 py-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    active={isActive(item.href)}
                    onClick={() => {
                      /* sheet will auto close when link navigates */
                    }}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-800">
              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* MD+ : collapsible vertical sidebar
          - On md: narrow by default (collapsed true)
          - On lg+: expanded by default (collapsed false)
          We handle that by CSS + a toggle button; user preference persisted in localStorage
      */}
      <aside
        className={cn(
          // hidden on small screens (mobile handled above)
          "hidden md:flex md:flex-col",
          // layout + borders
          "h-full border-r bg-slate-50/95 px-2 py-4 text-sm",
          "dark:border-slate-800 dark:bg-slate-950/95",
          // width adjusts based on collapsed state:
          collapsed ? "w-16" : "w-64",
          // smooth width transition
          "transition-width duration-200 ease-in-out"
        )}
        aria-label="Sidebar"
      >
        {/* Top area: brand + collapse toggle */}
        <div className="mb-4 flex items-center justify-between gap-2 px-1">
          <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "")}>
            <div className="flex flex-col">
              {!collapsed ? (
                <>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {role === "admin" ? "Admin Dashboard" : "User Dashboard"}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {user?.name || "Certivo"}
                  </span>
                </>
              ) : (
                <span className="sr-only">{role === "admin" ? "Admin Dashboard" : "User Dashboard"}</span>
              )}
            </div>
          </div>

          {/* Collapse toggle - visible on md+ */}
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((s) => !s)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-900/80"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav area */}
        <ScrollArea className="flex-1 px-1">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.href} className="px-1">
                <SidebarNavItem
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer - logout */}
        <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
          <Button
            variant="outline"
            className={cn(
              "flex w-full items-center justify-start gap-3 border-slate-300 px-2 text-xs text-slate-800 hover:bg-slate-100",
              "dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            )}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
