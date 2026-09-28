import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ForbiddenStateProps {
  message?: string;
}

export default function ForbiddenState({
  message = "You don't have permission to access this page.",
}: ForbiddenStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
        <ShieldX className="h-7 w-7 text-red-600 dark:text-red-400" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">403 — Forbidden</p>
      <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-50">Access Denied</h2>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">{message}</p>
      <Button asChild className="mt-6" variant="outline">
        <Link href="/dashboard">← Back to Dashboard</Link>
      </Button>
    </div>
  );
}
