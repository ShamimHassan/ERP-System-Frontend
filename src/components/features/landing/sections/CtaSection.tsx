import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section
      id="cta"
      className="bg-white py-24 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-br from-slate-900 to-slate-700 px-8 py-16 text-center dark:from-slate-800 dark:to-slate-700 sm:px-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to See It In Action?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Log in with a demo account and explore the full sales workflow in minutes.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-slate-900 shadow-lg transition-all hover:bg-slate-100 hover:shadow-xl"
          >
            Try Demo Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
