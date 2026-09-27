/**
 * Root page — redirects authenticated users to /dashboard.
 * During development this also serves as a checkpoint demo.
 */
import { redirect } from "next/navigation";

export default function RootPage() {
  // Server component redirect — authenticated flow goes to dashboard.
  // The dashboard layout handles unauthenticated redirect to /login.
  redirect("/dashboard");
}
