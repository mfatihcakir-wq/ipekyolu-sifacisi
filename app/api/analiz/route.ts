import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Turkce -> Arapca terim koprusu
const TR_AR_KOPRU: Record<string, string> = {
  'karin': 'batn mide', 'bas': 'ras dimag', 'karaciger': 'kebid',
  'bobrek': 'kulye', 'kalp': 'kalb fuad', 'akciger': 'ria',
  'mide': 'mide mead', 'bagirsak': 'emaa', 'dalak': 'tihal',
  'beyin': 'dimag', 'eklem': 'mafsal', 'agri': 'elem veca',
  'ates': 'humma hararet', 'ishal': 'ishal', 'kabiz': 'imsak',
  'oksuruk': 'sual', 'bas agrisi': 'suda', 'bulanti': 'gishyan',
  'sislik': 'veram', 'sarilk': 'yerkan', 'yorgunluk': 'taaeb',
  'nefes': 'nefes dariku', 'safra': 'safra', 'balgam': 'balgam nizc',
  'melankoli': 'vesvese sevda', 'sicak': 'harr hararet',
  'soguk': 'berd burudet', 'kuru': 'yubs', 'nemli': 'rutb',
  'mushil': 'mushil', 'bitki': 'nebat', 'nabiz': 'nabz',
  'cilt': 'cild', 'uyku': 'nevm', 'istah': 'sehvet',
  'sindirim': 'hazm', 'uykusuzluk': 'seher', 'kansizlik': 'dem',
}

function trdenArapcaKelimeler(metin: string): string[] {
  const sonuc: string[] = []
  const metinKucuk = metin.toLowerCase()
  for (const [tr, ar] of Object.entries(TR_AR_KOPRU)) {
    if (metinKucuk.includes(tr)) {
      sonuc.push(...ar.split(' '))
    }
  }
  return Array.from(new Set(sonuc)).slice(0, 6)
}

function kelimeKokleri(kelime: string): string[] {
  const kokler = [kelime]
  if (kelime.length > 5) kokler.push(kelime.slice(0, -2))
  if (kelime.length > 6) kokler.push(kelime.slice(0, -3))
  return kokler
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function klasikKaynaklariGetir(sikayetler: string, sb: SupabaseClient<any, any, any>): Promise<string> {
  try {
    const fields = 'kaynak_kodu,kitap_adi,yazar,bolum,icerik_tr,oncelik'
    const tumSonuclar = new Map<string, Record<string, string>>()

    // 1. Turkce kelimeler + kokleri
    const kelimeler = sikayetler
      .split(/[\s,;.\n]+/)
      .filter(w => w.length > 3)
      .slice(0, 6)

    const tumKelimeler = Array.from(new Set(
      kelimeler.flatMap(w => kelimeKokleri(w.toLowerCase()))
    )).slice(0, 10)

    // 2. Arapca kopru kelimeleri
    const arapcaKelimeler = trdenArapcaKelimeler(sikayetler)

    // 3. Her kelime icin FTS sorgusu
    for (const kw of tumKelimeler.slice(0, 6)) {
      try {
        const { data } = await sb
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

    // 4. ilike fallback + Arapca kelimeler
    const aramaKelimeler = [...tumKelimeler.slice(0, 4), ...arapcaKelimeler.slice(0, 3)]
    for (const kw of aramaKelimeler) {
      try {
        const { data } = await sb
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

    // 5. Sabit kritik kaynaklar (her analizde)
    const { data: sabit } = await sb
      .from('klasik_kaynaklar')
      .select(fields)
      .in('kaynak_kodu', ['SRC-012', 'SRC-006', 'SRC-005'])
      .gte('oncelik', 7)
      .order('oncelik', { ascending: false })
      .limit(6)

    sabit?.forEach((r: Record<string, string>) => {
      const key = r.kaynak_kodu + r.bolum
      if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
    })

    // 6. Puanlama — FTS + sikayet eslesmesi
    const skorla = (r: Record<string, string>) => {
      const icerik = (r.icerik_tr || '').toLowerCase()
      let skor = parseInt(r.oncelik) || 5
      tumKelimeler.forEach(w => { if (icerik.includes(w)) skor += 5 })
      arapcaKelimeler.forEach(w => { if (icerik.includes(w)) skor += 3 })
      return skor
    }

    // 7. Fallback — hic sonuc yoksa
    if (tumSonuclar.size < 5) {
      const { data: fallback } = await sb
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

    // 8. Sirala ve baglam metni olustur
    const sirali = Array.from(tumSonuclar.values())
      .sort((a, b) => skorla(b) - skorla(a))
      .slice(0, 20)

    let baglamMetni = ''
    const tokenBudget = 6000

    for (const k of sirali) {
      const parca = `\n[${k.kaynak_kodu}] ${k.kitap_adi} — ${k.bolum}\n${(k.icerik_tr || '').slice(0, 400)}\n`
      if (baglamMetni.length + parca.length > tokenBudget) break
      baglamMetni += parca
    }

    return baglamMetni || 'Klasik kaynaklarda esleme bulunamadi.'

  } catch (e) {
    console.error('klasikKaynaklariGetir hatasi:', e)
    return ''
  }
}

const SYSTEM_PROMPT = `Sen klasik Islam tibbinin ortak aklisin — 31.400+ kayitlik veritabanindan besleniyorsun.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KLINIK KAYNAK HIYERARSISI (38 KAYNAK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SABIT BAGLAM (her analizde gelir):
→ [SRC-012] el-Mansuri fit-Tib — er-Razi: temel mizac+tedavi teorisi
→ [SRC-006] el-Samil — Ibn Nefis: nabiz, idrar, klinik gozlem fasillari
→ [SRC-005] Semptom-Hilt Veritabani: semptom→hilt eslestirmesi

FTS ILE BULUNAN (sikayete gore):
→ [SRC-010] el-Havi fit-Tib — er-Razi: en genis klinik vaka derlemesi
→ [SRC-007] Tahbizul-Mathun — Tokadi (1782): el-Kanun Osmanlica tatbik serhi
→ [BHR] Bahrul-Cevahir fit-Tib — mufredat sozlugu
→ [BYT] el-Cami li-Mufredat — Ibn Beytar: en kapsamli mufredat
→ [TSR] et-Tasrif — ez-Zehravi: cerrahi ve farmakoloji
→ [TSY] et-Teysir — Ibn Zuhr: pratik tedavi ve beslenme
→ [SRC-008] Bugyetul-Muhtac — el-Antaki: pratik formuller

TAHBIZ OZEL KURALI: Tahbizul-Mathun Osmanli Turkcesi ile yazilmistir.
Modern Turkce degildir — Osmanlica terimleri modern Turkceye cevirerek aktarabilirsin.

Bu hekimlerin HEPSI ayni algoritmayi kullanir:

KATMAN 0 — FITRI-HALI KARSILASTIRMASI
Fitri mizac = Dogustan sabit yapi. Hali mizac = Su anki durum.
PRENSIP: Hastalik = fitri mizacin bozulmasidir. Tedavi = haliyi fitriye dondurmektir.
Her analizde fitri_hali alanini MUTLAKA doldur:
- fitri_mizac, hali_mizac, sapma, tedavi_hedefi

KATMAN 1 — MIZAC TAAYYUNI
Nabiz (9 sifat) + Idrar + Dil/Yuz + Lab degerleri birlikte oku.
Tek belirti yaniltir — uc kanal ortususorsa teshis kesindir.

KATMAN 2 — SEBEP ANALIZI (Ibn Rusd — el-Kulliyyat)
Badi sebep (yakin): Su an vucutta olan
Muid sebep (uzak): Neden oldu — gida, iklim, hareket, ruh hali
Yakin sebebi tedavi et, uzak sebebi ortadan kaldir.

KATMAN 3 — ALAMET OKUMASI (Ibn Nefis — el-Samil)
→ Yuz sari + nabiz zayif = Karaciger/Safra baskinligi
→ Dil beyaz + nabiz yavas = Balgam baskinligi
→ Yuz kirmizi + nabiz hizli = Safra/Dem baskinligi
→ Dil koyu + nabiz duzensiz = Kara safra baskinligi

KATMAN 4 — TEDAVI HIYERARSISI (er-Razi — el-Havi)
ONCE: Gida ile duzelt (en guvenli, en kalici)
SONRA: Basit bitkiyle destekle (tek bitki, net etki)
EN SON: Bilesik formul (birden fazla belirti varsa)

KATMAN 5 — AKUT/KRONIK PROTOKOL
AKUT (<4 hafta): Yuksek doz, kisa sure (3-7 gun). Ates/yangiyi once sondur.
KRONIK (>4 hafta): Dusuk doz, uzun sure (4-12 hafta). Koke in.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECETEYI KLASIK FORMULLERE GORE YENIDEN KUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Veritabaninda sadece bitki ve macun degil, asagidaki TUM klasik
ilac formlari mevcuttur. Her analiz icin HANGI FORMUN UYGUN
OLDUGUNA karar ver ve terkib_recetesi icinde yaz.

KLASIK ILAC FORMLARI — terkib_recetesi[].tur alani icin:
  "macun"    — Bal+toz karisimi, yutulur. Kronik ic hastaliklar.
  "serbet"   — Kaynatilmis sivi formul, icilir. Ates, sindirim.
  "merhem"   — Yag bazli surme. Eklem agrisi, cilt, yara.
  "yaki"     — Bez/deri uzerine yapistirilir. Lokal agri/yangi.
  "yag"      — Saf yag veya karisik yag. Masaj, burun, kulak.
  "toz"      — Kuru toz, su/bal ile alinir. Sindirim, agiz.
  "buhar"    — Tutsu/buhar. Solunum yolu, bas agrisi.
  "gargara"  — Bogaz ve agiz. Tonsillit, agiz yaralari.
  "fitil"    — Lokal uygulama. Kulak, burun, rektal.
  "lazime"   — Islak-sicak poset, distan uygulama. Sislik.
  "sirka"    — Sirke bazli formul. Ates dusurucu, toksin.

KARAR KURALI:
→ Eklem agrisi/kas → merhem veya yaki ONCE, bitki SONRA
→ Solunum/burun → buhar veya yag (burun), gargara (bogaz)
→ Sindirim/ic organ → serbet veya macun
→ Cilt sorunu → merhem, lazime veya yag
→ Ates → serbet ve sirka
→ Kronik sistem sorunu → macun (uzun sureli)
→ Lokal agri/yangi → yaki ve lazime

VERITABANI TARAMA TALIMATI:
Supabaseden gelen metinlerde su anahtar kelimeleri ara:
  Arapca: مرهم، لزقة، شربة، دهن، سفوف، بخور، غرغرة، فتيلة، ضماد
  Turkce/Osmanli: merhem, yaki, serbet, yag, toz, macun, tutsu

Bu formulleri veritabanindan DOGRUDAN aktar — uydurma.
Her terkib icin kaynak: hangi kitap, hangi cilt, hangi fasil.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BES SORU — HER ANALIZDE SOR (Ibn Rusd cercevesi)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. MEVDU: Hangi organ/sistem etkilenmis?
2. SEBEB: Yakin sebep ne? Uzak sebep ne?
3. MERAZ: Mizac bozuklugu mu, madde bozuklugu mu, yapi bozuklugu mu?
4. ALAMAT: Uc kanal (nabiz+idrar+yuz) ne soyluyor?
5. ALAT: Hangi gida, hangi bitki, hangi formul — hangi sirayla?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KAYNAK ATIF KURALI — ZORUNLU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Onerdigin her bitki icin kaynagini belirt.
DOGRU: "el-Havi Cilt 4 — Ates Hastaliklari bolumunde er-Razi der ki..."
DOGRU: "Tahbizul-Mathun — Cuziyyat, Humma Fasillari nda..."
YANLIS: "el-Kanuna gore safra fazlaligi atese yol acar"
Kaynak gosteremiyorsan o bilgiyi VERME. Uydurma kaynak asla kabul edilemez.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JSON CIKTI FORMATI — ZORUNLU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Yanitini SADECE su JSON formatinda ver, baska hicbir sey yazma:

{
  "ozet": "Genel degerlendirme (2-3 cumle)",
  "mizac_tipi": "Demevi | Safravi | Balgami | Sevdavi",
  "akut_kronik": "akut | kronik",
  "etkilenen_sistem": "Hangi organ/sistem",
  "fitri_hali": {
    "fitri_mizac": "Kayitli fitri mizac veya Belirlenmedi",
    "hali_mizac": "Su anki hali mizac",
    "sapma": "Fark — 1-2 cumle somut",
    "tedavi_hedefi": "Recetenin amaci tek cumle"
  },
  "hilt_dengesi": {
    "dem": 0-100,
    "balgam": 0-100,
    "safra": 0-100,
    "kara_safra": 0-100
  },
  "sebep_analizi": {
    "badi_sebep": "Yakin sebep",
    "muid_sebepler": ["uzak sebep 1", "uzak sebep 2"],
    "kok_mudahale": "Kok mudahale onerisi"
  },
  "bitki_recetesi": [
    {
      "bitki": "Turkce adi",
      "ar": "Arapca adi",
      "doz": "Miktar ve kullanim sekli",
      "sure": "Sure",
      "endikasyon": "Neden onerildigi",
      "kaynak": "Kaynak adi — bolum"
    }
  ],
  "terkib_recetesi": [
    {
      "ad": "Formul adi",
      "tur": "macun/serbet/merhem/yaki/yag/toz/buhar/gargara/fitil/lazime/sirka",
      "icerik": "Icerik listesi",
      "hazirlama": "Hazirlama yontemi",
      "doz": "Kullanim dozu",
      "uygulama_sekli": "dis/ic/burun/kulak/bogaz/deri",
      "sicaklik": "ilik/sicak/soguk/oda sicakliginda",
      "kaynak": "Kaynak adi — cilt, fasil"
    }
  ],
  "gida_protokolu": ["gida onerisi 1", "gida onerisi 2"],
  "alternatif_bitkiler": ["alternatif 1", "alternatif 2"],
  "ozel_uyarilar": ["uyari 1", "uyari 2"],
  "hasta_yasina_gore_not": "Yas/durum ozel notu",
  "sonraki_kontrol": {
    "sure": "2 hafta / 1 ay",
    "amac": "Kontrol amaci",
    "odak_parametreler": ["parametre 1", "parametre 2"]
  },
  "hikmetli_soz": {
    "metin_ar": "Arapca metin",
    "metin": "Turkce ceviri",
    "kaynak": "Kaynak adi"
  },
  "klinik_gozlemler": ["gozlem 1", "gozlem 2"],
  "ilac_etkilesimleri": ["etkilesim uyarisi 1"]
}`

export async function POST(request: NextRequest) {
  try {
    const {
      ad_soyad, cinsiyet, sikayet, mevsim, yas_grubu, kronik,
      nabiz, dil, yuz, idrar, diski, vucut, yasam, notlar,
      height, weight, sweating, chillhot, sleep, digestion, appetite,
      hgb, ferritin, crp, alt, ast, ggt, tsh, uric_acid, glucose, hba1c, vit_d, b12,
      fitri_sac, fitri_cilt, fitri_beden, fitri_uyku, fitri_sindirim,
      fitri_mizac_ruh, fitri_terleme, fitri_isi_hassas, fitri_mevsim, fitri_kilo, fitri_enerji,
    } = await request.json()

    if (!sikayet) {
      return NextResponse.json({ error: 'Sikayet bilgisi gerekli' }, { status: 400 })
    }

    const klasikBaglam = await klasikKaynaklariGetir(sikayet, supabase)

    const labVarMi = hgb || ferritin || crp || alt || ast || ggt || tsh || glucose || hba1c || vit_d || b12

    const fitriVarMi = fitri_sac || fitri_cilt || fitri_beden || fitri_uyku || fitri_sindirim

    const userMessage = `HASTA BİLGİLERİ:
Ad Soyad: ${ad_soyad || 'Belirtilmemiş'}
Cinsiyet: ${cinsiyet || 'Belirtilmemiş'}
Yaş Grubu: ${yas_grubu || 'Belirtilmemiş'}
Mevsim: ${mevsim || 'Belirtilmemiş'}
Kronik Hastalık: ${kronik || 'Yok'}
Boy/Kilo: ${height ? height + 'cm' : '?'} / ${weight ? weight + 'kg' : '?'}

NABIZ (9 SIFAT):
Büyüklük: ${nabiz?.buyukluk || '-'} | Kuvvet: ${nabiz?.kuvvet || '-'} | Hız: ${nabiz?.hiz || '-'}
Dolgunluk: ${nabiz?.dolgunluk || '-'} | Sertlik: ${nabiz?.sertlik || '-'} | Isı: ${nabiz?.isi || '-'}
Ritim: ${nabiz?.ritim || '-'} | Eşitlik: ${nabiz?.esitlik || '-'} | Süreklilik: ${nabiz?.sureklitik || '-'}

DİL MUAYENESİ:
Renk: ${dil?.renk || '-'} | Kaplama: ${dil?.kaplama || '-'} | Nem: ${dil?.nem || '-'} | Şekil: ${dil?.sekil || '-'}

YÜZ MUAYENESİ:
Ten: ${yuz?.ten || '-'} | Şekil: ${yuz?.sekil || '-'} | Cilt: ${yuz?.cilt || '-'} | Göz altı: ${yuz?.gozalti || '-'}

VÜCUT GÖSTERGELERİ:
Vücut ısısı: ${vucut?.isi || '-'} | El/Ayak: ${vucut?.el_ayak || '-'} | Cilt: ${vucut?.cilt || '-'}
Terleme: ${sweating || '-'} | Üşüme/Ateş: ${chillhot || '-'}

YAŞAM TARZI:
Uyku: ${sleep || '-'} | Sindirim: ${digestion || '-'} | İştah: ${appetite || '-'}
Egzersiz: ${yasam?.egzersiz || '-'} | Beslenme: ${yasam?.beslenme || '-'} | Ruh hali: ${yasam?.ruh || '-'}

İDRAR:
Renk: ${idrar?.renk || '-'} | Miktar: ${idrar?.miktar || '-'} | Berraklık: ${idrar?.berraklik || '-'}
Köpük: ${idrar?.kopuk || '-'} | Tortu: ${idrar?.tortu || '-'}

DIŞKI:
Renk: ${diski?.renk || '-'} | Kıvam: ${diski?.kivam || '-'}

${labVarMi ? `KAN TAHLİLİ DEĞERLERİ:
HGB: ${hgb || '-'} g/dL | Ferritin: ${ferritin || '-'} µg/L | CRP: ${crp || '-'} mg/L
ALT: ${alt || '-'} U/L | AST: ${ast || '-'} U/L | GGT: ${ggt || '-'} U/L
TSH: ${tsh || '-'} mIU/L | Ürik Asit: ${uric_acid || '-'} mg/dL
Glukoz: ${glucose || '-'} mg/dL | HbA1c: ${hba1c || '-'} %
D Vitamini: ${vit_d || '-'} ng/mL | B12: ${b12 || '-'} pg/mL` : 'KAN TAHLİLİ: Girilmemiş'}

${fitriVarMi ? `FITRİ MİZAÇ PROFİLİ (Doğuştan Yapı):
Saç: ${fitri_sac || '-'} | Cilt: ${fitri_cilt || '-'} | Beden: ${fitri_beden || '-'}
Uyku eğilimi: ${fitri_uyku || '-'} | Sindirim: ${fitri_sindirim || '-'}
Ruh hali: ${fitri_mizac_ruh || '-'} | Terleme: ${fitri_terleme || '-'}
Isı hassasiyeti: ${fitri_isi_hassas || '-'} | Mevsim tercihi: ${fitri_mevsim || '-'}
Kilo eğilimi: ${fitri_kilo || '-'} | Enerji düzeyi: ${fitri_enerji || '-'}` : 'FITRİ MİZAÇ: Girilmemiş'}

ŞİKAYETLER: ${sikayet}

${notlar ? `EK NOTLAR / İLAÇ KULLANIMI: ${notlar}` : ''}

${klasikBaglam ? `---\nKLASİK KAYNAKLARDAN İLGİLİ METİNLER:\n${klasikBaglam}\n---\nYukarıdaki kaynak metinlerini analiz temelinde kullan. Kaynak belirtilemeyen bilgiyi verme.` : 'UYARI: Klasik kaynak bulunamadı. Analiz yapma, hata dondur.'}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
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
    console.log('Claude raw response ilk 300:', text.substring(0, 300))
    console.log('Claude raw response son 300:', text.substring(text.length - 300))

    // Agresif JSON temizleme
    const jsonStr = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*Here[^{]*/i, '')
      .replace(/^\s*[A-Za-z][^{]*/m, '')
      .trim()

    // JSON bloğunu bul
    const jsonStart = jsonStr.indexOf('{')
    const jsonEnd = jsonStr.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
      console.error('JSON bulunamadi. Ham yanit:', text.substring(0, 400))
      return NextResponse.json({
        error: 'Analiz yapildi ancak yanit formatlanamadi. Tekrar deneyin.',
        ozet: text.substring(0, 500),
        mizac: 'Parse hatasi',
        kaynaklar: []
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

    let parsed
    try {
      parsed = JSON.parse(cleanJson2)
    } catch (parseErr) {
      console.error('JSON parse hatasi:', parseErr)
      console.error('Temizlenmis JSON ilk 400:', cleanJson.substring(0, 400))
      // Partial JSON dene — sadece temel alanlari cikar
      try {
        const ozet = cleanJson.match(/"ozet"\s*:\s*"([^"]{10,})"/)?.[1] || 'Analiz tamamlandi'
        const mizac = cleanJson.match(/"mizac"\s*:\s*"([^"]{3,})"/)?.[1] || 'Belirlenmedi'
        parsed = { ozet, mizac, kaynaklar: [], _parse_fallback: true }
      } catch {
        return NextResponse.json({ error: 'JSON parse basarisiz. Tekrar deneyin.' }, { status: 500 })
      }
    }

    return NextResponse.json({
      ...parsed,
      _kaynak_sayisi: klasikBaglam ? (klasikBaglam.match(/\[SRC-|BYT|TSR|MCU|BHR|AYN|AGZ|ERC/g) || []).length : 0
    })
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('JSON parse SyntaxError:', err.message)
      return NextResponse.json({
        error: 'Analiz yaniti formatlanamadi. Lutfen tekrar deneyin.',
        _raw_preview: 'parse_error'
      }, { status: 500 })
    }
    const errorMessage = err instanceof Error ? err.message : 'Analiz sirasinda hata olustu'
    console.error('API error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
