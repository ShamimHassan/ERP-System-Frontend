"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ── Filter field definitions ───────────────────────────────────────────────

export type FilterFieldType = "select" | "date" | "text";

export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
  /** For type="select" */
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface FilterPopoverProps {
  /** Field definitions for this module */
  fields: FilterField[];
  /** Current active values — key: value */
  values: Record<string, string>;
  /** Called when Apply is clicked with merged updated values */
  onApply: (values: Record<string, string>) => void;
  /** Called when Reset is clicked */
  onReset: () => void;
}

// ── Common reusable filter field sets ─────────────────────────────────────

export const DATE_RANGE_FIELDS: FilterField[] = [
  { key: "dateFrom", label: "Date From", type: "date" },
  { key: "dateTo",   label: "Date To",   type: "date" },
];

export const STATUS_FIELD = (options: { label: string; value: string }[]): FilterField => ({
  key: "status", label: "Status", type: "select", options,
});

export const PRIORITY_FIELD: FilterField = {
  key: "priority", label: "Priority", type: "select",
  options: [
    { label: "Low",    value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High",   value: "HIGH" },
  ],
};

// ── Component ──────────────────────────────────────────────────────────────

export default function FilterPopover({
  fields,
  values,
  onApply,
  onReset,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(values);

  // Count active filters (non-empty, non-page params)
  const activeCount = Object.entries(values).filter(
    ([k, v]) => v && k !== "page" && k !== "limit" && k !== "search" && k !== "sort"
  ).length;

  function handleOpen(isOpen: boolean) {
    if (isOpen) setDraft({ ...values }); // sync draft when opening
    setOpen(isOpen);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleReset() {
    setDraft({});
    onReset();
    setOpen(false);
  }

  function setField(key: string, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative h-9 gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Filters</p>
          <Button
            variant="ghost" size="icon" className="h-6 w-6"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Fields */}
        <div className="space-y-4 p-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {field.label}
              </Label>

              {field.type === "select" && (
                <Select
                  value={draft[field.key] ?? ""}
                  onValueChange={(v) => setField(field.key, v === "__all__" ? "" : v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder={`All ${field.label}s`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "date" && (
                <Input
                  type="date"
                  value={draft[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  className="h-8 text-sm"
                />
              )}

              {field.type === "text" && (
                <Input
                  type="text"
                  value={draft[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={field.placeholder ?? `Filter by ${field.label}…`}
                  className="h-8 text-sm"
                />
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost" size="sm"
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            onClick={handleReset}
          >
            Reset all
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={handleApply}>
            Apply filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
