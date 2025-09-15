import { NextResponse } from "next/server";

export async function middleware(req) {
  let blocked = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/block-ip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list" }),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      blocked = data.blocked || [];
    }
  } catch (e) {
    console.error("middleware fetch blocked error", e);
  }

  const ip =
    (req.headers.get("x-forwarded-for") || req.ip || "").split(",")[0].trim();

  if (blocked.includes(ip)) {
    return NextResponse.redirect(new URL("/blocked.html", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
