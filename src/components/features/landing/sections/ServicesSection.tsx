import { Wifi, Cloud, Code2, ShieldCheck } from "lucide-react";

const SERVICES = [
  {
    icon: Wifi,
    title: "Internet",
    description: "Broadband & Corporate connectivity packages",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-100 dark:border-blue-900",
  },
  {
    icon: Cloud,
    title: "Cloud",
    description: "Scalable cloud infrastructure & VPS plans",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-100 dark:border-violet-900",
  },
  {
    icon: Code2,
    title: "Software",
    description: "Licensing, subscriptions & custom builds",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-100 dark:border-emerald-900",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    description: "Managed security & monitoring services",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-100 dark:border-red-900",
  },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="bg-slate-50 py-24 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Built Around Your Core Services
          </h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Manage pricing, products, and quotations across every service line you offer.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.title}
                className={`rounded-2xl border ${svc.border} bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-slate-900`}
              >
                <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${svc.bg}`}>
                  <Icon className={`h-7 w-7 ${svc.color}`} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-50">{svc.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{svc.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
