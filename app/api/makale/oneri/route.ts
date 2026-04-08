import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const { data: chunks } = await sb
      .from('klasik_kaynaklar')
      .select('icerik_tr, kaynak_kodu, eser_adi, hekim_adi')
      .gte('oncelik', 6)
      .limit(40)
      .order('oncelik', { ascending: false })

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ oneriler: [] })
    }

    const ornekMetin = chunks
      .slice(0, 20)
      .map(c => `[${c.hekim_adi} — ${c.eser_adi}]\n${c.icerik_tr?.substring(0, 200)}`)
      .join('\n\n---\n\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Aşağıdaki klasik İslam tıbbı metinlerini incele.
Bu metinlerdeki gerçek içeriklerden yola çıkarak,
modern okuyucunun ilgisini çekecek 10 makale konusu öner.

Konular:
- Kesinlikle sadece bu metinlerde geçen bilgilere dayalı olmalı
- Popüler sağlık ve tıp tarihi okuyucusuna hitap etmeli
- Başlık merak uyandırıcı ama akademik ciddiyette olmalı
- İnternetten veya genel bilgiden değil, YALNIZCA bu metinlerden

METİNLER:
${ornekMetin}

SADECE JSON döndür:
{
  "oneriler": [
    {
      "konu": "makale başlığı",
      "kategori": "kategoriden biri: TEMEL KAVRAMLAR|NABIZ İLMİ|BESİN İLMİ|CERRAHİ|DEVÂ İLMİ|RUHSAL SAĞLIK|MEVSİM TEDAVİSİ|BİTKİ REHBERİ|HASTALIK TEŞHİSİ",
      "kaynak_kodu": "SRC-XXX",
      "aciklama": "bu konuyu bu kaynaktan neden yazabiliriz, 1 cümle"
    }
  ]
}`
      }]
    })

    const raw = response.content.filter(b => b.type === 'text').map(b => (b as { type: 'text'; text: string }).text).join('')
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ oneriler: [] })

    const parsed = JSON.parse(match[0])
    return NextResponse.json(parsed)
  } catch (err) {
    const detay = err instanceof Error ? err.message : JSON.stringify(err)
    console.error('Oneri uretim hatasi:', detay)
    return NextResponse.json({ error: detay, oneriler: [] }, { status: 500 })
  }
}
