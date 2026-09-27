"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";
import { getInitials } from "@/lib/formatters";
import api from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_BADGE: Record<string, string> = {
  ADMIN:     "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  MANAGER:   "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  MARKETING: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin", MANAGER: "Manager", MARKETING: "Marketing",
};

export default function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUiStore();

  async function handleLogout() {
    try {
      // Best-effort server-side logout (invalidates refresh token)
      await api.post("/auth/logout", {}).catch(() => null);
    } finally {
      logout();
      router.push("/login");
      toast.success("Logged out successfully.");
    }
  }

  if (!user) return null;

  const initials = getInitials(user.name);
  const roleClass = ROLE_BADGE[user.role] ?? ROLE_BADGE.MARKETING;
  const roleLabel = ROLE_LABEL[user.role] ?? user.role;

  return (
    <header className="flex h-14 items-center border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Hamburger — mobile / sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 shrink-0"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Brand name (mobile only — sidebar hidden) */}
      <span className="mr-auto text-sm font-semibold text-slate-700 dark:text-slate-300 lg:hidden">
        ERP Sales & Marketing
      </span>

      {/* Spacer on desktop */}
      <div className="flex-1" />

      {/* User profile chip */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="User menu"
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="max-w-30 truncate text-sm font-medium leading-none text-slate-900 dark:text-slate-50">
                {user.name}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`hidden text-xs sm:inline-flex ${roleClass}`}
            >
              {roleLabel}
            </Badge>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-1 pb-2">
            <span className="font-medium text-slate-900 dark:text-slate-50">{user.name}</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              {user.email}
            </span>
            <Badge
              variant="outline"
              className={`mt-0.5 w-fit text-xs ${roleClass}`}
            >
              {roleLabel}
            </Badge>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              href="/profile/change-password"
              className="flex cursor-pointer items-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
