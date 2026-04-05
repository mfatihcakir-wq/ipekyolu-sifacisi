import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { ad_soyad, sehir, yorum, puan } = await req.json()
  if (!ad_soyad || !yorum) {
    return NextResponse.json({ error: 'Ad ve yorum zorunlu' }, { status: 400 })
  }
  if (yorum.length > 500) {
    return NextResponse.json({ error: 'Yorum en fazla 500 karakter' }, { status: 400 })
  }
  const { error } = await supabase.from('yorumlar').insert({
    ad_soyad: ad_soyad.trim(),
    sehir: sehir?.trim() || null,
    yorum: yorum.trim(),
    puan: puan || 5,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
