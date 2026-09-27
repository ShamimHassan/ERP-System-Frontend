import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          Provider order matters:
          1. QueryProvider   — must wrap everything that uses useQuery / useMutation
          2. AuthProvider    — calls GET /auth/me on mount (needs QueryProvider's axios instance);
                               renders a neutral spinner until auth check resolves to prevent
                               hydration mismatch between SSR (no localStorage) and client.
          3. Toaster         — global toast notifications (sonner), always mounted
        */}
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
