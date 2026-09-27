export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-64 border-r border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 lg:block">
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Sidebar
        </div>
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          (Step 9)
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="h-14 border-b border-slate-200 bg-white px-6 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
          <div className="flex h-full items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              TopBar (Step 9)
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
