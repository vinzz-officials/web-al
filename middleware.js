import { NextResponse } from "next/server";

// helper buat normalisasi IP
function normalizeIp(ip) {
  if (!ip) return "";
  return ip.replace(/^::ffff:/, "").replace("::1", "127.0.0.1");
}

export async function middleware(req) {
  let blocked = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blocked-store`, {
      method: "GET",
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      blocked = data.blocked || [];
    }
  } catch (e) {
    console.error("Middleware fetch failed:", e);
  }

  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const ip = normalizeIp(rawIp);

  console.log("Detected IP:", ip, "Blocked list:", blocked);

  if (blocked.includes(ip)) {
    return NextResponse.redirect(new URL("/blocked.html", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
