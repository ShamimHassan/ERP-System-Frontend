"use client";

import { useEffect } from "react";

/**
 * BackendWarmup — fires a lightweight ping to the backend API as soon as
 * the login page mounts. This wakes up the Vercel serverless function so
 * that by the time the user types their credentials and clicks Sign In,
 * the cold-start delay is already gone.
 *
 * Uses the native fetch API (not Axios) to avoid any interceptor overhead.
 * Errors are silently ignored — this is best-effort only.
 */
export default function BackendWarmup() {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) return;

    // Ping a cheap endpoint — /health or the services list (tiny response)
    fetch(`${url}/services?limit=1`, {
      method: "GET",
      headers: { Accept: "application/json" },
      // No auth needed — public endpoint; ignore the 401/403 response
    }).catch(() => {
      // Silently ignore — warmup is fire-and-forget
    });
  }, []);

  // Renders nothing — purely a side-effect component
  return null;
}
