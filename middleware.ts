import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const locales = ['bn', 'en']
const defaultLocale = 'bn'

// Get the preferred locale, following Next.js docs pattern
function getLocale(request: NextRequest): string {
  // Check the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || ''
  
  // Simple language detection: check if 'en' is preferred, otherwise use default (Bangla)
  if (acceptLanguage.includes('en')) return 'en'
  
  return defaultLocale
}

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect if there is no locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  // e.g. incoming request is /products -> /bn/products (for Bangla default)
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, favicon.ico)
    '/((?!_next|api|favicon.ico).*)',
  ],
}
