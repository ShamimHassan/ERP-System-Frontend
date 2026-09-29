"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, ClipboardList, Building2, Target,
  Phone, Search, FileText, Package, Wrench, FolderOpen, Boxes,
  BadgeDollarSign, TrendingUp, BarChart3, KeySquare, ShieldCheck,
  X, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// ── Nav config ────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  show?: (role: Role) => boolean;
}
interface NavGroup { group?: string; items: NavItem[] }

const NAV: NavGroup[] = [
  { items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    group: "Sales",
    items: [
      { label: "Leads",         href: "/leads",         icon: ClipboardList },
      { label: "Customers",     href: "/customers",     icon: Building2 },
      { label: "Opportunities", href: "/opportunities", icon: Target },
      { label: "Activities",    href: "/activities",    icon: Phone },
      { label: "Surveys",       href: "/surveys",       icon: Search },
    ],
  },
  {
    group: "Transactions",
    items: [
      { label: "Quotations", href: "/quotations", icon: FileText },
      { label: "Orders",     href: "/orders",     icon: Package },
    ],
  },
  {
    group: "Catalog",
    items: [
      { label: "Services",   href: "/catalog/services",   icon: Wrench },
      { label: "Categories", href: "/catalog/categories", icon: FolderOpen },
      { label: "Products",   href: "/catalog/products",   icon: Boxes },
      { label: "Pricing",    href: "/catalog/prices",     icon: BadgeDollarSign },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Sales Report",     href: "/reports/sales",     icon: TrendingUp, show: (r) => can.viewReports(r) },
      { label: "Marketing Report", href: "/reports/marketing", icon: BarChart3,  show: (r) => can.viewReports(r) },
      { label: "KPIs",             href: "/kpis",              icon: KeySquare },
    ],
  },
  {
    group: "Admin",
    items: [
      { label: "Users",      href: "/users",       icon: Users,       show: (r) => can.viewUsers(r) },
      { label: "Audit Logs", href: "/audit-logs",  icon: ShieldCheck, show: (r) => can.viewAuditLogs(r) },
    ],
  },
];

// ── Single nav link ───────────────────────────────────────────────────────
function NavLink({ item, pathname, onClick }: {
  item: NavItem; pathname: string; onClick?: () => void;
}) {
  const active = item.href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
      )}
    >
      <item.icon className={cn(
        "h-4 w-4 shrink-0",
        active ? "text-white dark:text-slate-900" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
      )} />
      <span className="truncate">{item.label}</span>
      {active && <ChevronRight className="ml-auto h-3 w-3 shrink-0 text-white/60 dark:text-slate-900/60" />}
    </Link>
  );
}

// ── Shared nav list ───────────────────────────────────────────────────────
function NavList({ role, pathname, onLinkClick }: {
  role: Role; pathname: string; onLinkClick?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {NAV.map((group, gi) => {
        const visible = group.items.filter((item) => !item.show || item.show(role));
        if (!visible.length) return null;
        return (
          <div key={gi} className={gi > 0 ? "mt-1" : undefined}>
            {group.group && (
              <div className="mb-1 mt-4 first:mt-0">
                <p className="px-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  {group.group}
                </p>
              </div>
            )}
            <div className="space-y-0.5">
              {visible.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} onClick={onLinkClick} />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ── Role footer ───────────────────────────────────────────────────────────
function RoleFooter({ role }: { role: Role }) {
  return (
    <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
      <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Logged in as
        </p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {role === "ADMIN" ? "System Admin" : role === "MANAGER" ? "Manager" : "Marketing"}
        </p>
      </div>
    </div>
  );
}

// ── Brand ─────────────────────────────────────────────────────────────────
function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
        <LayoutDashboard className="h-4 w-4 text-white dark:text-slate-900" />
      </div>
      <div className="leading-none">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-50">ERP System</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sales &amp; Marketing</p>
      </div>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname   = usePathname();
  const { user }   = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const role: Role = (user?.role as Role) ?? "MARKETING";

  // Track whether we're on a large screen (≥1024px = lg breakpoint).
  // The Sheet must only be "open" on mobile — on desktop the aside handles it.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 lg:flex",
          sidebarOpen ? "w-56" : "w-0 overflow-hidden border-r-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center border-b border-slate-200 px-4 dark:border-slate-800">
            <Brand />
          </div>
          <NavList role={role} pathname={pathname} />
          <RoleFooter role={role} />
        </div>
      </aside>

      {/* ── Mobile Sheet (< lg only) ──
           Key fix: only set open=true when NOT on desktop.
           This prevents the Sheet overlay from appearing over desktop content. */}
      <Sheet
        open={!isDesktop && sidebarOpen}
        onOpenChange={(v) => setSidebarOpen(v)}
      >
        <SheetContent side="left" className="w-56 p-0">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
              <Brand />
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <NavList
              role={role}
              pathname={pathname}
              onLinkClick={() => setSidebarOpen(false)}
            />
            <Separator />
            <RoleFooter role={role} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
