// proxy.ts — Next.js 16 edge auth redirects (replaces middleware.ts).
// UX only: backend still enforces RBAC on every call.
// Fully implemented in Step 9 if needed.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
