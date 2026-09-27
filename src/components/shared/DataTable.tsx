"use client";

import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import EmptyState from "./EmptyState";

// ── Types ─────────────────────────────────────────────────────────────────

export type SortDir = "asc" | "desc" | "";

export interface ColumnDef<TData> {
  key: string;
  header: string;
  /** Render cell value. Receives the row object. */
  cell: (row: TData) => React.ReactNode;
  sortable?: boolean;
  /** Extra className for the <td> */
  className?: string;
  /** Extra className for the <th> */
  headerClassName?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RowAction<TData> {
  label: string;
  icon?: React.ElementType;
  onClick: (row: TData) => void;
  /** If true, renders as destructive (red) */
  destructive?: boolean;
  /** Hide this action based on row data */
  hidden?: (row: TData) => boolean;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[] | undefined;
  isLoading?: boolean;
  /** Pagination meta from API response */
  meta?: PaginationMeta;
  /** Called when page changes */
  onPageChange?: (page: number) => void;
  /** Called when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Current sort key */
  sortKey?: string;
  /** Current sort direction */
  sortDir?: SortDir;
  /** Called when a sortable column header is clicked */
  onSort?: (key: string) => void;
  /** Row action buttons rendered in the last column */
  rowActions?: RowAction<TData>[];
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state CTA */
  emptyAction?: { label: string; onClick: () => void };
  /** getRowKey for React key prop */
  getRowKey?: (row: TData) => string;
  className?: string;
}

// ── Sort icon ─────────────────────────────────────────────────────────────
function SortIcon({ columnKey, sortKey, sortDir }: {
  columnKey: string; sortKey?: string; sortDir?: SortDir;
}) {
  if (sortKey !== columnKey) return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-slate-400" />;
  if (sortDir === "asc")  return <ChevronUp   className="ml-1 inline h-3 w-3 text-slate-700 dark:text-slate-300" />;
  if (sortDir === "desc") return <ChevronDown className="ml-1 inline h-3 w-3 text-slate-700 dark:text-slate-300" />;
  return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-slate-400" />;
}

// ── Pagination ─────────────────────────────────────────────────────────────
function Pagination({
  meta,
  onPageChange,
  onPageSizeChange,
}: {
  meta: PaginationMeta;
  onPageChange?: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
}) {
  const { page, limit, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Build page number array with ellipsis
  function pageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3) return [1, "...", totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages];
    return [1, "...", page-1, page, page+1, "...", totalPages];
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      {/* Count + page size */}
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>{from}–{to} of {total} rows</span>
        {onPageSizeChange && (
          <Select value={String(limit)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-7 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline" size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange?.(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {pageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-slate-400">…</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className={cn("h-7 min-w-7 px-2 text-xs", p === page && "pointer-events-none")}
              onClick={() => onPageChange?.(p as number)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline" size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange?.(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Default row action icons ───────────────────────────────────────────────
const DEFAULT_ACTION_ICONS: Record<string, React.ElementType> = {
  View: Eye, Edit: Pencil, Delete: Trash2,
};

// ── Main DataTable ─────────────────────────────────────────────────────────
export default function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  meta,
  onPageChange,
  onPageSizeChange,
  sortKey,
  sortDir,
  onSort,
  rowActions,
  emptyMessage = "No records found.",
  emptyAction,
  getRowKey,
  className,
}: DataTableProps<TData>) {
  const hasActions = rowActions && rowActions.length > 0;
  const skeletonRows = 5;

  return (
    <div className={cn("overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900/60">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
                    col.sortable && "cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-100",
                    col.headerClassName
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  {col.header}
                  {col.sortable && (
                    <SortIcon columnKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                  )}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading skeleton rows */}
            {isLoading && Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="border-slate-100 dark:border-slate-800">
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Skeleton className="h-7 w-7 rounded" />
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}

            {/* Empty state */}
            {!isLoading && (!data || data.length === 0) && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="py-12 text-center"
                >
                  <EmptyState
                    message={emptyMessage}
                    action={emptyAction}
                  />
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading && data?.map((row, rowIdx) => {
              const key = getRowKey ? getRowKey(row) : String(rowIdx);
              return (
                <TableRow
                  key={key}
                  className="border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn("py-3 text-sm text-slate-700 dark:text-slate-300", col.className)}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}

                  {hasActions && (
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {rowActions!
                          .filter((a) => !a.hidden?.(row))
                          .map((action) => {
                            const Icon = action.icon ?? DEFAULT_ACTION_ICONS[action.label];
                            return (
                              <Button
                                key={action.label}
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7",
                                  action.destructive
                                    ? "text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                )}
                                onClick={() => action.onClick(row)}
                                aria-label={action.label}
                                title={action.label}
                              >
                                {Icon && <Icon className="h-3.5 w-3.5" />}
                              </Button>
                            );
                          })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 0 && (
        <Pagination
          meta={meta}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
