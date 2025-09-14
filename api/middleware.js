import { NextResponse } from "next/server";

let cachedBlocked = [];
let lastFetch = 0;

async function getBlocked() {
  const now = Date.now();
  // cache 5 detik biar gak spam API
  if (now - lastFetch < 5000 && cachedBlocked.length) {
    return cachedBlocked;
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blocked`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      cachedBlocked = data.blocked || [];
      lastFetch = now;
    }
  } catch (e) {
    console.error("middleware fetch blocked error", e);
  }
  return cachedBlocked;
}

export async function middleware(req) {
  const ip =
    (req.headers.get("x-forwarded-for") || req.ip || "").split(",")[0].trim();

  const blocked = await getBlocked();

  if (blocked.includes(ip)) {
    return NextResponse.redirect(new URL("/blocked.html", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
