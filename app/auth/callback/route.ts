import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const callbackUrl = searchParams.get('callbackUrl')

  if (!code) {
    return NextResponse.redirect(`${origin}/giris`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data } = await supabase.auth.exchangeCodeForSession(code)

  if (callbackUrl && callbackUrl.startsWith('/')) {
    return NextResponse.redirect(`${origin}${callbackUrl}`)
  }

  const rol = (data?.user?.app_metadata as { rol?: string } | undefined)?.rol
  if (rol === 'hekim') {
    return NextResponse.redirect(`${origin}/dashboard/hekim/gelen-kutu`)
  }

  return NextResponse.redirect(`${origin}/hasta`)
}
