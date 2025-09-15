import { NextResponse } from "next/server";

export async function middleware(req) {
  let blocked = [];

  try {
    // WAJIB pakai absolute URL (vercel env var)
    const apiUrl = `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : process.env.NEXT_PUBLIC_BASE_URL}/api/block-ip`;

    const res = await fetch(apiUrl, {
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
    // Jangan pakai console.error di Edge → ganti silent
  }

  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();

  if (blocked.includes(ip)) {
    return NextResponse.redirect(new URL("/blocked.html", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
