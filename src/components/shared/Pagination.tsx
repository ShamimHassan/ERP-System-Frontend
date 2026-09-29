"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaginationMeta } from "@/types/api.types";

const PAGE_SIZES = [10, 20, 50, 100];

/**
 * Pagination footer bar — compact, responsive, same look as shadcn UI.
 *
 * Shows:
 *   [first][prev]  Page X of Y  (Z total records)  [next][last]    [Page size: 20 ▾]
 */
export default function Pagination({
  meta,
  page,
  onPageChange,
  limit,
  onLimitChange,
}: {
  meta: PaginationMeta;
  page: number;
  onPageChange: (p: number) => void;
  limit: number;
  onLimitChange: (l: number) => void;
}) {
  const { total, totalPages } = meta;
  const isFirst = page <= 1;
  const isLast  = page >= totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
      {/* Left — record count */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-200">{total}</span> total
        {" · "}page <span className="font-medium text-slate-700 dark:text-slate-200">{page}</span> of{" "}
        <span className="font-medium text-slate-700 dark:text-slate-200">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Page buttons */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={isFirst}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page - 1)}
            disabled={isFirst}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="mx-1 min-w-[64px] text-center text-xs font-medium text-slate-600 dark:text-slate-300">
            {page} / {totalPages}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page + 1)}
            disabled={isLast}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={isLast}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Page size */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Per page</span>
          <Select
            value={String(limit)}
            onValueChange={(v) => onLimitChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[84px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
