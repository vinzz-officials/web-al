import { NextResponse } from 'next/server'

export function middleware(req) {
  const ip = (
    req.headers.get('x-forwarded-for') ||
    req.ip ||
    ''
  ).split(',')[0].trim()

  // ambil daftar ip yang diblok
  const blocked = global.__BLOCKED_IPS || []

  if (blocked.includes(ip)) {
    return NextResponse.redirect(new URL('/blocked.html', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
