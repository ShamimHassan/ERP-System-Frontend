const STATS = [
  { number: "1,200+", label: "Leads Managed" },
  { number: "98%",    label: "Quotation Accuracy" },
  { number: "4",      label: "Core Service Lines" },
  { number: "24/7",   label: "System Availability" },
];

export default function StatsSection() {
  return (
    <section
      id="stats"
      className="bg-slate-900 py-20 dark:bg-slate-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Trusted to Move Deals Forward
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-5xl font-black text-white">{stat.number}</p>
              <p className="mt-2 text-base font-medium text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
