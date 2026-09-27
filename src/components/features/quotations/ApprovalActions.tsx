"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useApproveQuotation, useRejectQuotation, useConvertToOrder } from "./useQuotations";
import { useAuthStore } from "@/store/auth.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Quotation } from "@/types/api.types";

const rejectSchema = z.object({ remarks: z.string().min(1, "Remarks required").max(1000) });

interface ApprovalActionsProps { quotation: Quotation }

export default function ApprovalActions({ quotation }: ApprovalActionsProps) {
  const user = useAuthStore((s) => s.user);
  const canApprove  = can.approveQuote((user?.role as Role) ?? "MARKETING");
  const canConvert  = quotation.status === "APPROVED";
  const canApproveNow = canApprove && (quotation.status === "SENT" || quotation.status === "VIEWED" || quotation.status === "NEGOTIATION" || quotation.status === "DRAFT");
  const canRejectNow  = canApprove && (quotation.status === "SENT" || quotation.status === "VIEWED" || quotation.status === "NEGOTIATION" || quotation.status === "DRAFT");

  const approve = useApproveQuotation(quotation.id);
  const reject  = useRejectQuotation(quotation.id);
  const convert = useConvertToOrder(quotation.id);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  const rejectForm = useForm<{ remarks: string }>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { remarks: "" },
  });

  if (!canApproveNow && !canRejectNow && !canConvert) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canApproveNow && (
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            disabled={approve.isPending}
            onClick={() => approve.mutate()}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {approve.isPending ? "Approving…" : "Approve"}
          </Button>
        )}
        {canRejectNow && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
            disabled={reject.isPending}
            onClick={() => setRejectOpen(true)}
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
        )}
        {canConvert && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
            disabled={convert.isPending}
            onClick={() => setConvertOpen(true)}
          >
            {convert.isPending ? "Converting…" : "Convert to Order"}
          </Button>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={(v) => !reject.isPending && setRejectOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Quotation?</DialogTitle>
            <DialogDescription>Provide remarks for rejecting {quotation.quotationNumber}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={rejectForm.handleSubmit(({ remarks }) =>
            reject.mutate({ remarks }, { onSuccess: () => { setRejectOpen(false); rejectForm.reset(); } })
          )}>
            <div className="py-3">
              <Label className="mb-1.5 block text-sm">Remarks <span className="text-red-500">*</span></Label>
              <Textarea
                {...rejectForm.register("remarks")}
                rows={3}
                placeholder="Reason for rejection…"
                disabled={reject.isPending}
              />
              {rejectForm.formState.errors.remarks && (
                <p className="mt-1 text-xs text-red-500">{rejectForm.formState.errors.remarks.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRejectOpen(false)} disabled={reject.isPending}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={reject.isPending}>
                {reject.isPending ? "Rejecting…" : "Reject Quotation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Convert to order dialog */}
      <Dialog open={convertOpen} onOpenChange={(v) => !convert.isPending && setConvertOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convert to Order?</DialogTitle>
            <DialogDescription>
              This will create a Sales Order from quotation{" "}
              <strong>{quotation.quotationNumber}</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConvertOpen(false)} disabled={convert.isPending}>Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={convert.isPending}
              onClick={() => convert.mutate()}
            >
              {convert.isPending ? "Converting…" : "Yes, Convert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
