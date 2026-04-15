'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#DEB887',
  white: '#FFFFFF', surface: '#FAF6EF',
}

const HEKIM_PROFILLER = [
  { id: 'razi', ad: 'er-Râzî', renk: '#2563EB', kitap: 'el-Hâvî', aciklama: 'Ampirik gözlem', sistem_prompt_eki: 'Sen er-Râzî perspektifinden yanıt ver. Ampirik gözlem ve klinik deneyimi ön plana çıkar. el-Hâvî fit-Tıb eserindeki vaka kayıtlarına atıf yap.' },
  { id: 'nefis', ad: 'İbn Nefîs', renk: '#059669', kitap: 'el-Şâmil', aciklama: 'Sistematik analiz', sistem_prompt_eki: 'Sen İbn Nefîs perspektifinden yanıt ver. Sistematik nabız ve idrar analizini ön plana çıkar. el-Şâmil eserindeki fasıllara atıf yap.' },
  { id: 'rusd', ad: 'İbn Rüşd', renk: '#7C3AED', kitap: 'el-Külliyyât', aciklama: 'Mantık çerçevesi', sistem_prompt_eki: 'Sen İbn Rüşd perspektifinden yanıt ver. Mantıksal sebep-sonuç çerçevesini kullan. el-Külliyyât fit-Tıb eserindeki taksim metoduna atıf yap.' },
  { id: 'zehravi', ad: 'ez-Zehravî', renk: '#EA580C', kitap: 'et-Tasrîf', aciklama: 'Cerrahi bakış', sistem_prompt_eki: 'Sen ez-Zehravî perspektifinden yanıt ver. Pratik müdahale ve cerrahi bakış açısını ön plana çıkar. et-Tasrîf eserindeki uygulamalara atıf yap.' },
  { id: 'beytar', ad: 'İbn Beytâr', renk: '#92400E', kitap: 'el-Câmi', aciklama: 'Bitki otoritesi', sistem_prompt_eki: 'Sen İbn Beytâr perspektifinden yanıt ver. Bitki ve müfredat bilgisini ön plana çıkar. el-Câmi li-Müfredât eserindeki maddelere atıf yap.' },
  { id: 'tokadi', ad: 'Tokadî', renk: '#92600A', kitap: 'Tahbîzül-Mathûn', aciklama: 'Osmanlı tatbik geleneği', isim: 'Mustafa b. Yusuf Tokadî', isim_ar: '\u0637\u0648\u0642\u0627\u062f\u064a', lakap: 'Şârihu\u2019l-Kânûn', olum: 'ö. 1195/1781', kaynak_kodu: 'SRC-007', ikon: '\uD83D\uDCDC', metot: 'Osmanlı tatbik geleneği, el-Kânûn Türkçe şerhi, yerel formüller', sistem_prompt_eki: 'Sen Mustafa b. Yusuf Tokadi sin (ö.1195/1781) \u2014 Tahbizül-Mathûn müellifi, el-Kânûn un en kapsamlı Osmanlıca sarihisin. Methodun: İbn Sînâ nın teorisini Osmanlı cografyasının bitkilerine ve iklimine uygula. Teoriden pratige köprü kur. Anadolu da temin edilebilir bitkilerle formüller öner. Osmanlıca tıb terminolojisini kullan, modern Türkçeye çevir. Kaynak: Tahbizül-Mathûn fit-Tib a atıf yap.' },
]

interface VakaKayit {
  id: string
  form_id: string
  mizac: string
  created_at: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sonuc_json: any
  detailed_forms?: {
    tam_ad: string
    telefon: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tum_form_verisi: any
  }
}

export default function ArsivPage() {
  const [vakalar, setVakalar] = useState<VakaKayit[]>([])
  const [filtered, setFiltered] = useState<VakaKayit[]>([])
  const [loading, setLoading] = useState(true)
  const [secili, setSecili] = useState<VakaKayit | null>(null)
  const [mizacFiltre, setMizacFiltre] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [kaynakFiltre, setKaynakFiltre] = useState('')
  const [arama, setArama] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Hekim yorum state
  const [hekimModal, setHekimModal] = useState(false)
  const [hekimVaka, setHekimVaka] = useState<VakaKayit | null>(null)
  const [seciliHekim, setSeciliHekim] = useState<string | null>(null)
  const [hekimYorum, setHekimYorum] = useState('')
  const [hekimYukleniyor, setHekimYukleniyor] = useState(false)

  const yukle = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('analyses')
      .select('*, detailed_forms(tam_ad, telefon, tum_form_verisi)')
      .order('created_at', { ascending: false })
    setVakalar(data || [])
    setFiltered(data || [])
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { yukle() }, [yukle])

  useEffect(() => {
    let list = vakalar
    if (mizacFiltre) list = list.filter(v => v.mizac?.toLowerCase().includes(mizacFiltre.toLowerCase()))
    if (kaynakFiltre) list = list.filter(v => {
      const bitkiler = v.sonuc_json?.bitki_recetesi || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return bitkiler.some((b: any) => b.kaynak?.toLowerCase().includes(kaynakFiltre.toLowerCase()))
    })
    if (arama) list = list.filter(v =>
      v.detailed_forms?.tam_ad?.toLowerCase().includes(arama.toLowerCase()) ||
      v.detailed_forms?.telefon?.includes(arama)
    )
    setFiltered(list)
  }, [vakalar, mizacFiltre, kaynakFiltre, arama])

  const mizacRenk = (m: string) => {
    if (!m) return { bg: '#F5F5F5', color: '#999' }
    const ml = m.toLowerCase()
    if (ml.includes('safra')) return { bg: '#FFF8E7', color: '#B8860B' }
    if (ml.includes('dem')) return { bg: '#FFE8E8', color: '#C62828' }
    if (ml.includes('balgam')) return { bg: '#E3F2FD', color: '#1565C0' }
    if (ml.includes('sevda')) return { bg: '#F3E5F5', color: '#6A1B9A' }
    return { bg: '#E8F5E9', color: '#1B5E20' }
  }

  const hiltBar = (sonuc: VakaKayit['sonuc_json']) => {
    if (!sonuc?.hilt_dengesi) return null
    const hiltler = [
      { key: 'dem', label: 'D', color: '#EF5350' },
      { key: 'balgam', label: 'B', color: '#42A5F5' },
      { key: 'safra', label: 'S', color: '#FFA726' },
      { key: 'kara_safra', label: 'K', color: '#AB47BC' },
    ]
    return (
      <div style={{ display: 'flex', gap: 2, height: 6, borderRadius: 3, overflow: 'hidden', flex: 1, maxWidth: 120 }}>
        {hiltler.map(h => {
          const val = sonuc.hilt_dengesi[h.key]?.yuzde || 0
          return val > 0 ? (
            <div key={h.key} style={{ width: `${val}%`, background: h.color, minWidth: 2 }} title={`${h.label}: ${val}%`} />
          ) : null
        })}
      </div>
    )
  }

  const bitkiChips = (sonuc: VakaKayit['sonuc_json']) => {
    if (!sonuc?.bitki_recetesi?.length) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bitkiler = sonuc.bitki_recetesi.slice(0, 3).map((b: any) => b.bitki)
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginTop: 4 }}>
        {bitkiler.map((b: string, i: number) => (
          <span key={i} style={{ fontSize: 9, background: '#E8F5E9', color: C.primary, padding: '1px 6px', borderRadius: 10 }}>{b}</span>
        ))}
      </div>
    )
  }

  const openHekimModal = (v: VakaKayit, e: React.MouseEvent) => {
    e.stopPropagation()
    setHekimVaka(v)
    setHekimModal(true)
    setSeciliHekim(null)
    setHekimYorum('')
    setHekimYukleniyor(false)
  }

  const selectHekim = (hekimId: string) => {
    setSeciliHekim(hekimId)
    setHekimYukleniyor(true)
    setHekimYorum('')

    const hekim = HEKIM_PROFILLER.find(h => h.id === hekimId)
    if (!hekim || !hekimVaka) return

    const mizac = hekimVaka.mizac || 'Bilinmiyor'
    const ad = hekimVaka.detailed_forms?.tam_ad || 'Danışan'
    const ozet = hekimVaka.sonuc_json?.ozet || ''

    setTimeout(() => {
      setHekimYorum(
        `${hekim.ad} (${hekim.kitap}) perspektifinden değerlendirme:\n\n` +
        `Hasta ${ad}, baskın mizacı ${mizac} olarak tespit edilmiştir. ` +
        `${hekim.aciklama} yaklaşımıyla incelediğimizde:\n\n` +
        (ozet ? `Genel değerlendirme: ${ozet}\n\n` : '') +
        `${hekim.kitap} eserinde belirtildiği üzere, bu mizac tipinde ` +
        `dikkat edilmesi gereken hususlar mevcuttur. Detaylı hekim yorumu için ` +
        `API entegrasyonu yapılandırılmalıdır.\n\n` +
        `\u2014 ${hekim.ad}, ${hekim.kitap}`
      )
      setHekimYukleniyor(false)
    }, 2000)
  }

  const MIZAC_FILTRE_BUTONLARI = [
    { label: 'Tümü', value: '' },
    { label: 'Demevî', value: 'dem' },
    { label: 'Safravî', value: 'safra' },
    { label: 'Balgamî', value: 'balgam' },
    { label: 'Sevdavî', value: 'sevda' },
  ]

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>
            {'\u2190'} Panel
          </button>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, fontWeight: 600, letterSpacing: 3 }}>{"VAKA ARŞİVİ"}</div>
        </div>
        <button onClick={yukle} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Yenile</button>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* İSTATİSTİK */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Toplam Analiz', val: vakalar.length, accent: C.secondary },
            { label: 'Safravi', val: vakalar.filter(v => v.mizac?.toLowerCase().includes('safra')).length, accent: '#B8860B' },
            { label: 'Balgami', val: vakalar.filter(v => v.mizac?.toLowerCase().includes('balgam')).length, accent: '#1565C0' },
            { label: 'Demevi / Sevdavi', val: vakalar.filter(v => v.mizac?.toLowerCase().includes('dem') || v.mizac?.toLowerCase().includes('sevda')).length, accent: '#C62828' },
          ].map(st => (
            <div key={st.label} style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}`, borderLeft: `4px solid ${st.accent}` }}>
              <div style={{ fontSize: 11, color: C.secondary, letterSpacing: 1, textTransform: 'uppercase' as const }}>{st.label}</div>
              <div style={{ fontSize: 26, fontWeight: 600, fontFamily: cinzel.style.fontFamily, color: st.accent, marginTop: 4 }}>{st.val}</div>
            </div>
          ))}
        </div>

        {/* FİLTRE */}
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', marginBottom: 16, border: `1px solid ${C.border}`, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' as const }}>
          <input
            type="text"
            placeholder="Ad veya telefon ara..."
            value={arama}
            onChange={e => setArama(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: garamond.style.fontFamily }}
          />
          <select value={mizacFiltre} onChange={e => setMizacFiltre(e.target.value)}
            style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: garamond.style.fontFamily }}>
            <option value="">{"üm Mizaçlar"}</option>
            <option value="safra">{"Safravî"}</option>
            <option value="balgam">{"Balgamî"}</option>
            <option value="dem">{"Demevî"}</option>
            <option value="sevda">{"Sevdavî"}</option>
          </select>
          <select value={kaynakFiltre} onChange={e => setKaynakFiltre(e.target.value)}
            style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: garamond.style.fontFamily }}>
            <option value="">{"Tüm Kaynaklar"}</option>
            <option value="havi">{"el-Hâvî \u2014 er-Râzî"}</option>
            <option value="tahbiz">{"Tahbîzül-Mathûn \u2014 Tokadî"}</option>
            <option value="samil">{"el-Şâmil \u2014 İbn Nefîs"}</option>
            <option value="cevahir">{"Bahrül-Cevâhir"}</option>
            <option value="kanun">{"el-Kânûn"}</option>
          </select>
        </div>

        {/* MIZAC FILTER BUTTONS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' as const }}>
          {MIZAC_FILTRE_BUTONLARI.map(b => (
            <button
              key={b.value}
              onClick={() => setMizacFiltre(b.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: `1.5px solid ${mizacFiltre === b.value ? C.primary : C.border}`,
                background: mizacFiltre === b.value ? C.primary : C.white,
                color: mizacFiltre === b.value ? C.white : C.secondary,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: garamond.style.fontFamily,
                fontWeight: mizacFiltre === b.value ? 600 : 400,
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* İKİ KOLON */}
        <div style={{ display: 'grid', gridTemplateColumns: secili ? '380px 1fr' : '1fr', gap: 16 }}>

          {/* LİSTE */}
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' as const }}>
              Analizler ({filtered.length})
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: C.secondary }}>{"Yükleniyor..."}</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: C.secondary, fontStyle: 'italic' }}>{"Analiz bulunamadı."}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(v => {
                  const mr = mizacRenk(v.mizac)
                  const tarih = new Date(v.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
                  return (
                    <div key={v.id} onClick={() => setSecili(secili?.id === v.id ? null : v)}
                      style={{ background: secili?.id === v.id ? '#E8F5E9' : C.white, border: `1px solid ${secili?.id === v.id ? C.primary : C.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: C.dark }}>{v.detailed_forms?.tam_ad || 'Bilinmiyor'}</div>
                        <span style={{ fontSize: 10, background: mr.bg, color: mr.color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{v.mizac?.split(',')[0] || '-'}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.secondary }}>{v.detailed_forms?.telefon || '-'}</div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, alignItems: 'center' }}>
                        <div style={{ fontSize: 11, color: '#999' }}>{tarih}</div>
                        {hiltBar(v.sonuc_json)}
                      </div>
                      {bitkiChips(v.sonuc_json)}
                      <div style={{ marginTop: 8 }}>
                        <button
                          onClick={(e) => openHekimModal(v, e)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: `1px solid ${C.gold}`,
                            background: '#FFF8E7',
                            color: C.secondary,
                            fontSize: 11,
                            cursor: 'pointer',
                            fontFamily: garamond.style.fontFamily,
                          }}
                        >
                          {"Hekim Yorumu"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* DETAY */}
          {secili && (
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', maxHeight: '80vh', overflowY: 'auto' as const }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.primary }}>{secili.detailed_forms?.tam_ad}</div>
                  <div style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>{secili.detailed_forms?.telefon}</div>
                </div>
                <button onClick={() => setSecili(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>{'\u2715'}</button>
              </div>

              {/* MİZAÇ */}
              {secili.sonuc_json?.mizac && (
                <div style={{ background: C.primary, borderRadius: 10, padding: '14px 18px', marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 4 }}>{"BASKIN MİZAÇ"}</div>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold }}>{secili.sonuc_json.mizac}</div>
                  {secili.sonuc_json.fitri_hali?.tedavi_hedefi && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8, fontStyle: 'italic' }}>{secili.sonuc_json.fitri_hali.tedavi_hedefi}</div>
                  )}
                </div>
              )}

              {/* ÖZET */}
              {secili.sonuc_json?.ozet && (
                <div style={{ background: C.surface, borderRadius: 8, padding: '12px 14px', marginBottom: 12, fontSize: 13, color: C.dark, lineHeight: 1.7 }}>
                  {secili.sonuc_json.ozet}
                </div>
              )}

              {/* BİTKİLER */}
              {secili.sonuc_json?.bitki_recetesi?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' as const }}>Bitkisel Protokol</div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {secili.sonuc_json.bitki_recetesi.map((b: any, i: number) => (
                    <div key={i} style={{ fontSize: 12, padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                      <div>{'\uD83C\uDF3F'} <strong>{b.bitki}</strong>{b.ar ? ` (${b.ar})` : ''} {'\u2014'} {b.doz}</div>
                      {b.kaynak && <div style={{ fontSize: 10, color: '#888', marginTop: 2, fontStyle: 'italic' }}>{b.kaynak}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* KAYNAKLAR */}
              {secili.sonuc_json?.kaynaklar?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {secili.sonuc_json.kaynaklar.map((k: string, i: number) => (
                    <span key={i} style={{ fontSize: 10, background: '#E8F5E9', color: C.primary, padding: '2px 8px', borderRadius: 20, fontStyle: 'italic' }}>{k}</span>
                  ))}
                </div>
              )}

              {/* WA BUTONU */}
              <a href="https://wa.me/905331687226" target="_blank"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', color: '#25D366', border: '1px solid #25D366', borderRadius: 10, padding: '12px', fontSize: 12, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily }}>
                {"💬 Kisisel Not Ekle"}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* HEKİM YORUM MODAL */}
      {hekimModal && (
        <div style={{
          position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
          onClick={() => setHekimModal(false)}
        >
          <div
            style={{
              background: C.white, borderRadius: 16, maxWidth: 600, width: '100%',
              maxHeight: '85vh', overflowY: 'auto' as const, padding: '24px',
              border: `2px solid ${C.border}`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary, letterSpacing: 2 }}>{"HEKİM YORUMU"}</div>
                {hekimVaka && (
                  <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{hekimVaka.detailed_forms?.tam_ad} {'\u2014'} {hekimVaka.mizac}</div>
                )}
              </div>
              <button onClick={() => setHekimModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>{'\u2715'}</button>
            </div>

            {/* HEKİM SEÇİM KARTLARI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: 10, marginBottom: 16 }}>
              {HEKIM_PROFILLER.map(h => (
                <button
                  key={h.id}
                  onClick={() => selectHekim(h.id)}
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    border: `2px solid ${seciliHekim === h.id ? h.renk : C.border}`,
                    background: seciliHekim === h.id ? `${h.renk}10` : C.surface,
                    cursor: 'pointer',
                    textAlign: 'left' as const,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: h.renk, fontFamily: cinzel.style.fontFamily }}>{h.ad}</div>
                  <div style={{ fontSize: 10, color: C.gold, fontStyle: 'italic', marginTop: 2 }}>{h.kitap}</div>
                  <div style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>{h.aciklama}</div>
                </button>
              ))}
            </div>

            {/* YORUM ALANI */}
            {hekimYukleniyor && (
              <div style={{ textAlign: 'center' as const, padding: 24, color: C.secondary }}>
                <div style={{ fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{"Hekim yorumu hazırlanıyor..."}</div>
                <div style={{ width: 24, height: 24, border: `3px solid ${C.border}`, borderTopColor: C.primary, borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            )}

            {hekimYorum && !hekimYukleniyor && (
              <div style={{ background: C.surface, borderRadius: 10, padding: '16px', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.8, whiteSpace: 'pre-wrap' as const }}>
                  {hekimYorum}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
