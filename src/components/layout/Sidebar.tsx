"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Building2,
  Target,
  Phone,
  Search,
  FileText,
  Package,
  Wrench,
  FolderOpen,
  Boxes,
  BadgeDollarSign,
  TrendingUp,
  BarChart3,
  KeySquare,
  ShieldCheck,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// ── Nav item types ────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** If provided, item only shows when predicate returns true */
  show?: (role: Role) => boolean;
}

interface NavGroup {
  group?: string; // undefined = no separator/label
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    items: [
      { label: "Dashboard",        href: "/dashboard",         icon: LayoutDashboard },
    ],
  },
  {
    group: "Sales",
    items: [
      { label: "Leads",            href: "/leads",             icon: ClipboardList },
      { label: "Customers",        href: "/customers",         icon: Building2 },
      { label: "Opportunities",    href: "/opportunities",     icon: Target },
      { label: "Activities",       href: "/activities",        icon: Phone },
      { label: "Surveys",          href: "/surveys",           icon: Search },
    ],
  },
  {
    group: "Transactions",
    items: [
      { label: "Quotations",       href: "/quotations",        icon: FileText },
      { label: "Orders",           href: "/orders",            icon: Package },
    ],
  },
  {
    group: "Catalog",
    items: [
      { label: "Services",         href: "/catalog/services",  icon: Wrench },
      { label: "Categories",       href: "/catalog/categories",icon: FolderOpen },
      { label: "Products",         href: "/catalog/products",  icon: Boxes },
      { label: "Pricing",          href: "/catalog/prices",    icon: BadgeDollarSign },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Sales Report",     href: "/reports/sales",     icon: TrendingUp,  show: (r) => can.viewReports(r) },
      { label: "Marketing Report", href: "/reports/marketing", icon: BarChart3,   show: (r) => can.viewReports(r) },
      { label: "KPIs",             href: "/kpis",              icon: KeySquare },
    ],
  },
  {
    group: "Admin",
    items: [
      { label: "Users",            href: "/users",             icon: Users,       show: (r) => can.viewUsers(r) },
      { label: "Audit Logs",       href: "/audit-logs",        icon: ShieldCheck, show: (r) => can.viewAuditLogs(r) },
    ],
  },
];

// ── Single nav link ───────────────────────────────────────────────────────
function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
}) {
  const active =
    item.href === "/dashboard"
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
      <item.icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active
            ? "text-white dark:text-slate-900"
            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
        )}
      />
      <span className="truncate">{item.label}</span>
      {active && (
        <ChevronRight className="ml-auto h-3 w-3 shrink-0 text-white/60 dark:text-slate-900/60" />
      )}
    </Link>
  );
}

// ── Nav content (shared between desktop + mobile sheet) ───────────────────
function SidebarContent({
  role,
  pathname,
  onLinkClick,
}: {
  role: Role;
  pathname: string;
  onLinkClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center border-b border-slate-200 px-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
            <LayoutDashboard className="h-4 w-4 text-white dark:text-slate-900" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-50">ERP System</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Sales & Marketing</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((group, gi) => {
          const visibleItems = group.items.filter(
            (item) => !item.show || item.show(role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={gi} className={gi > 0 ? "mt-1" : undefined}>
              {group.group && (
                <div className="mb-1 mt-4 first:mt-0">
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                    {group.group}
                  </p>
                </div>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onClick={onLinkClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Role indicator at bottom */}
      <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Logged in as
          </p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {role === "ADMIN" ? "System Admin" : role === "MANAGER" ? "Manager" : "Marketing"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Sidebar component ─────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  const role: Role = (user?.role as Role) ?? "MARKETING";

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 lg:flex",
          sidebarOpen ? "w-56" : "w-0 overflow-hidden border-r-0"
        )}
      >
        <SidebarContent role={role} pathname={pathname} />
      </aside>

      {/* Mobile: slide-over Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-56 p-0 lg:hidden"
        >
          <div className="flex h-full flex-col">
            {/* Close button row */}
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
                  <LayoutDashboard className="h-4 w-4 text-white dark:text-slate-900" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">ERP System</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {NAV.map((group, gi) => {
                const visibleItems = group.items.filter(
                  (item) => !item.show || item.show(role)
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div key={gi} className={gi > 0 ? "mt-1" : undefined}>
                    {group.group && (
                      <div className="mb-1 mt-4 first:mt-0">
                        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                          {group.group}
                        </p>
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {visibleItems.map((item) => (
                        <NavLink
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          onClick={() => setSidebarOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>

            <Separator />
            <div className="p-3">
              <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Logged in as
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {role === "ADMIN" ? "System Admin" : role === "MANAGER" ? "Manager" : "Marketing"}
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
