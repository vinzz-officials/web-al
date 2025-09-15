import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // === Cek cookie ===
  const session = req.cookies.get("admin_session")?.value;
  const banned = req.cookies.get("banned_session")?.value;

  // Kalau device kebanned → redirect ke blocked
  if (banned) {
    url.pathname = "/blocked.html";
    return NextResponse.redirect(url);
  }

  // Proteksi halaman admin
  const protectedPaths = ["/admin.html"];
  if (protectedPaths.includes(pathname) && !session) {
    url.pathname = "/login.html";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"], // semua request dicek
};
