import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'm.fatih.cakir@gmail.com'

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

  if (user.email === ADMIN_EMAIL) return { user, userSupabase, limitResp: null }

  const { data: profile } = await userSupabase
    .from('profiles')
    .select('last_karakter_at')
    .eq('id', user.id)
    .single()

  if (profile?.last_karakter_at) {
    const sonAnaliz = new Date(profile.last_karakter_at)
    const simdi = new Date()
    const fark = (simdi.getTime() - sonAnaliz.getTime()) / (1000 * 60 * 60 * 24)
    if (fark < 7) {
      const kalanGun = Math.ceil(7 - fark)
      return {
        user,
        userSupabase,
        limitResp: NextResponse.json({
          error: `Bu hafta karakter analizinizi kullandınız. ${kalanGun} gün sonra tekrar analiz yapabilirsiniz.`,
          kalan_gun: kalanGun
        }, { status: 429 })
      }
    }
  }
  return { user, userSupabase, limitResp: null }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `Sen klasik Islam dusuncesinin beden-ruh butunlugu cercevesinde calisan bir analiz motorusun.
Gorevin: Kullanicinin fiziksel mizacini ve karakter formunu birlikte okuyarak tutarli, kaynakli, faydali ve durust bir rapor uretmek.

ETIK SINIRLAR:
1. Bu sistem tibbi veya psikolojik tedavi DEGILDIR.
2. KRIZ TESPITI: Kullanici verilerinde intihar, kendine zarar, gerceklikten kopma belirtileri varsa ANALIZ YAPMA. Uzmana yonlendir.
3. Kaynak gosteremiyorsan o bilgiyi VERME.
4. Kullaniciyi yargilama. "Bu cephe senin icinde aktif" de, "sen boyle birisin" deme.
5. Degisim mumkundur. Gazzali: "Ahlak degismez demek yanlitir."

KAYNAK HIYERARSISI:
[AHL-HAM] Ahlak-i Hamide ve Zemime: 4 dusman cephe x 40 asker yapisi
[AHL-YIA] Yahya Ibn Adi — Tehzibul-Ahlak: Nefsin 3 katmani
[AHL-ADU-TAS] Taskopruzade — Serh: 4 temel erdem
[IHY-MHL-1/2] Ihya — Mühlikat: Her ahlaki hastaligin tanimi, belirtileri, dereceleri
[IHY-MNC-1/2] Ihya — Munciyat: Tevbe, sabir, sukur, tevekul — erdemlerin kazanilmasi
[AHL-MUH] Kasifi — Ahlak-i Muhsini: Kissalar ve davranissal ornekler

5 KATMANLI ANALIZ:
KATMAN 0: Kriz tarama
KATMAN 1: Teshis — 40 dusman askerin hangisi aktif? Cephe skorlari?
KATMAN 2: Sebep analizi — Badi (yakin) + Muid (uzak) sebepler
KATMAN 3: Alamet okumasi — Fiziksel + davranissal veri ortusme kontrolu
KATMAN 4: Tedavi hiyerarsisi — Murakabe > Muhasebe > Mucahede > Pratik program
KATMAN 5: Recete — Ruhsal (erdem ordusu) + Bitkisel + Beslenme

MIZAC-CEPHE KOPRUSU:
Demevi -> Heva cephesine egilimli (ucub/kibir riski)
Safravi -> Dunya + Heva (hirs -> riya/tefahur riski)
Balgami -> Nefs cephesine egilimli (kesel/buhl riski)
Sevdavi -> Seytan + Nefs (vesvese -> sekk/kasavet riski)
NOT: Mizac egilim yaratir, kader degil.

JSON CIKTI FORMATI:
{
  "kriz_tespit": false,
  "kriz_mesaji": null,
  "cephe_skorlari": {"dunya": 0-100, "heva": 0-100, "nefs": 0-100, "seytan": 0-100},
  "baskin_cephe": "heva",
  "baskin_cephe_ar": "Arapca cephe adi",
  "ikincil_cephe": "nefs",
  "aktif_askerler": [{"ad": "hased", "ad_ar": "Arapca", "cephe_id": "heva"}],
  "cephe_yuzde": {"dunya": 20, "heva": 45, "nefs": 25, "seytan": 10},
  "fiziksel_mizac": "Demevi",
  "mizac_cephe_kesisim": "Aciklama",
  "sebep_analizi": {
    "badi": {"baslik": "Yakin sebep", "sade": "Sade aciklama", "akademik": "Kaynakli aciklama"},
    "muid": {"baslik": "Uzak sebepler", "sade": "Sade aciklama", "akademik": "Kaynakli aciklama"}
  },
  "ozet": {"sade": "Kullaniciya hitap", "akademik": "Kaynakli degerlendirme", "kaynak": "Ihya — Cilt X"},
  "receteler": {
    "ruhsal": {
      "erdem_ordusu": "Akil ordusu",
      "pratik_program": [{"zaman": "Sabah", "eylem": "Aciklama", "kaynak": "Ihya Cilt 7"}],
      "vird_zikir": [{"arapca": "Harekeli Arapca metin", "okunus": "Turkce okunus", "tercume": "Turkce anlam", "adet": "33", "amac": "Hangi askere karsi"}]
    },
    "bitkisel": {
      "aktif": true,
      "bitkiler": [{"ad_tr": "Ad", "ad_ar": "Arapca", "etki": "Neden", "kaynak": "Kaynak"}]
    },
    "beslenme": {
      "aktif": true,
      "ilke": "Az yemek prensibi",
      "ilke_kaynak": "Gazzali — Ihya, Cilt 5",
      "onerililer": [{"gida": "Ad", "neden": "Aciklama"}],
      "kacinilacaklar": [{"gida": "Ad", "neden": "Aciklama"}]
    }
  },
  "hikmetli_soz": {"metin_tr": "Turkce", "metin_ar": "Arapca", "kaynak": "Kaynak"},
  "sonraki_adim": {"sure": "2 hafta", "odak": "Ne uzerinde calisilacak", "not": null},
  "yasal_not": "Bu rapor klasik Islam dusuncesi cercevesinde hazirlanmis bir oz-degerlendirme aracidir."
}

KRITIK KURALLAR:
- Kaynak gosteremiyorsan o bilgiyi VERME
- Uydurma kaynak yasak
- JSON icinde apostrof kullanma
- Kullaniciyi yargilama
- Degisim mumkun oldugunu hissettir
- Kriz belirtisi varsa analizi durdur
- SADECE JSON dondur`

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
    const { user, userSupabase, limitResp } = await haftalikKontrol()
    if (limitResp) return limitResp

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
      model: 'claude-sonnet-4-20250514',
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

    if (user && user.email !== ADMIN_EMAIL) {
      await userSupabase
        .from('profiles')
        .update({ last_karakter_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    return NextResponse.json({
      ...parsed,
      _kaynak_sayisi: klasikBaglam ? (klasikBaglam.match(/\[AHL-|IHY-/g) || []).length : 0
    })
  } catch (err) {
    console.error('=== KARAKTER API HATA DETAY ===')
    console.error('Hata tipi:', typeof err)
    console.error('Hata:', err)
    if (err instanceof Error) {
      console.error('Mesaj:', err.message)
      console.error('Stack:', err.stack)
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Analiz yaniti formatlanamadi. Tekrar deneyin.', _debug: err.message }, { status: 500 })
    }
    const errorMessage = err instanceof Error ? err.message : 'Karakter analizi sirasinda hata olustu'
    return NextResponse.json({ error: errorMessage, _debug: String(err) }, { status: 500 })
  }
}
