"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. "Lead", "Customer", "Quotation" */
  resourceName?: string;
  /** Optional name of the specific item being deleted */
  itemLabel?: string;
  /** Called when the user confirms deletion */
  onConfirm: () => void;
  /** True while the delete mutation is in-flight */
  isDeleting?: boolean;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  resourceName = "record",
  itemLabel,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !isDeleting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete {resourceName}?</DialogTitle>
          <DialogDescription>
            {itemLabel ? (
              <>
                Are you sure you want to delete{" "}
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  &quot;{itemLabel}&quot;
                </span>
                ? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete this {resourceName.toLowerCase()}?
                This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting…
              </>
            ) : (
              `Delete ${resourceName}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
