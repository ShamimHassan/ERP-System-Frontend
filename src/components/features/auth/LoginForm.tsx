"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Users, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { loginSchema, type LoginFormData } from "@/lib/zod-schemas";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ── Demo accounts ─────────────────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@erp.com",
    password: "Admin@123",
    icon: ShieldCheck,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/50",
    border: "border-violet-200 dark:border-violet-700",
  },
  {
    role: "Manager",
    email: "manager-a@erp.com",
    password: "Manager@123",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50",
    border: "border-blue-200 dark:border-blue-700",
  },
  {
    role: "Marketing",
    email: "mkt-a1@erp.com",
    password: "Mkt@123",
    icon: BarChart2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50",
    border: "border-emerald-200 dark:border-emerald-700",
  },
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
      const data = await api.post("/auth/login", values) as unknown as LoginResponse;
      setLogin(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      // Navigate after a short tick so the browser has time to detect
      // the successful form submission and show the "Save password?" prompt
      // on this page (not on the next page).
      setTimeout(() => router.push("/dashboard"), 100);
    } catch (err: unknown) {
      const error = err as { message?: string; errorData?: { code?: string } };
      const code = error?.errorData?.code;
      if (code === "INVALID_CREDENTIALS" || (err as { response?: { status?: number } })?.response?.status === 401) {
        toast.error("Invalid email or password.");
      } else {
        toast.error(error?.message ?? "Something went wrong. Please try again.");
      }
    }
  }

  async function loginAsDemo(email: string, password: string) {
    form.setValue("email", email);
    form.setValue("password", password);
    await form.handleSubmit(onSubmit)();
  }

  const showDemoAccounts =
    process.env.NEXT_PUBLIC_SHOW_ROLE_SWITCHER === "true" ||
    process.env.NODE_ENV === "development";

  return (
    <div className="w-full space-y-8">

      {/* ── Back link ── */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* ── Headline ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Welcome back
        </h1>
        <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
          Sign in to continue to your dashboard.
        </p>
      </div>

      {/* ── Form ── */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
          id="login-form"
          action="#"
          method="post"
        >

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="username email"
                    autoFocus
                    disabled={isSubmitting}
                    className="h-12 text-base"
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
                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      className="h-12 pr-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
            className="h-12 w-full bg-[#1a3a5c] text-base font-semibold text-white hover:bg-[#1a4a72] dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
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

      {/* ── Demo accounts ── */}
      {showDemoAccounts && (
        <div className="space-y-4">
          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
              Quick-fill for demo
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Role buttons */}
          <div className="grid grid-cols-3 gap-3">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => loginAsDemo(acc.email, acc.password)}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-colors disabled:opacity-50 ${acc.border} ${acc.bg}`}
                >
                  <Icon className={`h-6 w-6 ${acc.color}`} />
                  <span className={`text-sm font-semibold ${acc.color}`}>
                    {acc.role}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-sm text-slate-400 dark:text-slate-500">
            Click a role to log in instantly
          </p>
        </div>
      )}

    </div>
  );
}
