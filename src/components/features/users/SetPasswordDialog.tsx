"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useSetPassword } from "./useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const schema = z.object({ newPassword: z.string().min(8, "At least 8 characters") });
type FormData = z.infer<typeof schema>;

interface SetPasswordDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  userName: string;
}

export default function SetPasswordDialog({ open, onOpenChange, userId, userName }: SetPasswordDialogProps) {
  const [show, setShow] = useState(false);
  const setPassword = useSetPassword(userId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "" },
  });

  function onSubmit({ newPassword }: FormData) {
    setPassword.mutate(newPassword, {
      onSuccess: () => { onOpenChange(false); form.reset(); },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!setPassword.isPending) { onOpenChange(v); form.reset(); } }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40">
            <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle>Set Password</DialogTitle>
          <DialogDescription>
            Set a new password for <span className="font-medium text-slate-800 dark:text-slate-200">{userName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">New Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                {...form.register("newPassword")}
                type={show ? "text" : "password"}
                placeholder="Minimum 8 characters"
                disabled={setPassword.isPending}
                className="pr-10"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1} aria-label={show ? "Hide" : "Show"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{form.formState.errors.newPassword.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={setPassword.isPending}>Cancel</Button>
            <Button type="submit" disabled={setPassword.isPending}>
              {setPassword.isPending ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Saving…</> : "Set Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
