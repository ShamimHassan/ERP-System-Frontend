const TESTIMONIALS = [
  {
    quote:
      "I no longer chase spreadsheets to know where a deal stands — everything's in one dashboard.",
    name: "Rafiq Ahmed",
    role: "Marketing Manager",
    initials: "RA",
    color: "bg-blue-600",
  },
  {
    quote:
      "Price approvals used to take a day over email. Now it's instant and tracked.",
    name: "Nusrat Jahan",
    role: "Marketing Person",
    initials: "NJ",
    color: "bg-emerald-600",
  },
  {
    quote:
      "Full visibility across every manager and team, without digging through reports.",
    name: "Admin Team",
    role: "System Administrator",
    initials: "AT",
    color: "bg-violet-600",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="bg-white py-24 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            What Our Teams Say
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-800/50"
            >
              {/* Quote mark */}
              <span className="mb-4 text-5xl leading-none text-slate-200 dark:text-slate-700 font-serif select-none">&ldquo;</span>
              <p className="flex-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                {t.quote}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.color} text-sm font-bold text-white`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
