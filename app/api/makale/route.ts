import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getClients() {
  return {
    anthropic: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }),
    sb: createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
}

function slugOlustur(baslik: string): string {
  return baslik
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/-$/, '')
}

export async function POST(req: NextRequest) {
  try {
    const { sb, anthropic } = getClients()
    const body = await req.json()
    const { konu, kategori, kaynak_kodlar } = body

    if (!konu || !kategori) {
      return NextResponse.json({ error: 'Konu ve kategori zorunludur' }, { status: 400 })
    }

    // Kaynaklari getir
    const fields = 'kaynak_kodu,kitap_adi,yazar,bolum,icerik_tr,oncelik'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tumSonuclar = new Map<string, Record<string, any>>()

    if (kaynak_kodlar && kaynak_kodlar.length > 0) {
      const { data } = await sb
        .from('klasik_kaynaklar')
        .select(fields)
        .in('kaynak_kodu', kaynak_kodlar)
        .order('oncelik', { ascending: false })
        .limit(20)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.forEach((r: Record<string, any>) => {
        const key = r.kaynak_kodu + r.bolum
        if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
      })
    } else {
      const kelimeler = konu
        .split(/[\s,;.\n]+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 6)

      for (const kw of kelimeler) {
        try {
          const { data } = await sb
            .from('klasik_kaynaklar')
            .select(fields)
            .ilike('icerik_tr', `%${kw}%`)
            .order('oncelik', { ascending: false })
            .limit(10)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data?.forEach((r: Record<string, any>) => {
            const key = r.kaynak_kodu + r.bolum
            if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
          })
        } catch { /* devam */ }
      }
    }

    const kaynaklar = Array.from(tumSonuclar.values()).slice(0, 20)
    const kaynakMetni = kaynaklar
      .map(k => `[${k.kaynak_kodu}] ${k.kitap_adi} - ${k.yazar}\nBolum: ${k.bolum}\n${k.icerik_tr}`)
      .join('\n\n---\n\n')

    const kaynakListesi = Array.from(new Set(kaynaklar.map(k => `${k.kitap_adi} (${k.yazar})`)))

    // Claude ile makale uret
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `Sen klasik Islam tibbi (Tibb-i Nebevi, Unani tip) konusunda uzman bir yazarsin.

Asagidaki kaynaklari kullanarak "${konu}" konusunda, "${kategori}" kategorisinde Turkce bir makale yaz.

KAYNAKLAR:
${kaynakMetni}

CIKTI FORMATI (JSON):
{
  "baslik": "Turkce makale basligi",
  "baslik_ar": "Arapca makale basligi (varsa)",
  "ozet": "2-3 cumlelik makale ozeti",
  "icerik": "Tam makale metni. Markdown formatinda. En az 800 kelime. Kaynaklara atifta bulun."
}

KURALLAR:
- Sadece JSON formatinda cevap ver, baska bir sey yazma
- Icerik bilimsel ve kaynak bazli olsun
- Turkce karakterleri dogru kullan
- Arapca terimlerin transliterasyonunu parantez icinde ver
- Modern tibbi bilgilerle karsilastirma yap`
        }
      ]
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Claude yanit vermedi' }, { status: 500 })
    }

    let makaleData
    try {
      const jsonStr = textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      makaleData = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: 'Claude yaniti parse edilemedi', raw: textBlock.text }, { status: 500 })
    }

    const slug = slugOlustur(makaleData.baslik)

    const { data: makale, error: insertErr } = await sb
      .from('makaleler')
      .insert({
        baslik: makaleData.baslik,
        baslik_ar: makaleData.baslik_ar || '',
        slug,
        ozet: makaleData.ozet,
        icerik: makaleData.icerik,
        kategori,
        kaynaklar: kaynakListesi,
        kaynak_kodlar: kaynaklar.map(k => k.kaynak_kodu),
        yayinda: false,
      })
      .select()
      .single()

    if (insertErr) {
      return NextResponse.json({ error: 'Makale kaydedilemedi', detail: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ makale, preview: makaleData })
  } catch (err) {
    const detay = err instanceof Error ? err.message : JSON.stringify(err)
    console.error('Makale uretim hatasi detay:', detay, err)
    return NextResponse.json(
      { error: detay },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { sb } = getClients()
    const body = await req.json()
    const { id, yayinda } = body

    if (!id || typeof yayinda !== 'boolean') {
      return NextResponse.json({ error: 'id ve yayinda alanlari zorunludur' }, { status: 400 })
    }

    const { data, error } = await sb
      .from('makaleler')
      .update({ yayinda })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Guncelleme basarisiz', detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ makale: data })
  } catch (err) {
    console.error('Makale guncelleme hatasi:', err)
    return NextResponse.json(
      { error: 'Makale guncellenirken hata olustu' },
      { status: 500 }
    )
  }
}
