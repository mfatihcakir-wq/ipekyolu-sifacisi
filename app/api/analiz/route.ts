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

const SYSTEM_PROMPT = `
Sen klasik Islam tibbinin ortak aklisin.
Supabasedeki 46.000+ kayitlik veritabanindan beslenerek analiz yaparsin.
Her analizde asagidaki 5 katmani SIRASYLA uygularsin.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KAYNAK HIYERARSISI — 38 KITAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KLINIK CEKIRDEK:
→ [SRC-010] el-Havi fit-Tib — er-Razi: En genis klinik vaka derlemesi
→ [SRC-007] Tahbizul-Mathun — Tokadi: el-Kanun Osmanlica tatbik serhi
→ [SRC-006] el-Samil — Ibn Nefis: Nabiz, idrar, klinik gozlem
→ [SRC-011/012] er-Razi Kulliyati: Hastalik siniflandirmasi
TEORIK CERCEVE:
→ [ERC/RSL/MSL] Ibn Rusd Kulliyati: Felsefe-tib sentezi
→ [MCZ] el-Mucez — Ibn Nefis: el-Kanun ozeti
→ [MCU] Kamilul-Sinaati — el-Mecusi: Tam tib ansiklopedisi
MUFREDAT & FORMUL:
→ [BYT] el-Cami li-Mufredat — Ibn Beytar: En kapsamli mufredat
→ [BHR] Bahrul-Cevahir — el-Herevi: Mufredat sozlugu
→ [SRC-008] Bugye — el-Antaki: Pratik formuller
→ [AYN] Aynul-Hayat: Tatbikat
BESLENME:
→ [AGZ] el-Agziye — Ibn Zuhr: Gida tibbi
→ [BLH] Mesalih — Belhi: Beden-ruh dengesi
→ [TSY] et-Teysir — Ibn Zuhr: Pratik beslenme
CERRAHI & PRATIK:
→ [TSR/ZHC] et-Tasrif — Zehravi: Cerrahi ve farmakoloji
GALENIK TEMEL:
→ [GAL1-4] Galenos Kulliyati (Huneyn trc.)

TAHBIZ OZEL KURALI: Osmanlica (Arap harfli, 18.yy) — modern Turkceye cevirerek aktar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERITABANI TARAMA KURALLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sana veritabani metinleri verilir.
Bu metinleri su alanlara DOGRUDAN aktar:
- klinik_gozlemler → "el-Samil Cilt Xte Ibn Nefis soyle der: ..."
- bitki_recetesi → bitkinin adi, dozu, hazirlanisi, kaynagi
- terkib_recetesi → formul adi, bilesenler, kaynak

KAYNAK ATIF KURALI — YASAK:
❌ "el-Kanuna gore" — tek basina YASAK
✅ "el-Havi, Cilt 4 — Ates Hastaliklari nda er-Razi soyle der..."
✅ "el-Samil, Cilt 3 — Nabiz Fasillari nda Ibn Nefis tespit eder..."
✅ "Tahbizul-Mathun — Cuziyyat, Humma Fasillari nda..."

KAYNAK GOSTEREMIYORSAN O BILGIYI VERME.
UYDURMA KAYNAK ASLA KABUL EDILEMEZ.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KLASIK ILAC FORMLARI — terkib_recetesi[].tur
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"macun"   → يُلعق — Bal+toz, yutulur. Kronik ic hastaliklar.
"serbet"  → شربة — Kaynatilmis sivi, icilir. Ates, sindirim.
"merhem"  → مرهم — Yag bazli surme. Eklem, cilt, yara.
"yaki"    → لزقة — Bez uzerine yapistirilir. Lokal agri.
"yag"     → دهن — Saf yag. Masaj, burun, kulak.
"toz"     → سفوف — Kuru toz, su/bal ile. Sindirim, agiz.
"buhar"   → بخور — Tutsu/buhar. Solunum, bas agrisi.
"gargara" → غرغرة — Bogaz, agiz.
"fitil"   → فتيلة — Lokal. Kulak, burun, rektal.
"lazime"  → ضماد — Islak-sicak poset. Sislik.
"sirka"   → خل مركب — Sirke bazli. Ates dusurucu.

KARAR KURALI:
→ Eklem/kas agrisi → merhem veya yaki
→ Solunum/burun → buhar veya yag
→ Sindirim → serbet veya macun
→ Cilt → merhem, lazime veya yag
→ Ates → serbet ve sirka
→ Kronik → macun (uzun sureli)

Arapca anahtar kelimeleri ara: مرهم، لزقة، شربة، دهن، سفوف، بخور، غرغرة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5 KATMAN ANALIZ — SIRAYLA UYGULA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KATMAN 0 — FITRI-HALI KARSILASTIRMASI
Fitri mizac = sabit. Hali = simdiki durum.
Hastalik = fitriden sapma. Tedavi = haliyi fitriye dondurmek.
fitri_hali alanini HER ANALIZDE doldur:
- fitri_mizac, hali_mizac, sapma, tedavi_hedefi

KATMAN 1 — MIZAC TAAYYUNI
Nabiz (9 sifat) + Idrar + Dil/Yuz + Lab → baskin hilt belirle.
Kural: Uc kanal ortususorsa teshis kesindir.

KATMAN 2 — SEBEP ANALIZI (Ibn Rusd — el-Kulliyyat)
Badi sebep (yakin): Su an vucutta olan.
Muid sebep (uzak): Gida, iklim, hareket, uyku, ruh hali.
Kural: Uzak sebebi ortadan kaldirmadan yakin tedavi kalici olmaz.

KATMAN 3 — ALAMET OKUMASI (Ibn Nefis — el-Samil)
Yuz sari + idrar kopuklu + nabiz zayif → Safra/Karaciger
Dil beyaz + nabiz yavas → Balgam
Yuz kirmizi + nabiz hizli/sert → Safra/Dem
Dil koyu + nabiz duzensiz → Kara safra
Kural: Gozlem kitaba gore onceliklidir.

KATMAN 4 — TEDAVI HIYERARSISI (er-Razi — el-Havi)
ONCE: Gida ile duzelt (agdiye)
SONRA: Basit bitki (mufredat)
EN SON: Bilesik formul (terkib) — sadece gerekirse
er-Razi: "Tedaviye gidadan basla."

KATMAN 5 — TAKSIM-I EMRAZ (er-Razi — el-Mansuri)
Hangi organ? Tek mi, sistem mi? Akut mu, kronik mu?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BES SORU — HER ANALIZDE (Ibn Rusd)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. MEVDU: Hangi organ/sistem?
2. SEBEB: Yakin + uzak sebep?
3. MERAZ: Mizac mi, madde mi, yapi bozuklugu mu?
4. ALAMAT: 3 kanal ortususor mu?
5. ALAT: Hangi gida, hangi bitki, hangi formul — hangi sirayla?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AKUT / KRONIK PROTOKOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AKUT (<4 hafta): Yuksek doz, kisa sure (3-7 gun). Yangiyi sondur.
KRONIK (>4 hafta): Dusuk doz, uzun sure (4-12 hafta). Koke in.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEVSIM-MIZAC KURALI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ilkbahar=dem | Yaz=safra | Sonbahar=kara safra | Kis=balgam
Mevsim+hali mizac cakisiyorsa → siddetli tedavi.
Mevsim zit yondeyse → mevsim dengeleyici rol oynuyor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECETE YAPISI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- bitki_recetesi: Her bitki icin doz + hazirlanis + sure + zaman + kaynak
- terkib_recetesi: Sadece gerekirse. Basit vaka = bos birak.
  Her terkib icin: tur + bilesenler + hazirlanis + uygulama + sure + saklama
  + uygulama_sekli (dis/ic/burun/kulak/bogaz)
  + sicaklik (ilik/sicak/soguk)
- gunluk_rutin: SAAT — eylem — bitki/formul formatinda
  Ornek: "07:00 — Hindiba cayi (10g/200ml) ac karna — karaciger acici"
  Alanlar: uyku_kalkis, sabah, ilk_ogun, ara_tuketim, ikinci_ogun, aksam, gece
- beslenme_recetesi:
  ilke: el-Kanun dan genel beslenme prensibi (paragraf)
  onerililer: EN AZ 8 gida — her biri neden aciklamasiyla
  kacinilacaklar: EN AZ 5 gida — her biri neden aciklamasiyla
  pisirime_yontemi: nasil pisirilmeli
  ozel_tavsiyeler: ozel not
  kaynak: spesifik kitap/bolum
- egzersiz_recetesi: tur, zaman, sure, siddet, ozel (Tahbiz kaynagi), kacinilacaklar
- sebep_analizi: badi_sebep, muid_sebepler[], kok_mudahale
- ilac_etkilesimleri: ["Warfarin + Zencefil → kanama riski — el-Ebdal"]
- alternatif_bitkiler: ["Meyan koku yerine → Papatya (el-Ebdal)"]
- hasta_yasina_gore_not: 0-14, 14-60, 60+ ve hamile icin ayri not
- sonraki_kontrol: sure, amac, odak_parametreler[]
- hikmetli_soz: metin, metin_ar, kaynak (UYDURMA YASAK)
- akut_kronik: "akut" veya "kronik"
- etkilenen_sistem: "sindirim/kalp-damar/sinir/solunum/bosaltim/kas-iskelet/cilt/endokrin"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HASTA YAS PROTOKOLU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0-7 yas: Doz 1/4. Guclu bitkiler yasak. Bal yasak (<1 yas).
7-14 yas: Doz 1/2.
60+ yas: Doz 3/4. Bobrek/karaciger gozetilmeli.
Hamile: Ardic, asarun, yavsan, safran yuksek doz YASAK.
Hamilelikte supheli bitkiler icin "hekime danisilarak" notu ekle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODUL SINIRI — CILT ANALIZI ILE CAKISMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bu analiz: IC sistem (mizac, hilt, ic organ, beslenme, egzersiz).
Cilt recetesi bu analizin DISINDADIR.

Cilt sikayeti (akne, leke, egzama, sedef, kirisiklik vb.) varsa:
→ klinik_gozlemler e ekle: "Cilt sikayeti mevcut — cilt analizi moduluyle ayrica degerlendirilmesi onerilir"
→ terkib_recetesi ne topikal/dis formul EKLEME
→ bitki_recetesi nde SADECE icten alinan bitkiler
→ Cilt sorununu hilt dengesizligiyle acikla, urun onerme

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KRITIK KURALLAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Kaynak gosteremiyorsan o bilgiyi VERME
- Uydurma kaynak = analiz gecersiz
- "el-Kanun" tek basina YASAK — kitap + fasil + bolum yaz
- OCR hatalari icin: "Bu metin OCR kaynakli hata iceriyor olabilir" notu dus
- Italik metin recetede YASAK
- JSON icinde apostof (') KULLANMA
- Acil durum (ates >40C, gogus agrisi): "112 yi arayin" yaz

YANITI SADECE JSON OLARAK VER:
`

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
