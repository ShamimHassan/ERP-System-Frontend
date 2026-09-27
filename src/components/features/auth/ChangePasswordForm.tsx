"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/zod-schemas";
import api from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type ShowFields = {
  oldPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
};

export default function ChangePasswordForm() {
  const [show, setShow] = useState<ShowFields>({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const { isSubmitting } = form.formState;

  function toggleShow(field: keyof ShowFields) {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  async function onSubmit(values: ChangePasswordFormData) {
    try {
      await api.post("/auth/change-password", {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully.");
      form.reset();
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        errorData?: { code?: string; details?: Array<{ field: string; message: string }> };
      };

      const code = error?.errorData?.code;
      const details = error?.errorData?.details;

      if (code === "INVALID_OLD_PASSWORD") {
        // Inline error on the specific field — not a generic toast
        form.setError("oldPassword", {
          type: "manual",
          message: "Current password is incorrect.",
        });
        return;
      }

      if (code === "VALIDATION_ERROR" && details?.length) {
        // Map backend field-level errors back to RHF
        details.forEach(({ field, message }) => {
          if (field === "oldPassword" || field === "newPassword" || field === "confirmPassword") {
            form.setError(field as keyof ChangePasswordFormData, {
              type: "manual",
              message,
            });
          }
        });
        return;
      }

      toast.error(error?.message ?? "Something went wrong. Please try again.");
    }
  }

  function PasswordField({
    name,
    label,
    showKey,
    autoComplete,
  }: {
    name: keyof ChangePasswordFormData;
    label: string;
    showKey: keyof ShowFields;
    autoComplete: string;
  }) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={show[showKey] ? "text" : "password"}
                  autoComplete={autoComplete}
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  tabIndex={-1}
                  aria-label={show[showKey] ? "Hide" : "Show"}
                >
                  {show[showKey] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <KeyRound className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Change Password
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update your account password
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">New Password</CardTitle>
          <CardDescription>
            Your new password must be at least 8 characters long.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <PasswordField
                name="oldPassword"
                label="Current Password"
                showKey="oldPassword"
                autoComplete="current-password"
              />
              <PasswordField
                name="newPassword"
                label="New Password"
                showKey="newPassword"
                autoComplete="new-password"
              />
              <PasswordField
                name="confirmPassword"
                label="Confirm New Password"
                showKey="confirmPassword"
                autoComplete="new-password"
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving…
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
