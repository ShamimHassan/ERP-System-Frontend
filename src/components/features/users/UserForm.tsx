"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { useCreateUser, useUpdateUser, type UserRow } from "./useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useUsers } from "./useUsers";

const createSchema = z.object({
  name:      z.string().min(1, "Name is required").max(100),
  email:     z.string().email("Enter a valid email"),
  password:  z.string().min(8, "At least 8 characters"),
  role:      z.enum(["ADMIN", "MANAGER", "MARKETING"] as const),
  status:    z.enum(["ACTIVE", "INACTIVE"] as const).default("ACTIVE"),
  managerId: z.string().uuid().optional().or(z.literal("")),
});

const editSchema = z.object({
  name:      z.string().min(1).max(100).optional(),
  email:     z.string().email().optional(),
  role:      z.enum(["ADMIN", "MANAGER", "MARKETING"] as const).optional(),
  status:    z.enum(["ACTIVE", "INACTIVE"] as const).optional(),
  managerId: z.string().uuid().optional().or(z.literal("")),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData   = z.infer<typeof editSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user?: UserRow;
}

export default function UserForm({ open, onOpenChange, user }: UserFormProps) {
  const isEdit = !!user;
  const [showPw, setShowPw] = useState(false);
  const create = useCreateUser();
  const update = useUpdateUser(user?.id ?? "");

  const { data: usersData } = useUsers({ limit: 100 });
  const managers = (usersData?.data ?? []).filter((u) => u.role === "MANAGER" || u.role === "ADMIN");

  const form = useForm<CreateFormData & EditFormData>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as never,
    defaultValues: {
      name:      user?.name      ?? "",
      email:     user?.email     ?? "",
      password:  "",
      role:      user?.role      ?? "MARKETING",
      status:    user?.status    ?? "ACTIVE",
      managerId: user?.managerId ?? "",
    },
  });

  const { isSubmitting } = form.formState;

  function onSubmit(values: CreateFormData & EditFormData) {
    const payload = { ...values, managerId: values.managerId || null };
    if (isEdit) {
      // Remove empty password from update payload
      if (!("password" in payload) || !payload.password) delete (payload as Record<string, unknown>).password;
      update.mutate(payload, { onSuccess: () => { onOpenChange(false); form.reset(); } });
    } else {
      create.mutate(payload, { onSuccess: () => { onOpenChange(false); form.reset(); } });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isSubmitting) { onOpenChange(v); form.reset(); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "New User"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} placeholder="Full name" disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} type="email" placeholder="user@company.com" disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isSubmitting}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? "ACTIVE"} disabled={isSubmitting}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="managerId" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Manager</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isSubmitting}>
                    <FormControl><SelectTrigger><SelectValue placeholder="No manager (optional)" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {managers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} ({m.role})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              {!isEdit && (
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} type={showPw ? "text" : "password"} placeholder="Min 8 characters" disabled={isSubmitting} className="pr-10" autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{isEdit ? "Saving…" : "Creating…"}</> : isEdit ? "Save Changes" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
