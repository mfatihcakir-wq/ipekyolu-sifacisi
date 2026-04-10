import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const maxDuration = 300
export const runtime = 'nodejs'

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
    )).slice(0, 6)

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
          .limit(8)

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
          .limit(6)

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
        .limit(6)
      fallback?.forEach((r: Record<string, string>) => {
        const key = r.kaynak_kodu + r.bolum
        if (!tumSonuclar.has(key)) tumSonuclar.set(key, r)
      })
    }

    // 8. Sirala ve baglam metni olustur
    const sirali = Array.from(tumSonuclar.values())
      .sort((a, b) => skorla(b) - skorla(a))
      .slice(0, 8)

    let baglamMetni = ''
    const tokenBudget = 2000

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

const SYSTEM_PROMPT = `Sen klasik İslam tıbbının ortak aklısın — 31.400+ kayıtlık veritabanından besleniyorsun.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KLİNİK FAYDAYA GÖRE KAYNAK HİYERARŞİSİ (33 KİTAP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KLİNİK ÇEKİRDEK (31.369 chunk, 38 kaynak — FTS her analizde en alakalı metinleri bulur):
  SABIT BAĞLAM (her analizde gelir):
  → [SRC-012] el-Mansûrî fi't-Tıb — er-Râzî: temel mizaç+tedavi teorisi
  → [SRC-006] el-Şâmil — İbn Nefîs: nabız, idrar, klinik gözlem fasılları
  → [SRC-005] Semptom-Hılt Veritabanı: semptom→hılt eşleştirmesi

  FTS İLE BULUNAN (şikayete göre):
  → [SRC-010] el-Hâvî fi't-Tıb — er-Râzî: 10.150 chunk
  → [SRC-007] Tahbîzü'l-Mathûn — Tokadî (1782): 6.076 chunk

⚠️ TAHBİZ ÖZEL KURALI: Tahbîzü'l-Mathûn Osmanlı Türkçesi ile yazılmıştır. Modern Türkçeye çevirerek aktar.

KATMAN 0 — FITRİ-HÂLİ KARŞILAŞTIRMASI
  Fıtrî mizaç = Doğuştan sabit yapı. Hâlî mizaç = Şu anki durum.
  PRENSİP: Hastalık = fıtrî mizacın bozulmasıdır. Tedavi = hâlîyi fıtrîye döndürmektir.

AKUT / KRONİK PROTOKOL — ZORUNLU
AKUT (<4 hafta): Hızlı müdahale. Yüksek doz, kısa süre (3-7 gün).
KRONİK (>4 hafta): Yavaş iyileştirme. Düşük doz, uzun süre (4-12 hafta).

KATMAN 1 — MİZAC TAAYYÜNİ
  Araçlar: Nabız (9 sıfat) + İdrar + Dil/Yüz + Lab değerleri
  Çıktı: Baskın hılt (dem/balgam/safrâ/kara safra) + Mizaç tipi

KATMAN 2 — SEBEP ANALİZİ (İbn Rüşd — el-Külliyyât yöntemi)
  Bâdî sebep (yakın): Şu an vücutta olan
  Mûid sebep (uzak): Neden oldu — gıda, iklim, hareket, ruh hali

KATMAN 3 — ALÂMET OKUMASI (İbn Nefîs — el-Şâmil yöntemi)
  → Yüz sarı + idrar köpüklü + nabız zayıf = Safra hılt baskınlığı
  → Dil beyaz kaplı + nabız yavaş + terleyememe = Balgam baskınlığı
  → Yüz kırmızı + nabız hızlı/sert + ağız kuruluğu = Safrâ/Dem baskınlığı
  → Dil koyu + nabız sert/düzensiz + korku = Kara safra baskınlığı

KATMAN 4 — TEDAVİ HİYERARŞİSİ (er-Râzî — el-Hâvî yöntemi)
  1. AĞDIYE (Gıda): Önce beslenmeyi düzelt.
  2. MÜFREDÂT (Tek bitki): Sonra basit bitkiyle destekle.
  3. TERKİB (Bileşik formül): En son, sadece gerekirse.

VERİTABANI KULLANIMI — KAYNAK ATIF ZORUNLUDUR
⚠️ KRİTİK: Önerdiğin her bitki veya tedavi için kaynağını belirt.
  Format: "el-Hâvî Cilt X'te er-Râzî şöyle der..."
  Kaynak gösteremiyorsan o bilgiyi VERME.
  ✅ Doğru: "Tahbîzü'l-Mathûn — Cüz'iyyât, Humma Fasılları'nda..."
  ❌ Yanlış: "el-Kânûn'a göre safra fazlalığı ateşe yol açar"

KAYNAK ATIF KURALI: "el-Kânûn" tek başına YASAK — hangi kitap, hangi fasıl belirt.

REDAKSİYON KURALLARI:
- Bitki adlarını Türkçe + parantez içinde Latince yaz: "Hindibâ (Cichorium intybus)"
- Türkçe karakter kullan: ğ, ş, ı, ö, ü, ç
- Arapça terimler parantez içinde: "sarı safra (safrâ)"

EGZERSİZ KURALI — ZORUNLU:
egzersiz_recetesi MUTLAKA doldur.
Format: {"tur":"yürüyüş/nefes/esneme","zaman":"sabah/akşam","sure":"20 dakika","siddet":"hafif/orta","ozel":"Tahbîzü'l-Mathûn Riyazet bölümüne göre açıklama","kacinilacaklar":"ağır egzersiz","kaynak":"Tahbîzü'l-Mathûn — Külliyât, Riyazet Bölümü"}

BESLENME KURALI:
- EN AZ 8 önerilen gıda, EN AZ 5 kaçınılacak gıda.
- AZ YEMEK temeldir. En fazla 2 ana öğün.

HASTA YAŞ PROTOKOLÜ:
- 0-7 yaş: Doz 1/4. Güçlü bitkiler yasak.
- 7-14 yaş: Doz 1/2.
- 60+ yaş: Doz 3/4. Hafif bitkiler.
- Hamile: Düşük ettirici bitkiler YASAK (safran yüksek doz, ardıç, yavşan, asarûn).

FITRİ-HÂLİ ZORUNLU ALAN — BOŞ BIRAKMA:
fitri_hali.fitri_mizac, fitri_hali.hali_mizac, fitri_hali.sapma, fitri_hali.tedavi_hedefi

ZORUNLU JSON ÇIKTISI (başka format kabul edilmez):
{"fitri_hali":{"fitri_mizac":"","hali_mizac":"","sapma":"","tedavi_hedefi":""},"mizac":{"tip":"","tip_ar":"","tam_tanim":"","ana_element":"","alt_mizac":"","mevsim_etkisi":"","uyum_skoru":0,"sure":"","kaynak":""},"hiltlar":{"dem":{"oran":25,"durum":"normal","aciklama":""},"balgam":{"oran":25,"durum":"normal","aciklama":""},"sari_safra":{"oran":25,"durum":"normal","aciklama":""},"kara_safra":{"oran":25,"durum":"normal","aciklama":""}},"baskin_hilt":"","klinik_gozlemler":[],"bitki_recetesi":[{"bitki":"","ar":"","doz":"","hazirlanis":"","endikasyon":"","kaynak":"","kontrendikasyon":""}],"terkib_recetesi":[],"gunluk_rutin":{"sabah":[],"oglen":[],"aksam":[]},"beslenme_recetesi":{"ilke":"","onerililer":[],"kacinilacaklar":[],"pisirime_yontemi":"","ozel_tavsiyeler":"","kaynak":""},"egzersiz_recetesi":{"tur":"","zaman":"","sure":"","siddet":"","ozel":"","kacinilacaklar":"","kaynak":""},"kontrol_takvimi":[],"uyarilar":[],"hikmetli_soz":{"metin":"","metin_ar":"","kaynak":""},"ozet":"","ilac_etkilesimleri":[],"alternatif_bitkiler":[],"hasta_yasina_gore_not":"","sonraki_kontrol":{"sure":"4 hafta","amac":"","odak_parametreler":[]},"sebep_analizi":{"badi_sebep":"","muid_sebepler":[],"kok_mudahale":""},"akut_kronik":"akut","etkilenen_sistem":""}
`

export async function POST(request: NextRequest) {
  try {
    const {
      ad_soyad, cinsiyet, sikayet, mevsim, yas_grubu, kronik, sikayet_suresi,
      nabiz, dil, yuz, idrar, diski, vucut, yasam, notlar,
      height, weight, sweating, chillhot, sleep, digestion, appetite,
      exercise_habit, mood_detail, diet_type,
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

[MEVSİM-MİZAÇ KORELASYON]
İLKBAHAR → Dem hıltı artar → Kan açma/tasfiye mevsimi
YAZ → Sarı safra artar → Soğutucu/nemlendirici
SONBAHAR → Kara safra artar → Isıtıcı/neşelendirici
KIŞ → Balgam artar → Kurutucu/ısıtıcı
Hastanın mevsimi: ${mevsim || 'belirtilmemiş'}

[TAKSİM — AKUT/KRONİK]
Şikayet süresi: ${sikayet_suresi || 'belirtilmemiş'}
${sikayet_suresi?.includes('akut') ? 'AKUT HASTALIK — Hızlı müdahale, yüksek doz kısa süre' : sikayet_suresi?.includes('kronik') ? 'KRONİK HASTALIK — Yavaş iyileştirme, kök sebebe in' : 'Süre belirtilmemiş — verilere göre değerlendir'}

[3 KANAL UYUM]
KANAL 1 NABIZ: Büyüklük=${nabiz?.buyukluk || '-'} | Kuvvet=${nabiz?.kuvvet || '-'} | Hız=${nabiz?.hiz || '-'}
KANAL 2 DİL: Renk=${dil?.renk || '-'} | Kaplama=${dil?.kaplama || '-'}
KANAL 3 İDRAR: Renk=${idrar?.renk || '-'} | Kıvam=${idrar?.berraklik || '-'}
Kanallar örtüşüyorsa teşhis güvenilir. Ayrışıyorsa gözleme güven.

[SEBEP ANALİZİ — İbn Rüşd Yöntemi]
BÂDİ SEBEP (yakın/şimdiki): ${sikayet}
MÛİD SEBEPLER (uzak/alışkanlık — tedavide ele al):
  Gıda: ${diet_type || yasam?.beslenme || '-'} | Sindirim: ${digestion || '-'}
  Hareket: ${exercise_habit || yasam?.egzersiz || '-'}
  Uyku: ${sleep || '-'} | Ruh hali: ${mood_detail || yasam?.ruh || '-'}
NOT: Mûid sebepleri ortadan kaldırmadan bâdî tedavisi kalıcı olmaz.

ŞİKAYETLER: ${sikayet}

${notlar ? `EK NOTLAR / İLAÇ KULLANIMI: ${notlar}` : ''}

${klasikBaglam && klasikBaglam !== 'Klasik kaynaklarda esleme bulunamadi.' ? `---\nKLASIK KAYNAKLARDAN ILGILI METINLER:\n${klasikBaglam}\n---\nYukaridaki kaynak metinlerini analiz temelinde kullan.` : '---\nVeritabaninda bu semptom icin net kayit bulunamadi. Mevcut klinik verilerden (nabiz, dil, idrar, lab) analiz yap. Kaynak alanlarina bu durumu belirt.'}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
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
    console.log('[analiz] Claude API raw response:', text?.substring(0, 500))
    console.log('[analiz] Response length:', text?.length, 'stop_reason:', message.stop_reason)
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
