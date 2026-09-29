"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, TrendingUp, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

/** Three "slides" cycling in the hero carousel */
const SLIDES = [
  {
    icon: TrendingUp,
    label: "Leads",
    stat: "1,200+",
    desc: "Leads tracked across all teams",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    icon: FileText,
    label: "Quotations",
    stat: "98%",
    desc: "Quotation accuracy on first send",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    icon: Users,
    label: "Revenue",
    stat: "24/7",
    desc: "Real-time KPI dashboards, always live",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
  },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % SLIDES.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const slide = SLIDES[activeSlide];
  const Icon = slide.icon;

  return (
    <section
      id="hero"
      className="relative flex min-h-[65vh] items-center overflow-hidden bg-linear-to-br from-slate-50 via-white to-slate-100 pt-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-violet-100/40 blur-3xl dark:bg-violet-900/10" />
      <div className="pointer-events-none absolute -bottom-20 left-0 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl dark:bg-blue-900/10" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live sales pipeline management
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl">
              Run Your Entire{" "}
              <span className="bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
                Sales Pipeline
              </span>{" "}
              From One Place
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Track leads, manage your team, generate quotations, and close deals
              faster — with role-based visibility built for every level of your
              organization.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Login to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                See How It Works
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right: Animated card carousel */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Background cards */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />

              {/* Active slide card */}
              <div
                className={cn(
                  "relative rounded-2xl border p-8 shadow-xl transition-all duration-300",
                  slide.bg,
                  slide.border,
                  visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
                )}
              >
                <div className={cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl", slide.bg, "border", slide.border)}>
                  <Icon className={cn("h-6 w-6", slide.color)} />
                </div>
                <p className={cn("text-5xl font-black", slide.color)}>{slide.stat}</p>
                <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200">{slide.label}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{slide.desc}</p>

                {/* Progress dots */}
                <div className="mt-6 flex gap-1.5">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveSlide(i); setVisible(true); }}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === activeSlide ? cn("w-6", slide.color.replace("text-", "bg-")) : "w-1.5 bg-slate-300 dark:bg-slate-600"
                      )}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
