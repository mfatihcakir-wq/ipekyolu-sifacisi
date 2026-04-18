import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const AUTH_ROUTE_RE = /^\/(?:[a-z]{2}\/)?(?:dashboard|hasta|analiz|profil|admin)(?:\/|$)/

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Duplicate URL redirect
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/giris', request.url), 301)
  }
  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/kayit', request.url), 301)
  }

  const authGerekli = AUTH_ROUTE_RE.test(pathname)

  if (!authGerekli) {
    return intlMiddleware(request)
  }

  const cookiesToSetForResponse: Array<{ name: string; value: string; options?: Record<string, unknown> }> = []
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            cookiesToSetForResponse.push({ name, value, options })
          })
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/giris', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  const rol = (user.app_metadata as { rol?: string } | undefined)?.rol

  // Hekim rota koruması: /dashboard/hekim/* sadece rol=hekim
  if (/\/dashboard\/hekim/.test(pathname) && rol !== 'hekim') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin rota koruması: /admin sadece hekim veya admin email
  if (/^\/(?:[a-z]{2}\/)?admin(?:\/|$)/.test(pathname)) {
    const adminEmail = user.email === 'm.fatih.cakir@gmail.com'
    if (rol !== 'hekim' && !adminEmail) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  const intlResponse = intlMiddleware(request)
  cookiesToSetForResponse.forEach(c => intlResponse.cookies.set(c.name, c.value, c.options))
  return intlResponse
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
