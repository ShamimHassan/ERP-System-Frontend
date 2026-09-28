import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        {/* Brand */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-100">
          <LayoutDashboard className="h-7 w-7 text-white dark:text-slate-900" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            404 — Not Found
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Page not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            The page you&apos;re looking for doesn&apos;t exist, was moved,
            or you don&apos;t have access to it.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/leads">View Leads</Link>
          </Button>
        </div>

        <p className="text-xs text-slate-400">
          ERP Sales &amp; Marketing Management System
        </p>
      </div>
    </main>
  );
}
