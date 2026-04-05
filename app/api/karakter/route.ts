import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Sistem promptunu dosyadan oku (build time cache)
let SYSTEM_PROMPT = ''
try {
  SYSTEM_PROMPT = readFileSync(join(process.cwd(), 'karakter_sistem_promptu.md'), 'utf-8')
} catch {
  SYSTEM_PROMPT = 'Karakter analizi sistem promptu yuklenemedi. Genel analiz yap.'
}

function kelimeKokleri(kelime: string): string[] {
  const kokler = [kelime]
  if (kelime.length > 5) kokler.push(kelime.slice(0, -2))
  if (kelime.length > 6) kokler.push(kelime.slice(0, -3))
  return kokler
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function karakterKaynaklariGetir(aktifAskerler: string[], fizikselMizac: string, sb: SupabaseClient<any, any, any>): Promise<string> {
  try {
    const fields = 'kaynak_kodu,kitap_adi,yazar,bolum,icerik_tr,oncelik'
    const tumSonuclar = new Map<string, Record<string, string>>()

    // 1. Aktif askerlerden arama terimleri
    const aramaKelimeler = Array.from(new Set(
      aktifAskerler.flatMap(a => kelimeKokleri(a.toLowerCase()))
    )).slice(0, 12)

    // 2. Mizac terimleri
    const mizacTerimler = fizikselMizac
      ? fizikselMizac.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3)
      : []

    const tumKelimeler = [...aramaKelimeler, ...mizacTerimler].slice(0, 15)

    // 3. FTS sorgusu — karakter_kaynaklar tablosu
    for (const kw of tumKelimeler.slice(0, 8)) {
      try {
        const { data } = await sb
          .from('karakter_kaynaklar')
          .select(fields)
          .textSearch('icerik_tr', kw, { type: 'plain', config: 'simple' })
          .order('oncelik', { ascending: false })
          .limit(10)

        data?.forEach((r: Record<string, string>) => {
          const key = r.kaynak_kodu + (r.bolum || '')
          if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
        })
      } catch { /* devam */ }
    }

    // 4. ilike fallback
    for (const kw of tumKelimeler.slice(0, 6)) {
      try {
        const { data } = await sb
          .from('karakter_kaynaklar')
          .select(fields)
          .ilike('icerik_tr', `%${kw}%`)
          .order('oncelik', { ascending: false })
          .limit(8)

        data?.forEach((r: Record<string, string>) => {
          const key = r.kaynak_kodu + (r.bolum || '')
          if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
        })
      } catch { /* devam */ }
    }

    // 5. Sabit kaynaklar (her analizde)
    const { data: sabit } = await sb
      .from('karakter_kaynaklar')
      .select(fields)
      .in('kaynak_kodu', ['AHL-HAM', 'IHY-MHL-1', 'IHY-MNC-1'])
      .order('oncelik', { ascending: false })
      .limit(6)

    sabit?.forEach((r: Record<string, string>) => {
      const key = r.kaynak_kodu + (r.bolum || '')
      if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
    })

    // 6. Fallback
    if (tumSonuclar.size < 5) {
      const { data: fallback } = await sb
        .from('karakter_kaynaklar')
        .select(fields)
        .order('oncelik', { ascending: false })
        .limit(10)
      fallback?.forEach((r: Record<string, string>) => {
        const key = r.kaynak_kodu + (r.bolum || '')
        if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
      })
    }

    // 7. Puanlama + sirala
    const skorla = (r: Record<string, string>) => {
      const icerik = (r.icerik_tr || '').toLowerCase()
      let skor = parseInt(r.oncelik) || 5
      tumKelimeler.forEach(w => { if (icerik.includes(w)) skor += 5 })
      return skor
    }

    const sirali = Array.from(tumSonuclar.values())
      .sort((a, b) => skorla(b) - skorla(a))
      .slice(0, 25)

    let baglamMetni = ''
    const tokenBudget = 6000

    for (const k of sirali) {
      const parca = `\n[${k.kaynak_kodu}] ${k.kitap_adi} — ${k.bolum}\n${(k.icerik_tr || '').slice(0, 400)}\n`
      if (baglamMetni.length + parca.length > tokenBudget) break
      baglamMetni += parca
    }

    return baglamMetni || 'Karakter kaynaklarinda esleme bulunamadi.'
  } catch (e) {
    console.error('karakterKaynaklariGetir hatasi:', e)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const { form_cevaplari, fiziksel_mizac, aktif_askerler } = await request.json()

    if (!form_cevaplari && !aktif_askerler) {
      return NextResponse.json({ error: 'Form cevaplari veya aktif askerler gerekli' }, { status: 400 })
    }

    // Kriz taramasi — basit keyword kontrolu
    const tumMetin = JSON.stringify(form_cevaplari || {}).toLowerCase()
    const krizKelimeleri = ['intihar', 'kendime zarar', 'hayattan anlam', 'olmeyi istiyorum', 'yasama amacim yok']
    const krizVar = krizKelimeleri.some(k => tumMetin.includes(k))

    if (krizVar) {
      return NextResponse.json({
        kriz_tespit: true,
        kriz_mesaji: 'Paylastiginiz bilgiler bir uzmana danismanizi gerektiriyor. Lutfen bir psikolog, psikiyatrist veya guvendiginiz birine ulasin. Bu analiz su an sizin icin uygun degil.',
        yasal_not: 'Bu rapor klasik Islam dusuncesi cercevesinde hazirlanmis bir oz-degerlendirme aracidir. Tibbi veya psikolojik tedavinin yerini tutmaz.'
      })
    }

    // FTS ile karakter kaynaklarini getir
    const askerListesi = aktif_askerler || []
    const klasikBaglam = await karakterKaynaklariGetir(askerListesi, fiziksel_mizac || '', supabase)

    const userMessage = `KARAKTER ANALIZI TALEP EDILIYOR:

FIZIKSEL MIZAC: ${fiziksel_mizac || 'Belirlenmedi'}
AKTIF ASKERLER: ${askerListesi.join(', ') || 'Belirtilmemis'}

FORM CEVAPLARI:
${JSON.stringify(form_cevaplari || {}, null, 2)}

${klasikBaglam ? `---\nKLASIK KAYNAKLARDAN ILGILI METINLER:\n${klasikBaglam}\n---\nYukaridaki kaynak metinlerini analiz temelinde kullan. Kaynak belirtilemeyen bilgiyi verme.` : 'UYARI: Klasik kaynak bulunamadi.'}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('Karakter analiz raw ilk 300:', text.substring(0, 300))

    // JSON temizleme
    const jsonStr = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*Here[^{]*/i, '')
      .trim()

    const jsonStart = jsonStr.indexOf('{')
    const jsonEnd = jsonStr.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
      console.error('JSON bulunamadi:', text.substring(0, 400))
      return NextResponse.json({
        error: 'Analiz yapildi ancak yanit formatlanamadi. Tekrar deneyin.',
        ozet: { sade: text.substring(0, 500), akademik: '' },
      }, { status: 200 })
    }

    const cleanJson = jsonStr.substring(jsonStart, jsonEnd + 1)
      .replace(/([a-zA-Z\u0131\u011f\u00fc\u015f\u00f6\u00e7\u0130\u011e\u00dc\u015e\u00d6\u00c7\u0600-\u06FF])'([a-zA-Z\u0131\u011f\u00fc\u015f\u00f6\u00e7\u0130\u011e\u00dc\u015e\u00d6\u00c7\u0600-\u06FF])/g, '$1$2')
      .replace(/\\'/g, '')
      .replace(/[\u2018\u2019]/g, '')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')

    let parsed
    try {
      parsed = JSON.parse(cleanJson)
    } catch (parseErr) {
      console.error('JSON parse hatasi:', parseErr)
      try {
        const ozet = cleanJson.match(/"sade"\s*:\s*"([^"]{10,})"/)?.[1] || 'Analiz tamamlandi'
        parsed = { ozet: { sade: ozet, akademik: '' }, kriz_tespit: false, _parse_fallback: true }
      } catch {
        return NextResponse.json({ error: 'JSON parse basarisiz. Tekrar deneyin.' }, { status: 500 })
      }
    }

    return NextResponse.json({
      ...parsed,
      _kaynak_sayisi: klasikBaglam ? (klasikBaglam.match(/\[AHL-|IHY-/g) || []).length : 0
    })
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('JSON parse SyntaxError:', err.message)
      return NextResponse.json({ error: 'Analiz yaniti formatlanamadi.' }, { status: 500 })
    }
    const errorMessage = err instanceof Error ? err.message : 'Karakter analizi sirasinda hata olustu'
    console.error('Karakter API error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
