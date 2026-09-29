const ROLES = [
  {
    title: "Admin",
    subtitle: "Full visibility",
    description: "Full visibility across every team, product, and report. Manage users, pricing, and system settings.",
    perks: ["All teams' data", "User management", "Audit logs", "Pricing control"],
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  {
    title: "Manager",
    subtitle: "Team scope",
    description: "Own team's leads, quotations, and performance — nothing more. Approve quotations requiring price override.",
    perks: ["Own team's data", "Quotation approval", "Team performance", "Reports"],
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    title: "Marketing Person",
    subtitle: "Personal scope",
    description: "Their own leads and deals, always private from peers. Submit quotations and track personal KPIs.",
    perks: ["Own leads only", "Own quotations", "Personal KPIs", "Customer contacts"],
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
];

export default function RoleAccessSection() {
  return (
    <section
      id="roles"
      className="bg-slate-50 py-24 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            The Right Data, For the Right Person
          </h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            No spreadsheets. No manual filtering. Everyone sees exactly what they
            should — enforced at the system level, not just hidden in the UI.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {ROLES.map((role) => (
            <div
              key={role.title}
              className={`rounded-2xl border ${role.border} bg-white p-8 shadow-sm dark:bg-slate-900`}
            >
              <div className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${role.badge}`}>
                {role.subtitle}
              </div>
              <h3 className={`text-xl font-bold ${role.color}`}>{role.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {role.description}
              </p>
              <ul className="mt-5 space-y-2">
                {role.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${role.color.replace("text-", "bg-")}`} />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
