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
      const parca = `\n[${k.kaynak_kodu}] ${k.kitap_adi} — ${k.bolum}\n${(k.icerik_tr || '').slice(0, 400)}\n`
      if (baglamMetni.length + parca.length > tokenBudget) break
      baglamMetni += parca
    }

    return baglamMetni || 'Klasik kaynaklarda esleme bulunamadi.'

  } catch (e) {
    console.error('ciltKaynaklariGetir hatasi:', e)
    return ''
  }
}

const CILT_SYSTEM_PROMPT = `
Sen klasik Islam tibbinin cilt ve guzellik uzmanisin.
Supabasedeki 46.000+ kayitlik veritabanindan beslenerek cilt analizi yaparsin.
Hastanin cilt tipini, sorunlarini, tetikleyici faktorlerini ve lab degerlerini degerlendirip
klasik kaynaklara dayali dogal cilt bakim protokolu olusturursun.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KAYNAK HIYERARSISI — CILT ODAKLI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KLINIK CEKIRDEK:
→ [SRC-010] el-Havi fit-Tib — er-Razi: Cilt hastaliklari vaka derlemesi
→ [SRC-007] Tahbizul-Mathun — Tokadi: Cilt tedavi tatbikleri
→ [SRC-006] el-Samil — Ibn Nefis: Cilt gozlem ve teshis
→ [SRC-008] Bugye — el-Antaki: Pratik cilt formuleri
MUFREDAT & FORMUL:
→ [BYT] el-Cami li-Mufredat — Ibn Beytar: Cilt icin bitkisel mufredat
→ [BHR] Bahrul-Cevahir — el-Herevi: Yaglar, merhemler
→ [AYN] Aynul-Hayat: Cilt tatbikatlari
BESLENME & DESTEK:
→ [AGZ] el-Agziye — Ibn Zuhr: Cildi etkileyen gidalar
→ [BLH] Mesalih — Belhi: Beden-ruh-cilt dengesi

KAYNAK ATIF KURALI — YASAK:
❌ "el-Kanuna gore" — tek basina YASAK
✅ "el-Havi, Cilt 4 — Cilt Hastaliklari nda er-Razi soyle der..."
✅ "el-Samil, Cilt 3 — Cilt Fasillari nda Ibn Nefis tespit eder..."
KAYNAK GOSTEREMIYORSAN O BILGIYI VERME.
UYDURMA KAYNAK ASLA KABUL EDILEMEZ.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CILT MIZAC HARITASI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kuru cilt → Sevdavi (kara safra) veya Safravi (safra fazlasi)
Yagli cilt → Demevi (kan fazlasi)
Karma cilt → Balgami-Demevi gecis
Hassas cilt → Safravi veya sicak-kuru dengesizlik
Normal cilt → Mutedil mizac

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEDAVI FORMLARI — CILT ODAKLI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"merhem"  → Yag bazli surme. Cilt tedavisi.
"maske"   → Toz+sivi karisim. Yuz bakimi.
"tonik"   → Sivi, pamukla/spreyle uygulama.
"yag"     → Saf yag. Masaj, serum.
"kompres" → Islak bez. Sogutucu/yatistirici.
"losyon"  → Hafif sivi karisim. Gunluk bakim.
"buhar"   → Yuz buhari. Gozenek acma.
"lazime"  → Islak-sicak poset. Sislik, iltihap.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CILT ANALIZ KATMANLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KATMAN 1 — CILT MIZAC TAYINI
Cilt tipi + tonu + sorunlar → baskin hilt belirle.
Kuru+solgun → sevdavi | Yagli+akne → demevi | Hassas+kizariklik → safravi

KATMAN 2 — SEBEP ANALIZI
Dis sebepler: gunes, soguk, kimyasal, stres
Ic sebepler: mizac bozuklugu, organ disfonksiyonu, hormonal
Lab destegi: CRP yuksek → yangi, VitD dusuk → bariyer zayifligi

KATMAN 3 — URUN SECIMI
SORUN_ODAK haritasina gore oncelikli bilesenleri sec.
Her urun icin: isim, tur, bilesenler, hazirlanis, uygulama talimati, sure

KATMAN 4 — GUNLUK RUTIN
Sabah ve aksam rutini olustur.
Temizlik → tonik → serum/yag → koruma sirasi

KATMAN 5 — BESLENME DESTEGI
Cildi iyilestiren gidalar, kacinilacaklar, su tuketimi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OZEL DURUMLAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hamile: Kina, safran yuksek doz, retinol YASAK. "Hekime danisilarak" notu ekle.
Egzama/Sedef: Yatistirici oncelikli. Kasintiyi azalt, sonra onar.
Rozase: Sogutucu oncelikli. Sicak uygulama YASAK.
Akne: Antiseptik + kurutucu. Yagli urunlerden kacin.
Mantar: Antifungal bitkiler (kekik, cayi agi). Nem dengesine dikkat.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEVSIM-CILT KURALI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ilkbahar: Cilt canlanir, temizlik oncelikli
Yaz: Gunes koruma, sogutucu, hafif urunler
Sonbahar: Nemlendirme artir, onarim baslat
Kis: Yogun nemlendirme, bariyer guclendir

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YAS PROTOKOLU — CILT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18-25: Hafif urunler, temizlik odakli
26-35: Koruyucu bakim, antioksidan
36-45: Onarici + nemlendirici yogunlastir
46-55: Kirisiklik onleme, sikilastirma
56+: Yogun nemlendirme, hassas formul

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KRITIK KURALLAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Kaynak gosteremiyorsan o bilgiyi VERME
- Uydurma kaynak = analiz gecersiz
- JSON icinde apostrof (') KULLANMA
- Acil durum (ciddi alerjik reaksiyon, yaygin enfeksiyon): "Hekime basvurun" yaz

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODUL SINIRI — GENEL ANALIZ ILE CAKISMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bu analiz: TOPIKAL (dis) cilt protokolu.
Ic sistem tedavisi bu analizin DISINDADIR.

→ Ic organ tedavisi, sistemik bitki recetesi YAZMA
→ Egzersiz, uyku duzeni, mizac analizi YAZMA
→ Hilt baglantisi: sadece teshis.hilt_baglantisi na yaz
→ Icten alinan bitki gerekiyorsa: beslenme_onerileri ne "Dahili protokol icin genel analiz modulune basvurun" ekle
→ gunluk_rutin: sadece cilt bakim adimlari
→ beslenme_onerileri: kisa, sadece cilt odakli

YANITI SADECE JSON OLARAK VER — asagidaki yapiyi kullan:
{
  "sorun_ozeti": "Hastanin cilt durumunun kisa ozeti",
  "hilt_baglantisi": "Mizac-cilt iliskisi aciklamasi",
  "hikmetli_soz": {
    "metin": "Turkce hikmetli soz",
    "metin_ar": "Arapca asil metin",
    "kaynak": "Kitap ve bolum"
  },
  "urunler": [
    {
      "isim": "Urun adi",
      "tur": "merhem/maske/tonik/yag/kompres/losyon",
      "bilesenler": ["bilesen1", "bilesen2"],
      "hazirlanis": "Hazirlama talimati",
      "uygulama": "Uygulama talimati",
      "sure": "Kullanim suresi",
      "kaynak": "Klasik kaynak referansi"
    }
  ],
  "gunluk_rutin": {
    "sabah": ["adim1", "adim2"],
    "aksam": ["adim1", "adim2"],
    "haftalik": ["ozel bakim1"]
  },
  "beslenme": {
    "ilke": "Genel beslenme prensibi",
    "onerililer": [{"gida": "adi", "neden": "aciklama"}],
    "kacinilacaklar": [{"gida": "adi", "neden": "aciklama"}],
    "su_tavsiyesi": "Gunluk su miktari",
    "kaynak": "Kitap referansi"
  },
  "ozel_notlar": ["not1", "not2"],
  "sonraki_kontrol": {
    "sure": "4 hafta",
    "amac": "Kontrol amaci",
    "odak_parametreler": ["param1"]
  },
  "akut_kronik": "akut veya kronik",
  "mizac_tipi": "demevi/safravi/sevdavi/balgami"
}
`

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
    if (notlar.includes('hamile') || hamilelik === 'Hamile') ozelDurumlar.push('HAMILE — guclu bitkiler ve yuksek doz YASAK')
    if (notlar.includes('emzir') || hamilelik === 'Emziren') ozelDurumlar.push('Emziriyor — dikkatli formul sec')
    if (notlar.includes('seker') || notlar.includes('diyabet')) ozelDurumlar.push('Diyabet — yara iyilesmesi yavas, bal dikkatli')

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
    if (crp) labParts.push(`CRP: ${crp} mg/L${parseFloat(crp) > 5 ? ' (YUKSEK — yangi)' : ''}`)
    if (bilirubin) labParts.push(`Bilirubin: ${bilirubin} mg/dL${parseFloat(bilirubin) > 1.2 ? ' (YUKSEK — sarilik riski)' : ''}`)
    if (vit_d) labParts.push(`Vit D: ${vit_d} ng/mL${parseFloat(vit_d) < 20 ? ' (DUSUK — cilt bariyeri zayif)' : ''}`)
    if (hemoglobin) labParts.push(`Hemoglobin: ${hemoglobin} g/dL${parseFloat(hemoglobin) < 12 ? ' (DUSUK — solgunluk)' : ''}`)
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

    if (user && user.email !== ADMIN_EMAIL) {
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
