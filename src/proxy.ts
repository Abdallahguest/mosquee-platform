import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API : jamais touchée
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Détecter routes admin/auth (avec ou sans préfixe locale)
  const isAdminRoute =
  pathname.includes("/admin") || pathname.includes("/super-admin")
  const isAuthRoute =
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password")

  if (isAdminRoute || isAuthRoute) {
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ??
      request.cookies.get("__Secure-better-auth.session_token")?.value

    if (isAdminRoute && !sessionToken) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    // Ne pas rediriger reset-password même si connecté
    const isResetRoute = pathname.includes("/reset-password")
    if (isAuthRoute && sessionToken && !isResetRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }
  }

  // i18n pour TOUTES les routes (y compris admin/auth maintenant)
  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
