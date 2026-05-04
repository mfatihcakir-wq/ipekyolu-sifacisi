import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isAdminEmail } from '@/lib/admin'
import { CILT_SYSTEM_PROMPT } from '@/lib/mizan/cilt-prompt'

async function haftalikKontrol() {
  const cookieStore = await cookies()
  const userSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(list) { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) return { user: null, userSupabase, limitResp: NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 }) }

  if (isAdminEmail(user.email)) return { user, userSupabase, limitResp: null }

  const { data: profile } = await userSupabase
    .from('profiles')
    .select('last_cilt_at')
    .eq('id', user.id)
    .single()

  if (profile?.last_cilt_at) {
    const sonAnaliz = new Date(profile.last_cilt_at)
    const simdi = new Date()
    const fark = (simdi.getTime() - sonAnaliz.getTime()) / (1000 * 60 * 60 * 24)
    if (fark < 7) {
      const kalanGun = Math.ceil(7 - fark)
      return {
        user,
        userSupabase,
        limitResp: NextResponse.json({
          error: `Bu hafta cilt analizinizi kullandınız. ${kalanGun} gün sonra tekrar analiz yapabilirsiniz.`,
          kalan_gun: kalanGun
        }, { status: 429 })
      }
    }
  }
  return { user, userSupabase, limitResp: null }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SORUN_ODAK: Record<string, string> = {
  'akne_sivilce': 'kina + murrusafi + gul suyu (sogutucu+antiseptik)',
  'leke': 'sumak + nohut unu + gul suyu (aydinlatici+buzucu)',
  'kirisiklik_sarkma': 'servi + ayva + balmumu (buzucu+sikilastirici)',
  'kuruluk_catlak': 'bal + susam yagi + zeytinyagi (nemlendirici)',
  'goz_alti': 'gul suyu + menekse + papatya (sogutucu+buzucu)',
  'genis_gozenek': 'kina + sumak + nohut unu (buzucu+temizleyici)',
  'egzama_sedef': 'bal + zeytinyagi + hatmi (yatistirici+onarici)',
  'yaglanma_parlama': 'sumak + kina tonigi (kurutucu+dengeleyen)',
  'hassasiyet': 'gul suyu + papatya + bal (yatistirici)',
  'solgunluk': 'gul yagi + safran yagi + zeytinyagi (canlandirici)',
}

function kelimeKokleri(kelime: string): string[] {
  const kokler = [kelime]
  if (kelime.length > 5) kokler.push(kelime.slice(0, -2))
  if (kelime.length > 6) kokler.push(kelime.slice(0, -3))
  return kokler
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ciltKaynaklariGetir(formData: Record<string, any>, supabase: SupabaseClient<any, any, any>): Promise<string> {
  try {
    const fields = 'kaynak_kodu,kitap_adi,yazar,bolum,icerik_tr,oncelik'
    const tumSonuclar = new Map<string, Record<string, string>>()

    // 1. Arama terimlerini topla
    const aramaMetni = [
      formData.sorunlar || formData.ana_sorun || '',
      formData.notlar || formData.ek_aciklama || '',
      formData.tetikleyici || (formData.tetikleyiciler || []).join(' '),
      'cilt deri merhem yag'
    ].join(' ')

    // 2. Lab bazli terimler
    const labTerms: string[] = []
    if (formData.crp && parseFloat(formData.crp) > 5) labTerms.push('iltihap yangi')
    if (formData.vit_d && parseFloat(formData.vit_d) < 20) labTerms.push('vitamin d eksikligi cilt')
    if (formData.bilirubin && parseFloat(formData.bilirubin) > 1.2) labTerms.push('sarilik safra karaciger')
    if (formData.hemoglobin && parseFloat(formData.hemoglobin) < 12) labTerms.push('kansizlik solgunluk')

    const kelimeler = aramaMetni
      .split(/[\s,;.\n]+/)
      .filter(w => w.length > 3)
      .slice(0, 8)

    const tumKelimeler = Array.from(new Set(
      [...kelimeler.flatMap(w => kelimeKokleri(w.toLowerCase())), ...labTerms]
    )).slice(0, 12)

    // 3. Oncelikli kaynaklar (cilt odakli)
    const oncelikliKaynaklar = ['SRC-006', 'SRC-007', 'SRC-010', 'SRC-008', 'BYT']

    // 4. FTS sorgusu
    for (const kw of tumKelimeler.slice(0, 8)) {
      try {
        const { data } = await supabase
          .from('klasik_kaynaklar')
          .select(fields)
          .textSearch('icerik_tr', kw, { type: 'plain', config: 'simple' })
          .gte('oncelik', 5)
          .order('oncelik', { ascending: false })
          .limit(15)

        data?.forEach((r: Record<string, string>) => {
          const key = r.kaynak_kodu + r.bolum
          if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
        })
      } catch { /* devam */ }
    }

    // 5. ilike fallback
    for (const kw of tumKelimeler.slice(0, 6)) {
      try {
        const { data } = await supabase
          .from('klasik_kaynaklar')
          .select(fields)
          .ilike('icerik_tr', `%${kw}%`)
          .gte('oncelik', 5)
          .order('oncelik', { ascending: false })
          .limit(10)

        data?.forEach((r: Record<string, string>) => {
          const key = r.kaynak_kodu + r.bolum
          if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
        })
      } catch { /* devam */ }
    }

    // 6. Sabit oncelikli kaynaklar
    const { data: sabit } = await supabase
      .from('klasik_kaynaklar')
      .select(fields)
      .in('kaynak_kodu', oncelikliKaynaklar)
      .gte('oncelik', 6)
      .order('oncelik', { ascending: false })
      .limit(10)

    sabit?.forEach((r: Record<string, string>) => {
      const key = r.kaynak_kodu + r.bolum
      if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
    })

    // 7. Puanlama
    const skorla = (r: Record<string, string>) => {
      const icerik = (r.icerik_tr || '').toLowerCase()
      let skor = parseInt(r.oncelik) || 5
      tumKelimeler.forEach(w => { if (icerik.includes(w)) skor += 5 })
      if (oncelikliKaynaklar.includes(r.kaynak_kodu)) skor += 3
      return skor
    }

    // 8. Fallback
    if (tumSonuclar.size < 5) {
      const { data: fallback } = await supabase
        .from('klasik_kaynaklar')
        .select(fields)
        .gte('oncelik', 7)
        .order('oncelik', { ascending: false })
        .limit(10)
      fallback?.forEach((r: Record<string, string>) => {
        const key = r.kaynak_kodu + r.bolum
        if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
      })
    }

    // 9. Sirala ve baglam metni olustur
    const sirali = Array.from(tumSonuclar.values())
      .sort((a, b) => skorla(b) - skorla(a))
      .slice(0, 40)

    let baglamMetni = ''
    const tokenBudget = 8000

    for (const k of sirali) {
      const parca = `\n[${k.kaynak_kodu}] ${k.kitap_adi}; ${k.bolum}\n${(k.icerik_tr || '').slice(0, 400)}\n`
      if (baglamMetni.length + parca.length > tokenBudget) break
      baglamMetni += parca
    }

    return baglamMetni || 'Klasik kaynaklarda esleme bulunamadi.'

  } catch (e) {
    console.error('ciltKaynaklariGetir hatasi:', e)
    return ''
  }
}



export async function POST(request: NextRequest) {
  try {
    const { user, userSupabase, limitResp } = await haftalikKontrol()
    if (limitResp) return limitResp

    const {
      cilt_tipi, cilt_tonu, yas_grubu, cinsiyet, ana_sorun, sure,
      mevsim, tetikleyiciler, hamilelik, ek_aciklama,
      crp, bilirubin, vit_d, hemoglobin,
      email, hasta_adi, kayit_no,
    } = await request.json()

    if (!ana_sorun || !cilt_tipi) {
      return NextResponse.json({ error: 'Cilt tipi ve ana sorun zorunludur' }, { status: 400 })
    }

    // Ozel durumlar
    const ozelDurumlar: string[] = []
    const notlar = (ek_aciklama || '').toLowerCase()
    if (notlar.includes('sackiram') || notlar.includes('alopesi') || notlar.includes('alopecia')) ozelDurumlar.push('Sac dokulmesi/alopesi mevcut')
    if (notlar.includes('egzama') || notlar.includes('eczema')) ozelDurumlar.push('Egzama gecmisi')
    if (notlar.includes('sedef') || notlar.includes('psoriasis')) ozelDurumlar.push('Sedef hastaligi')
    if (notlar.includes('rozase') || notlar.includes('rosacea')) ozelDurumlar.push('Rozase')
    if (notlar.includes('mantar') || notlar.includes('fungal')) ozelDurumlar.push('Mantar enfeksiyonu suphesi')
    if (notlar.includes('akne') || notlar.includes('sivilce')) ozelDurumlar.push('Akne/sivilce yogunlugu')
    if (notlar.includes('gunes') || notlar.includes('uv')) ozelDurumlar.push('Gunes hasari')
    if (notlar.includes('hamile') || hamilelik === 'Hamile') ozelDurumlar.push('HAMILE; guclu bitkiler ve yuksek doz YASAK')
    if (notlar.includes('emzir') || hamilelik === 'Emziren') ozelDurumlar.push('Emziriyor; dikkatli formul sec')
    if (notlar.includes('seker') || notlar.includes('diyabet')) ozelDurumlar.push('Diyabet; yara iyilesmesi yavas, bal dikkatli')

    // Odaklar
    const sorunKey = (ana_sorun || '').toLowerCase()
    const odaklar: string[] = []
    for (const [key, val] of Object.entries(SORUN_ODAK)) {
      if (sorunKey.includes(key.split('_')[0])) {
        odaklar.push(`${key}: ${val}`)
      }
    }

    // Lab string
    const labParts: string[] = []
    if (crp) labParts.push(`CRP: ${crp} mg/L${parseFloat(crp) > 5 ? ' (YUKSEK; yangi)' : ''}`)
    if (bilirubin) labParts.push(`Bilirubin: ${bilirubin} mg/dL${parseFloat(bilirubin) > 1.2 ? ' (YUKSEK; sarilik riski)' : ''}`)
    if (vit_d) labParts.push(`Vit D: ${vit_d} ng/mL${parseFloat(vit_d) < 20 ? ' (DUSUK; cilt bariyeri zayif)' : ''}`)
    if (hemoglobin) labParts.push(`Hemoglobin: ${hemoglobin} g/dL${parseFloat(hemoglobin) < 12 ? ' (DUSUK; solgunluk)' : ''}`)
    const labStr = labParts.length > 0 ? labParts.join(' | ') : 'Lab degerleri girilmemis'

    // FTS baglam
    const formDataForFts = {
      ana_sorun, sorunlar: ana_sorun, notlar: ek_aciklama,
      tetikleyici: (tetikleyiciler || []).join(' '),
      crp, bilirubin, vit_d, hemoglobin,
    }
    const klasikBaglam = await ciltKaynaklariGetir(formDataForFts, sb)

    const userMessage = `CILT ANALIZI TALEP EDILIYOR:

HASTA BILGILERI:
Ad: ${hasta_adi || 'Belirtilmemis'}
Cinsiyet: ${cinsiyet || 'Belirtilmemis'}
Yas Grubu: ${yas_grubu || 'Belirtilmemis'}
Mevsim: ${mevsim || 'Belirtilmemis'}
Hamilelik/Emzirme: ${hamilelik || 'Yok'}

CILT PROFILI:
Cilt Tipi: ${cilt_tipi}
Cilt Tonu: ${cilt_tonu || 'Belirtilmemis'}
Ana Sorun: ${ana_sorun}
Sorun Suresi: ${sure || 'Belirtilmemis'}
Tetikleyici Faktorler: ${(tetikleyiciler || []).join(', ') || 'Belirtilmemis'}

${ozelDurumlar.length > 0 ? `OZEL DURUMLAR:\n${ozelDurumlar.map(d => `⚠ ${d}`).join('\n')}` : ''}

${odaklar.length > 0 ? `SORUN ODAK BILESENLERI:\n${odaklar.join('\n')}` : ''}

LAB DEGERLERI:
${labStr}

${ek_aciklama ? `EK ACIKLAMA: ${ek_aciklama}` : ''}

${klasikBaglam ? `---\nKLASIK KAYNAKLARDAN ILGILI METINLER:\n${klasikBaglam}\n---\nYukaridaki kaynak metinlerini analiz temelinde kullan. Kaynak belirtilemeyen bilgiyi verme.` : 'UYARI: Klasik kaynak bulunamadi. Genel cilt bakimi onerileri ver ama kaynak gosterme.'}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: [
        {
          type: 'text',
          text: CILT_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    // JSON temizleme
    const jsonStr = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*Here[^{]*/i, '')
      .replace(/^\s*[A-Za-z][^{]*/m, '')
      .trim()

    const jsonStart = jsonStr.indexOf('{')
    const jsonEnd = jsonStr.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
      console.error('JSON bulunamadi. Ham yanit:', text.substring(0, 400))
      return NextResponse.json({
        error: 'Analiz yapildi ancak yanit formatlanamadi. Tekrar deneyin.',
        sorun_ozeti: text.substring(0, 500),
      }, { status: 200 })
    }

    const cleanJson = jsonStr.substring(jsonStart, jsonEnd + 1)
    const cleanJson2 = cleanJson
      .replace(/([a-zA-Z\u0131\u011f\u00fc\u015f\u00f6\u00e7\u0130\u011e\u00dc\u015e\u00d6\u00c7\u0600-\u06FF])'([a-zA-Z\u0131\u011f\u00fc\u015f\u00f6\u00e7\u0130\u011e\u00dc\u015e\u00d6\u00c7\u0600-\u06FF])/g, '$1$2')
      .replace(/\\'/g, '')
      .replace(/[\u2018\u2019]/g, '')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any
    try {
      parsed = JSON.parse(cleanJson2)
    } catch (parseErr) {
      console.error('JSON parse hatasi:', parseErr)
      try {
        const ozet = cleanJson.match(/"sorun_ozeti"\s*:\s*"([^"]{10,})"/)?.[1] || 'Cilt analizi tamamlandi'
        const mizac = cleanJson.match(/"mizac_tipi"\s*:\s*"([^"]{3,})"/)?.[1] || 'Belirlenmedi'
        parsed = { sorun_ozeti: ozet, mizac_tipi: mizac, urunler: [], _parse_fallback: true }
      } catch {
        return NextResponse.json({ error: 'JSON parse basarisiz. Tekrar deneyin.' }, { status: 500 })
      }
    }

    // Supabase kayit (tablo yoksa sessizce devam et)
    try {
      await sb.from('cilt_forms').insert({
        kayit_no: kayit_no || null,
        hasta_adi: hasta_adi || null,
        email: email || null,
        cilt_tipi,
        ana_sorun,
        yas_grubu,
        cinsiyet,
        form_verisi: { cilt_tipi, cilt_tonu, yas_grubu, cinsiyet, ana_sorun, sure, mevsim, tetikleyiciler, hamilelik, ek_aciklama, crp, bilirubin, vit_d, hemoglobin },
        sonuc: parsed,
        created_at: new Date().toISOString(),
      })
    } catch (dbErr) {
      console.warn('cilt_forms tablosuna yazma hatasi (tablo olmayabilir):', dbErr)
    }

    if (user && !isAdminEmail(user.email)) {
      await userSupabase
        .from('profiles')
        .update({ last_cilt_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    return NextResponse.json({
      ...parsed,
      kayit_no,
      _kaynak_sayisi: klasikBaglam ? (klasikBaglam.match(/\[SRC-|BYT|BHR|AYN|AGZ/g) || []).length : 0
    })
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('JSON parse SyntaxError:', err.message)
      return NextResponse.json({
        error: 'Analiz yaniti formatlanamadi. Lutfen tekrar deneyin.',
      }, { status: 500 })
    }
    const errorMessage = err instanceof Error ? err.message : 'Cilt analizi sirasinda hata olustu'
    console.error('Cilt API error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
