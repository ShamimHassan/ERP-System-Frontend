"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginFormData } from "@/lib/zod-schemas";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Demo accounts from seed — shown only in dev or when NEXT_PUBLIC_SHOW_ROLE_SWITCHER=true
const DEMO_ACCOUNTS = [
  { role: "Admin",     email: "admin@erp.com",     password: "Admin@123" },
  { role: "Manager A", email: "manager-a@erp.com", password: "Manager@123" },
  { role: "Marketing", email: "mkt-a1@erp.com",    password: "Mkt@123" },
];

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "MARKETING";
    managerId: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { setLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormData) {
    try {
      // api-client response interceptor unwraps the envelope
      // so the resolved value is LoginResponse directly
      const data = await api.post("/auth/login", values) as unknown as LoginResponse;
      setLogin(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string; errorData?: { code?: string } };
      const code = error?.errorData?.code;

      if (code === "INVALID_CREDENTIALS" || (err as { response?: { status?: number } })?.response?.status === 401) {
        // Never reveal which field is wrong — security best practice
        toast.error("Invalid email or password.");
      } else {
        toast.error(error?.message ?? "Something went wrong. Please try again.");
      }
    }
  }

  function fillDemo(email: string, password: string) {
    form.setValue("email", email);
    form.setValue("password", password);
  }

  const showDemoAccounts =
    process.env.NEXT_PUBLIC_SHOW_ROLE_SWITCHER === "true" ||
    process.env.NODE_ENV === "development";

  return (
    <div className="w-full space-y-6">
      {/* ── Header ── */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100">
          <LogIn className="h-6 w-6 text-white dark:text-slate-900" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          ERP Sales & Marketing
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign in to your account
        </p>
      </div>

      {/* ── Login Card ── */}
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Sign in</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        autoFocus
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isSubmitting}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
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

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── Demo accounts (dev / interview only) ── */}
      {showDemoAccounts && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Demo Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.password)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    {acc.role}
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {acc.email}
                  </span>
                </button>
              ))}
              <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-500">
                Click a row to fill credentials, then Sign in
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
