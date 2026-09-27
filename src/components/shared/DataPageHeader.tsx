"use client";

import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterPopover, { type FilterField } from "./FilterPopover";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

interface DataPageHeaderProps {
  /** Page heading */
  title: string;
  /** Current search string (controlled) */
  search?: string;
  /** Called 300ms after the user stops typing */
  onSearchChange?: (value: string) => void;
  /** Filter field definitions — passed to FilterPopover */
  filterFields?: FilterField[];
  /** Current filter values */
  filterValues?: Record<string, string>;
  /** Called when filters applied */
  onFilterApply?: (values: Record<string, string>) => void;
  /** Called when filters reset */
  onFilterReset?: () => void;
  /** If provided, shows a "+ {createLabel}" button */
  createHref?: string;
  createLabel?: string;
  /** If false, hides the create button even if createHref is set */
  canCreate?: boolean;
  /** Extra content on the right (e.g. export button) */
  actions?: React.ReactNode;
}

export default function DataPageHeader({
  title,
  search = "",
  onSearchChange,
  filterFields,
  filterValues = {},
  onFilterApply,
  onFilterReset,
  createHref,
  createLabel = "New",
  canCreate = true,
  actions,
}: DataPageHeaderProps) {
  // Local input state so the input feels instant; debounce fires the callback
  const [inputValue, setInputValue] = useState(search);
  const debounced = useDebounce(inputValue, 300);

  // Sync external search value → input (e.g. on URL param change)
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  // Fire callback when debounced value changes
  useEffect(() => {
    if (debounced !== search) {
      onSearchChange?.(debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Title */}
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
        {title}
      </h1>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        {onSearchChange !== undefined && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search…"
              className="h-9 w-48 pl-8 pr-7 text-sm sm:w-56"
              aria-label="Search"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => { setInputValue(""); onSearchChange?.(""); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filter popover */}
        {filterFields && filterFields.length > 0 && (
          <FilterPopover
            fields={filterFields}
            values={filterValues}
            onApply={onFilterApply ?? (() => {})}
            onReset={onFilterReset ?? (() => {})}
          />
        )}

        {/* Extra actions */}
        {actions}

        {/* Create button */}
        {canCreate && createHref && (
          <Button asChild size="sm" className="h-9 gap-1.5">
            <Link href={createHref}>
              <Plus className="h-3.5 w-3.5" />
              {createLabel}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
