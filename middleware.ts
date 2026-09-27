// middleware.ts — edge auth redirects (UX only, backend enforces RBAC).
// Fully implemented in Step 9.
// NOTE: Next.js 16 shows a deprecation warning for middleware.ts; migrate to proxy.ts when ready.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
