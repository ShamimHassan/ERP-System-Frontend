"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useConvertLead } from "./useLeads";
import type { Lead } from "@/types/api.types";

const CONVERTIBLE_STATUSES = ["QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON"] as const;

interface ConvertLeadButtonProps {
  lead: Lead;
}

export default function ConvertLeadButton({ lead }: ConvertLeadButtonProps) {
  const [open, setOpen] = useState(false);
  const convert = useConvertLead(lead.id);

  const canConvert = (CONVERTIBLE_STATUSES as readonly string[]).includes(lead.status);

  if (!canConvert) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
        onClick={() => setOpen(true)}
        disabled={convert.isPending}
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
        Convert to Customer
      </Button>

      <Dialog open={open} onOpenChange={(v) => !convert.isPending && setOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
              <ArrowRightLeft className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle>Convert Lead to Customer?</DialogTitle>
            <DialogDescription>
              This will create a new customer record from{" "}
              <span className="font-medium text-slate-800 dark:text-slate-200">
                &quot;{lead.leadName}&quot;
              </span>
              . The lead status will be updated to <strong>CONVERTED</strong>.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={convert.isPending}>
              Cancel
            </Button>
            <Button
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={convert.isPending}
              onClick={() => convert.mutate()}
            >
              {convert.isPending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Converting…
                </>
              ) : (
                "Yes, Convert"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
