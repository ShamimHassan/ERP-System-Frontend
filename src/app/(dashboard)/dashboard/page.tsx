/**
 * Dashboard entry — role-switches to the correct dashboard component.
 * Full implementation in Step 10 (role-based components) and Step 22 (widgets).
 * Step 7 checkpoint: StatusBadge colors + fmtBDT formatting verified here.
 */
import StatusBadge from "@/components/shared/StatusBadge";
import { fmtBDT, fmtDate, fmtPct, getInitials } from "@/lib/formatters";

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-8">

      {/* ── Step 7 Checkpoint: StatusBadge ── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-300">
          Step 7 Checkpoint — StatusBadge colors
        </h2>
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Lead Statuses</p>
            <div className="flex flex-wrap gap-2">
              {["NEW","CONTACTED","QUALIFIED","PROPOSAL","NEGOTIATION","WON","LOST"].map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Quotation Statuses</p>
            <div className="flex flex-wrap gap-2">
              {["DRAFT","SENT","VIEWED","NEGOTIATION","APPROVED","REJECTED","EXPIRED","CONVERTED"].map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Order Statuses</p>
            <div className="flex flex-wrap gap-2">
              {["DRAFT","CONFIRMED","PROCESSING","COMPLETED","CANCELLED"].map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Survey / Priority</p>
            <div className="flex flex-wrap gap-2">
              {["PENDING","SCHEDULED","LOW","MEDIUM","HIGH"].map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 7 Checkpoint: Formatters ── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-300">
          Step 7 Checkpoint — Formatters
        </h2>
        <table className="text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-8">Function</th>
              <th className="pb-2 pr-8">Input</th>
              <th className="pb-2">Output</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="py-2 pr-8 font-mono text-slate-600 dark:text-slate-400">fmtBDT</td>
              <td className="py-2 pr-8 text-slate-500">500000</td>
              <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">{fmtBDT(500000)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-8 font-mono text-slate-600 dark:text-slate-400">fmtBDT</td>
              <td className="py-2 pr-8 text-slate-500">1234567</td>
              <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">{fmtBDT(1234567)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-8 font-mono text-slate-600 dark:text-slate-400">fmtDate</td>
              <td className="py-2 pr-8 text-slate-500">&quot;2026-09-27&quot;</td>
              <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">{fmtDate("2026-09-27")}</td>
            </tr>
            <tr>
              <td className="py-2 pr-8 font-mono text-slate-600 dark:text-slate-400">fmtPct</td>
              <td className="py-2 pr-8 text-slate-500">85.333</td>
              <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">{fmtPct(85.333)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-8 font-mono text-slate-600 dark:text-slate-400">getInitials</td>
              <td className="py-2 pr-8 text-slate-500">&quot;Marketing A1&quot;</td>
              <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">{getInitials("Marketing A1")}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Placeholder for Step 10 role-based dashboard components */}
      <p className="text-sm text-slate-400">
        Full dashboard widgets → Step 10 (routing) + Step 22 (charts).
      </p>
    </div>
  );
}
