import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 3;

// In-memory store — persists for the lifetime of the edge instance
// Not shared across regions/instances, but a meaningful deterrent against abuse
const rateLimit = new Map<string, { count: number; reset: number }>();

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in an hour." },
      { status: 429 }
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/roast",
};
