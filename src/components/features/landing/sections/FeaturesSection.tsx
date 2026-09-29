import { Target, Lock, FileText, BarChart2, Shield, Settings } from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Lead & Opportunity Tracking",
    description: "Capture, qualify, and convert leads without losing a single follow-up.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: Lock,
    title: "Role-Based Access Control",
    description: "Admins see everything, managers see their team, marketers see only their own.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    icon: FileText,
    title: "Smart Quotations",
    description: "Multi-product quotations with automatic price-approval workflows.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: BarChart2,
    title: "Real-Time KPI Dashboards",
    description: "Track revenue, conversion rate, and team performance as it happens.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    icon: Shield,
    title: "Full Audit Trail",
    description: "Every price change, approval, and status update is logged automatically.",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
  {
    icon: Settings,
    title: "Configurable Pricing",
    description: "Manage services, categories, and pricing tiers without touching code.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-white py-24 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Everything Your Sales Team Needs
          </h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Built for admins, managers, and marketing teams — with the right access for everyone.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group rounded-xl border border-slate-100 bg-slate-50 p-6 transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feat.bg}`}>
                  <Icon className={`h-5 w-5 ${feat.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
