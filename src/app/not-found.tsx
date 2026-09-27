import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">404</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Page not found
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go back to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
