import { createServerSupabaseClient } from '@/lib/supabase-server'

export type TalepVerisi = {
  sikayetler?: string | null
  nabiz?: Record<string, unknown> | null
  dil?: Record<string, unknown> | null
  yuz?: Record<string, unknown> | null
  idrar?: Record<string, unknown> | null
  diski?: Record<string, unknown> | null
  fizik_olcum?: Record<string, unknown> | null
  yasam_tarzi?: Record<string, unknown> | null
  [key: string]: unknown
}

function anahtarKelimelerCikar(talep: TalepVerisi): string[] {
  const kelimeler = new Set<string>()

  if (talep.sikayetler) {
    const sozcukler = talep.sikayetler
      .toLowerCase()
      .split(/[\s,\.\n;]+/)
      .filter((s) => s.length > 3)
    sozcukler.forEach((s) => kelimeler.add(s))
  }

  const dil = talep.dil as { renk?: string; kaplama?: string } | null | undefined
  const idrar = talep.idrar as { renk?: string; kivam?: string } | null | undefined
  const nabiz = talep.nabiz as { buyukluk?: string } | null | undefined
  const fizik = talep.fizik_olcum as { vucud_isisi?: string | number } | null | undefined

  if (dil?.renk) kelimeler.add('dil ' + dil.renk)
  if (dil?.kaplama) kelimeler.add('dil kaplama')
  if (idrar?.renk) kelimeler.add('idrar bevl ' + idrar.renk)
  if (idrar?.kivam === 'bulanik') kelimeler.add('bulanık idrar balgam')

  if (nabiz?.buyukluk && nabiz.buyukluk !== 'orta') {
    kelimeler.add('nabız ' + nabiz.buyukluk)
  }

  const isi = typeof fizik?.vucud_isisi === 'string' ? parseFloat(fizik.vucud_isisi) : fizik?.vucud_isisi
  if (typeof isi === 'number' && !isNaN(isi)) {
    if (isi >= 38) kelimeler.add('ateş hararet humma')
    else if (isi <= 36) kelimeler.add('soğukluk balgam')
  }

  const kopru: Record<string, string> = {
    'ağrı': 'elem veca',
    'ateş': 'humma hararet',
    'ishal': 'ishâl',
    'kabız': 'imsak',
    'öksürük': 'süal',
    'baş': 'ras dimağ',
    'karaciğer': 'kebid ciğer',
    'böbrek': 'kulye',
    'kalp': 'kalb fuad',
    'mide': 'mide mead',
    'uykusuzluk': 'seher',
    'yorgunluk': 'taaeb',
    'melankoli': 'sevda vesvese',
    'sarı': 'safra',
    'siyah': 'sevda',
  }

  const sikayet = (talep.sikayetler || '').toLowerCase()
  for (const [tr, ar] of Object.entries(kopru)) {
    if (sikayet.includes(tr)) kelimeler.add(ar)
  }

  return Array.from(kelimeler).slice(0, 20)
}

export async function klasikKaynakCek(talep: TalepVerisi): Promise<string> {
  const supabase = createServerSupabaseClient()

  const { data: sabitKaynaklar } = await supabase
    .from('klasik_kaynaklar')
    .select('kitap_adi, bolum, icerik_tr')
    .ilike('kitap_adi', '%Mansûrî%')
    .limit(10)

  const { data: samil } = await supabase
    .from('klasik_kaynaklar')
    .select('kitap_adi, bolum, icerik_tr')
    .ilike('kitap_adi', '%Şâmil%')
    .limit(10)

  const kelimeler = anahtarKelimelerCikar(talep)

  let ilgiliKayitlar: Array<{ kitap_adi: string; bolum: string; icerik_tr: string | null }> = []
  if (kelimeler.length > 0) {
    const orQuery = kelimeler
      .slice(0, 5)
      .map((k) => `icerik_tr.ilike.%${k}%`)
      .join(',')
    const { data } = await supabase
      .from('klasik_kaynaklar')
      .select('kitap_adi, bolum, icerik_tr')
      .or(orQuery)
      .limit(25)
    ilgiliKayitlar = data || []
  }

  let context = '📖 KLASİK KAYNAKLAR (Supabase klasik_kaynaklar tablosundan)\n\n'

  const sabitTumu = [...(sabitKaynaklar || []), ...(samil || [])]
  if (sabitTumu.length > 0) {
    context += '=== SABİT BAĞLAM ===\n\n'
    for (const k of sabitTumu) {
      context += `📖 ${k.kitap_adi} — ${k.bolum}\n${(k.icerik_tr || '').slice(0, 800)}\n\n`
    }
  }

  if (ilgiliKayitlar.length > 0) {
    context += '=== ŞİKAYETLE İLGİLİ KAYITLAR ===\n\n'
    for (const k of ilgiliKayitlar.slice(0, 15)) {
      context += `📖 ${k.kitap_adi} — ${k.bolum}\n${(k.icerik_tr || '').slice(0, 600)}\n\n`
    }
  }

  if (sabitTumu.length === 0 && ilgiliKayitlar.length === 0) {
    context += '(Bu vaka için klasik kaynaklardan doğrudan eşleşen kayıt bulunamadı.)'
  }

  return context
}
