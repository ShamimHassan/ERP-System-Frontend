"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Who can access this system?",
    a: "Access is role-based: Admins, Managers, and Marketing team members each see data scoped to their role. An Admin manages everything, a Manager sees only their own team, and a Marketing Person sees only their own records.",
  },
  {
    q: "Can I customize pricing per product?",
    a: "Yes — pricing supports multiple billing types (one-time, recurring, per-unit) and maintains a full price history. You can adjust prices at any time from the Catalog module.",
  },
  {
    q: "Is approval required for every discount?",
    a: "Only when a quoted price falls below the configured minimum price for that product. The system automatically flags it and routes it to the assigned manager for approval.",
  },
  {
    q: "Can managers see other teams' data?",
    a: "No — each manager sees only their own team's records. This is enforced at the API level, not just the UI, so there's no way to bypass it.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="bg-slate-50 py-24 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left text-base font-semibold text-slate-900 dark:text-slate-50"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {faq.q}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200",
                    open === i && "rotate-180",
                  )}
                />
              </button>
              {open === i && (
                <div className="border-t border-slate-100 px-6 pb-5 pt-3 text-base leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
