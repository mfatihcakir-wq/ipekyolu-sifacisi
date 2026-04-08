import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb
    .from('klasik_kaynaklar')
    .select('kaynak_kodu, eser_adi, hekim_adi')
    .order('kaynak_kodu')

  if (!data) return NextResponse.json({ kaynaklar: [] })

  const sayac: Record<string, { eser_adi: string; hekim_adi: string; kayit_sayisi: number }> = {}
  data.forEach(r => {
    if (!sayac[r.kaynak_kodu]) {
      sayac[r.kaynak_kodu] = { eser_adi: r.eser_adi, hekim_adi: r.hekim_adi, kayit_sayisi: 0 }
    }
    sayac[r.kaynak_kodu].kayit_sayisi++
  })

  const kaynaklar = Object.entries(sayac)
    .map(([kaynak_kodu, v]) => ({ kaynak_kodu, ...v }))
    .filter(k => k.kayit_sayisi > 50)
    .sort((a, b) => b.kayit_sayisi - a.kayit_sayisi)

  return NextResponse.json({ kaynaklar })
}
