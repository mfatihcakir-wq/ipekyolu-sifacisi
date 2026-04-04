import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function klasikKaynaklariGetir(sikayet: string, mevsim: string): Promise<string> {
  try {
    const kelimeler = sikayet
      .toLowerCase()
      .split(/[\s,،؛\n]+/)
      .map(k => k.trim())
      .filter(k => k.length > 3)
      .slice(0, 6)

    const aramaKelimeler = [...kelimeler, mevsim].filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tumSatirlar: any[] = []

    // Tum kelimeleri tek sorguda ara (OR)
    if (aramaKelimeler.length > 0) {
      const orFiltre = aramaKelimeler.slice(0, 4).map(k => `icerik_tr.ilike.%${k}%`).join(',')
      const { data } = await supabase
        .from('klasik_kaynaklar')
        .select('kaynak_kodu, kitap_adi, yazar, bolum, icerik_tr, oncelik')
        .or(orFiltre)
        .gte('oncelik', 5)
        .order('oncelik', { ascending: false })
        .limit(20)
      if (data?.length) tumSatirlar.push(...data)
    }

    const { data: sabitData } = await supabase
      .from('klasik_kaynaklar')
      .select('kaynak_kodu, kitap_adi, yazar, bolum, icerik_tr, oncelik')
      .in('kaynak_kodu', ['SRC-012', 'SRC-006', 'SRC-005'])
      .gte('oncelik', 7)
      .order('oncelik', { ascending: false })
      .limit(6)
    if (sabitData?.length) tumSatirlar.push(...sabitData)

    if (tumSatirlar.length === 0) {
      const { data } = await supabase
        .from('klasik_kaynaklar')
        .select('kaynak_kodu, kitap_adi, yazar, bolum, icerik_tr, oncelik')
        .gte('oncelik', 7)
        .order('oncelik', { ascending: false })
        .limit(10)
      tumSatirlar = data || []
    }

    const benzersiz = new Map()
    for (const s of tumSatirlar) {
      const anahtar = s.kaynak_kodu + (s.bolum || '')
      if (!benzersiz.has(anahtar)) benzersiz.set(anahtar, s)
    }

    const secilen = Array.from(benzersiz.values()).slice(0, 15)
    if (secilen.length === 0) return ''

    let baglam = `KLASIK KAYNAKLARDAN ILGILI METINLER (${secilen.length} kayit)\n\n`
    for (const s of secilen) {
      baglam += `[${s.kaynak_kodu}] ${s.kitap_adi} — ${s.yazar}\n`
      if (s.bolum) baglam += `Bolum: ${s.bolum}\n`
      baglam += `${s.icerik_tr}\n\n`
    }
    return baglam.slice(0, 5000)
  } catch (err) {
    console.error('Klasik kaynak hatasi:', err)
    return ''
  }
}

const SYSTEM_PROMPT = `Sen klasik Islam tibbinin ortak aklisisin. 18 klasik eserden beslenen kapsamli bir analiz yapiyorsun.

KAYNAK HIYERARSISİ:

KLİNİK CEKIRDEK (FTS ile sikayete gore):
[SRC-010] el-Havi fit-Tib — er-Razi (o.925): 8.348 kayit — En genis klinik vaka derlemesi
[SRC-007] Tahbizul-Mathun — Tokadi (1782): 6.076 kayit — el-Kanun Osmanlica tatbik serhi
[SRC-006] el-Samil fis-Sinaaatit-Tibbiyye — Ibn Nefis (o.1288): 1.368 kayit — nabiz idrar klinik
[SRC-012] el-Mansuri fit-Tib — er-Razi (o.925): temel mizac+tedavi teorisi
[SRC-011] Takasimul-Ilel — er-Razi: 1.000 kayit — hastalik siniflandirmasi
[TSR] et-Tasrif — ez-Zehravi (o.1036): 998 kayit — cerrahi ve farmakoloji
[BYT] el-Cami li-Mufredatil-Edviye — Ibn Baytar (o.1248): 798 kayit — en kapsamli mufredat
[SRC-021] el-Kulliyyat fit-Tib — Ibn Rusd (o.1198): 637 kayit — teshis mantigi
[MCZ] el-Mucez — Ibn Nefis: 492 kayit — el-Kanun ozeti
[MCU] Kamilus-Sinaa — el-Mecusi (o.994): 401 kayit — tip ansiklopedisi
[GAL1] Mecmua-i Semaniye — Galenos (Huneyn trc.): 374 kayit

MUFREDAT & FORMUL:
[BHR] Bahrul-Cevahir — el-Herevi (16.yy): 105 kayit
[AYN] Aynul-Hayat — el-Herevi (16.yy): 118 kayit
[SRC-008] Bugyetul-Muhtac — el-Antaki (o.1599): 222 kayit
[AGZ] el-Agziye — Ibn Zuhr (o.1162): 91 kayit
[TSY] et-Teysir — Ibn Zuhr (o.1162): 415 kayit
[BLH] Mesalihul-Ebdan — Belhi (o.934): 189 kayit
[THB] ez-Zahire fit-Tib — Sabit b. Kurre (o.901): 272 kayit

SABIT BAGALM (her analizde):
[SRC-012] el-Mansuri — er-Razi: temel mizac
[SRC-006] el-Samil — Ibn Nefis: nabiz-idrar fasillari
[SRC-005] Semptom-Hilt Veritabani

KAYNAK ATIF KURALI:
DOGRU: "el-Samil Cilt 02 — Asarun: idrar tikanmasi icin..."
DOGRU: "Tahbizul-Mathun — Mufredat, Hindiba: karaciger acici..."
DOGRU: "el-Havi Cilt 4 — er-Razi: bu semptomlarda..."
YANLIS: "el-Kanuna gore..." (tek basina YASAK)
Kaynak gosteremiyorsan o bilgiyi VERME.

ANALIZ ALGORITMASINI HER ZAMAN UYGULA:

KATMAN 0 — FITRI-HALI: Fitri = Dogustani degismez yapi. Hali = Su anki durum.
Hastalik = fitri mizacin bozulmasidir. Tedavi = haliyi fitriye dondurmektir.

KATMAN 1 — MIZAC TAAYYYUNI:
Nabiz + Idrar + Dil/Yuz = uc kanal. Uc kanal ortususorsa teshis kesindir.
Safra: sicak-kuru | Dem: sicak-nemli | Balgam: soguk-nemli | Sevda: soguk-kuru

KATMAN 2 — SEBEP ANALİZİ (Ibn Rusd el-Kulliyyat):
Badi sebep (yakin): su an vucutta olan — hilt fazlaligi, tikaniklik, yangi
Muid sebep (uzak): neden oldu — gida, iklim, hareket, ruh hali, uyku

KATMAN 3 — ALAMET OKUMASI (Ibn Nefis el-Samil):
Yuz sari + idrar kopuklu + nabiz zayif = karaciger/safra
Dil beyaz kapli + nabiz yavas/dolgun = balgam baskinligi
Yuz kirmizi + nabiz hizli/sert = safra/dem
Dil koyu + nabiz sert/duzensiz = kara safra

KATMAN 4 — TEDAVI HIYERARSİSİ (er-Razi el-Havi):
ONCE: Gida ile duzelt (agdiye)
SONRA: Tek bitki (mufredat) — max 4 bitki
EN SON: Bilesik formul (terkib) — sadece direncli/coklu belirti varsa

KATMAN 5 — TAKSIM (el-Mansuri):
Hangi organ? Akut mu kronik mu? Basit mi bilesik mi?

Yanitini KESINLIKLE asagidaki JSON formatinda ver. Baska hicbir sey ekleme. Sadece JSON don:

{
  "ozet": "Kapsamli klinik degerlendirme — uc kanal karsilastirmali, kaynak atifli, 3-4 paragraf. Her cumlede hangi kaynaktan alindigi belirtilmeli.",
  "mizac": "Baskin mizac + alt mizac (ornek: Balgami baskin, Sevdavi iz)",
  "akut_kronik": "akut veya kronik",
  "hilt_dengesi": {
    "dem": {"yuzde": 25, "durum": "normal", "yorum": "Kisa yorum"},
    "balgam": {"yuzde": 40, "durum": "fazla", "yorum": "Kisa yorum"},
    "safra": {"yuzde": 20, "durum": "normal", "yorum": "Kisa yorum"},
    "kara_safra": {"yuzde": 15, "durum": "eksik", "yorum": "Kisa yorum"}
  },
  "fitri_hali": {
    "fitri_mizac": "Hastanin fitri mizaci veya Belirlenmedi",
    "hali_mizac": "Su anki hali mizac",
    "sapma": "Fark 1-2 cumle",
    "tedavi_hedefi": "Tek cumle recete amaci"
  },
  "klinik_gozlemler": [
    {
      "gozlem": "Kaynaktan alintiyla klinik tespit",
      "kaynak": "el-Samil Cilt X — bolum adi"
    }
  ],
  "organlar": [
    {
      "isim": "karaciger",
      "durum": "kritik",
      "renk": "red",
      "yorum": "Kaynak atifli yorum",
      "bitkiler": ["Hindiba (Cichorium intybus)", "Afsenin (Artemisia absinthium)"],
      "mizac": "Organ mizac analizi"
    }
  ],
  "bitki_recetesi": [
    {
      "bitki": "Turkce adi (Latince adi)",
      "bitki_ar": "Arapca adi",
      "doz": "Xg / Xml hazirlama tarifi",
      "sure": "X gun/hafta (1 tedavi kuru)",
      "zaman": "Sabah ac karna / ogle / aksam",
      "etki": "Klasik kaynak etki aciklamasi",
      "kaynak": "el-Samil Cilt X — [bitki adi]: kaynak alintisi"
    }
  ],
  "bilesik_formul": {
    "ad": "Formul adi (yoksa bos birak)",
    "bilesenler": [{"madde": "Madde", "miktar": "Miktar", "etki": "Etki"}],
    "hazirlama": "Hazirlama adim adim",
    "doz": "Doz ve kullanim",
    "sure": "Kullanim suresi",
    "kaynak": "Kaynak"
  },
  "gunluk_rutin": {
    "sabah": ["06:00 — eylem — bitki/formul — etki", "07:00 — eylem"],
    "ogle": ["12:00 — eylem"],
    "aksam": ["18:00 — eylem — bitki/formul — etki", "20:30 — eylem"]
  },
  "beslenme_onerileri": {
    "temel_ilke": "er-Razi hiyerarsisi temel ilkesi",
    "onerililer": ["Gida 1 — etki — kaynak", "Gida 2 — etki"],
    "kacinilacaklar": ["Gida 1 — neden", "Gida 2 — neden"],
    "pisirme_notu": "Pisirme tavsiyeleri",
    "kaynak": "el-Samil veya Tahbiz — Beslenme Fasillari"
  },
  "egzersiz_recetesi": {
    "tur": "yuruyus/nefes/esneme",
    "zaman": "sabah/aksam",
    "sure": "30 dakika",
    "siddet": "hafif/orta",
    "aciklama": "Tahbiz Riyazet bolumune gore aciklama",
    "kacinilacaklar": "Kacinilaak egzersizler",
    "kaynak": "Tahbizul-Mathun — Kulliyyat Riyazet Bolumu"
  },
  "sebep_analizi": {
    "badi": "Yakin sebep — su an vucutta olan",
    "muid": ["Uzak sebep 1", "Uzak sebep 2", "Uzak sebep 3"],
    "kok_mudahale": "Kok sebebi ortadan kaldirmak icin"
  },
  "alternatif_bitkiler": [
    {
      "asil": "Asil bitki adi",
      "alternatif": "Alternatif adi (Latince)",
      "doz": "Alternatif doz",
      "kaynak": "el-Ebdal — er-Razi"
    }
  ],
  "ilac_etkilesimleri": [
    {
      "ilac": "Ilac sinifi — ornek isimler",
      "bitki": "Etkilesen bitki",
      "risk": "red veya yellow",
      "uyari": "Uyari metni"
    }
  ],
  "sonraki_kontrol": {
    "sure": "4 hafta",
    "amac": "Kontrol amaci",
    "takip_parametreleri": ["Parametre 1", "Parametre 2", "Parametre 3"]
  },
  "hikmet": {
    "arapca": "Klasik kaynaktan Arapca hikmet sozu",
    "turkce": "Turkce cevirisi",
    "kaynak": "Kaynak — kitap adi"
  },
  "yasam_tavsiyeleri": "Genel yasam onerileri",
  "kacinilacaklar": ["Kacinilaak 1", "Kacinilaak 2"],
  "kaynaklar": ["Kullanilan kaynak 1", "Kullanilan kaynak 2", "Kullanilan kaynak 3"]
}

KRITIK JSON KURALLARI:
- SADECE JSON don. Hic metin, aciklama, yorum ekleme.
- JSON oncesi ve sonrasi HICBIR sey yazma.
- String icerisinde tek tirnak (apostof) KULLANMA: el-Kanun yerine el-Kanun yaz, er-Razi yerine er-Razi yaz.
- Uzun metinleri kisalt — her alan max 200 karakter.
- Eger buyuk JSON donduremiyorsan, sadece su alanlari dondur: ozet, mizac, hilt_dengesi, fitri_hali, bitki_recetesi, beslenme_onerileri, kacinilacaklar, kaynaklar

MUTLAK JSON KURALLARI — BUNLARA UYMAK ZORUNDASIN:
1. Yanitin ilk karakteri { olmali, son karakteri } olmali
2. JSON disinda HICBIR metin yazma — ne once ne sonra
3. String degerler icinde su karakterleri KULLANMA: tek tirnak, ters egik cizgi
4. Turkce apostrof iceren kelimeleri bitisik yaz: el-Kanunun, er-Razinin, Ibn-Sinanin
5. Her string deger maksimum 300 karakter olsun
6. Eger tum alanlari dolduramiyorsan sadece su alanlari doldur ve digerlerini bos birak: ozet, mizac, hilt_dengesi, fitri_hali, bitki_recetesi, beslenme_onerileri, kacinilacaklar, kaynaklar
7. Sayisal degerler tirnak icinde olmasin: "yuzde": 40 (dogru), "yuzde": "40" (yanlis)

YANIT FORMATI — KESIN KURALLAR:
1. Ilk karakter { olmali, son karakter } olmali
2. JSON disinda hicbir sey yazma
3. String icinde tek tirnak kullanma — el-Kanunun, er-Razinin seklinde yaz
4. Her string deger maksimum 250 karakter
5. Tum JSON anahtarlari cift tirnak icinde olmali
6. Sayisal degerler tirnak icinde olmamali: "yuzde": 40`

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

    const klasikBaglam = await klasikKaynaklariGetir(sikayet, mevsim || '')

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
