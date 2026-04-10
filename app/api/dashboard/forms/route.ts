export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'm.fatih.cakir@gmail.com'

// Service role client — lazy init (build sirasinda env yoksa hata vermez)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function GET(request: NextRequest) {
  try {
    // Admin yetki kontrolu — SSR client ile cookie'den user
    const cookieStore = cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { /* read-only */ },
        },
      }
    )
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    // URL param: tip=genel|cilt|all (varsayilan all)
    const tip = request.nextUrl.searchParams.get('tip') || 'all'

    const result: {
      genel: unknown[]
      cilt: unknown[]
      errors: { genel: string | null; cilt: string | null }
    } = { genel: [], cilt: [], errors: { genel: null, cilt: null } }

    const supabaseAdmin = getSupabaseAdmin()

    if (tip === 'all' || tip === 'genel') {
      const { data, error } = await supabaseAdmin
        .from('detailed_forms')
        .select('*')
        .order('created_at', { ascending: false })
      result.genel = data || []
      result.errors.genel = error?.message || null
    }

    if (tip === 'all' || tip === 'cilt') {
      const { data, error } = await supabaseAdmin
        .from('cilt_forms')
        .select('id, created_at, durum, sorunlar, user_id, sonuc_verisi')
        .order('created_at', { ascending: false })
      result.cilt = data || []
      result.errors.cilt = error?.message || null
    }

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Hata'
    console.error('[dashboard/forms]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
