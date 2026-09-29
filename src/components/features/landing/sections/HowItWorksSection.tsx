import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Lead",         caption: "Capture interest from any channel" },
  { label: "Qualification", caption: "Filter serious prospects" },
  { label: "Opportunity",  caption: "Track deal size & stage" },
  { label: "Quotation",    caption: "Send professional, itemized offers" },
  { label: "Approval",     caption: "Automatic checks for pricing below minimum" },
  { label: "Sales Order",  caption: "Convert approved quotes into confirmed orders" },
  { label: "Revenue",      caption: "Feed straight into your KPI dashboard" },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-white py-24 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            From First Contact to Closed Deal
          </h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            A clear, trackable path — every step logged, every handoff visible.
          </p>
        </div>

        {/* Horizontal stepper — scrolls on mobile */}
        <div className="mt-16 overflow-x-auto">
          <div className="min-w-max mx-auto">
            {/* Connector line */}
            <div className="relative flex items-start gap-0">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-start">
                  {/* Step */}
                  <div className="flex flex-col items-center w-32">
                    {/* Circle */}
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold text-sm",
                        i === 0 || i === STEPS.length - 1
                          ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                          : "border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {i + 1}
                    </div>
                    {/* Label */}
                    <p className="mt-3 text-center text-xs font-semibold text-slate-900 dark:text-slate-50">
                      {step.label}
                    </p>
                    {/* Caption */}
                    <p className="mt-1 text-center text-xs leading-tight text-slate-500 dark:text-slate-400 px-1">
                      {step.caption}
                    </p>
                  </div>

                  {/* Arrow connector */}
                  {i < STEPS.length - 1 && (
                    <div className="mt-4 flex items-center">
                      <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                      <div className="border-t-4 border-r-4 border-t-transparent border-r-slate-300 dark:border-r-slate-600 h-2 w-2 rotate-45 -ml-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
