import { NextResponse } from "next/server";

export async function middleware(req) {
  let blocked = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blocked-store`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.ADMIN_API_KEY || "changeme"}`
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      blocked = data.blocked || [];
    }
  } catch (e) {
    console.error("Middleware fetch failed:", e);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.ip ||
    req.headers.get("x-real-ip") ||
    "";

  if (blocked.includes(ip)) {
    return NextResponse.redirect(new URL("/blocked.html", req.url));
  }

  return NextResponse.next();
}

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
