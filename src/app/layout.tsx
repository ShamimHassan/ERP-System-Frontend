import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import PrefetchProvider from "@/components/providers/PrefetchProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP Sales & Marketing",
  description: "ERP Sales & Marketing Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {/*
          Provider order matters:
          1. ThemeProvider   — must be outermost so dark/light class is on <html> before any render
          2. QueryProvider   — must wrap everything that uses useQuery / useMutation
          3. AuthProvider    — calls GET /auth/me on mount (needs QueryProvider's axios instance);
                               renders a neutral spinner until auth check resolves to prevent
                               hydration mismatch between SSR (no localStorage) and client.
          4. Toaster         — global toast notifications (sonner), always mounted
        */}
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <PrefetchProvider>
                {children}
              </PrefetchProvider>
            </AuthProvider>
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
