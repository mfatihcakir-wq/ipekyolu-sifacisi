'use client'

import { useEffect, useState, useMemo } from 'react'
import { Cinzel, EB_Garamond, Noto_Naskh_Arabic } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })
const naskh = Noto_Naskh_Arabic({ subsets: ['arabic'], weight: ['400', '500'] })

const C = {
  primary: '#1B4332', gold: '#8B6914', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const MIZAC_RENK: Record<string, string> = {
  'sıcak': '#E53935', 'soğuk': '#2196F3', 'ılık': '#FF8F00', 'bilinmiyor': '#9C8B72',
}

interface Bitki {
  id: string
  ad_tr: string
  ad_ar: string
  ad_en: string
  ad_lat: string
  mizac_sicaklik: string
  mizac_nem: string
  mizac_derece: string
  faydalari: string
  organlar: string[]
  kaynaklar: string[]
  kaynak_metin: string
}

const PER_PAGE = 20

export default function BitkilerPage() {
  const [bitkiler, setBitkiler] = useState<Bitki[]>([])
  const [loading, setLoading] = useState(true)
  const [arama, setArama] = useState('')
  const [mizacF, setMizacF] = useState('')
  const [nemF, setNemF] = useState('')
  const [organF, setOrganF] = useState('')
  const [kaynakF, setKaynakF] = useState('')
  const [sayfa, setSayfa] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAbone, setIsAbone] = useState(false)
  const [aboneUyari, setAboneUyari] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function yukle() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('bitkiler')
          .select('*')
          .order('ad_tr', { ascending: true })
          .range(0, 1999)
        if (error) console.error('bitkiler fetch error:', error)
        setBitkiler(data || [])
      } catch (e) {
        console.error('bitkiler exception:', e)
      }
      setLoading(false)
    }
    async function aboneKontrol() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: ab } = await supabase
          .from('abonelikler')
          .select('durum')
          .eq('kullanici_id', user.id)
          .eq('durum', 'aktif')
          .single()
        setIsAbone(!!ab)
      } catch { /* abonelik tablosu yoksa sessizce gec */ }
    }
    yukle()
    aboneKontrol()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Unique organlar ve kaynaklar
  const uniqueOrganlar = useMemo(() => {
    const set = new Set<string>()
    bitkiler.forEach(b => b.organlar?.forEach(o => set.add(o)))
    return Array.from(set).sort()
  }, [bitkiler])

  const uniqueKaynaklar = useMemo(() => {
    const set = new Set<string>()
    bitkiler.forEach(b => b.kaynaklar?.forEach(k => {
      const ad = k.split('—')[0]?.trim()
      if (ad) set.add(ad)
    }))
    return Array.from(set).sort()
  }, [bitkiler])

  // Filtreleme
  const filtered = useMemo(() => {
    let list = bitkiler
    if (arama) {
      const q = arama.toLowerCase()
      list = list.filter(b =>
        b.ad_tr?.toLowerCase().includes(q) ||
        b.ad_ar?.includes(arama) ||
        b.ad_en?.toLowerCase().includes(q) ||
        b.faydalari?.toLowerCase().includes(q)
      )
    }
    if (mizacF) list = list.filter(b => b.mizac_sicaklik === mizacF)
    if (nemF) list = list.filter(b => b.mizac_nem === nemF)
    if (organF) list = list.filter(b => b.organlar?.some(o => o === organF))
    if (kaynakF) list = list.filter(b => b.kaynaklar?.some(k => k.includes(kaynakF)))
    return list
  }, [bitkiler, arama, mizacF, nemF, organF, kaynakF])

  // Sayfalama
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((sayfa - 1) * PER_PAGE, sayfa * PER_PAGE)

  // Sayfa sifirla filtre degisince
  useEffect(() => { setSayfa(1) }, [arama, mizacF, nemF, organF, kaynakF])

  // Istatistikler
  const stats = useMemo(() => ({
    toplam: bitkiler.length,
    sicak: bitkiler.filter(b => b.mizac_sicaklik === 'sıcak').length,
    soguk: bitkiler.filter(b => b.mizac_sicaklik === 'soğuk').length,
    kaynak: uniqueKaynaklar.length,
  }), [bitkiler, uniqueKaynaklar])

  const borderTopColor = (b: Bitki) => MIZAC_RENK[b.mizac_sicaklik] || MIZAC_RENK['bilinmiyor']

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      {/* HEADER */}
      <header style={{ background: C.primary, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, fontWeight: 600, letterSpacing: 3 }}>IPEK YOLU SIFACISI</div>
          </a>
          <div style={{ color: 'rgba(255,255,255,0.3)' }}>{'\u203A'}</div>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: 'rgba(255,255,255,0.7)', fontSize: 13, letterSpacing: 2 }}>MUFREDAT</div>
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: C.primary, padding: '40px 24px 36px', textAlign: 'center' }}>
        <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 'clamp(22px, 4vw, 30px)', color: C.gold, marginBottom: 8, letterSpacing: 2 }}>
          Klasik Islam Tibbi Mufredat Ansiklopedisi
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: 6 }}>
          el-Cami li-Mufredat (Ibn Beytar) kaynakli {stats.toplam} bitki
        </div>
        <div style={{ fontSize: 14, color: C.gold, fontFamily: naskh.style.fontFamily }}>الجامع لمفردات الأدوية والأغذية</div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* ISTATISTIK KARTLARI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Toplam', val: stats.toplam, color: C.primary },
            { label: 'Sicak', val: stats.sicak, color: '#E53935' },
            { label: 'Soguk', val: stats.soguk, color: '#2196F3' },
            { label: 'Kaynak', val: `${stats.kaynak}+`, color: C.gold },
          ].map(s => (
            <div key={s.label} style={{ background: C.white, borderRadius: 10, padding: '14px 16px', border: `1px solid ${C.border}`, borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: s.color, fontFamily: cinzel.style.fontFamily }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* ARAMA + FILTRE */}
        <div style={{ background: C.white, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: 12 }}>
            <input
              type="text" placeholder="Turkce, Arapca veya fayda ara..."
              value={arama} onChange={e => setArama(e.target.value)}
              style={{ flex: 1, minWidth: 220, padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 16, minHeight: 44, fontFamily: garamond.style.fontFamily, outline: 'none', background: C.surface }}
            />
            <div style={{ fontSize: 12, color: C.secondary, fontWeight: 600 }}>{filtered.length} bitki</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {/* Mizac */}
            <select value={mizacF} onChange={e => setMizacF(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: 'none', fontFamily: garamond.style.fontFamily, minHeight: 36 }}>
              <option value="">Tum Mizaclar</option>
              <option value="sıcak">Sicak</option>
              <option value="soğuk">Soguk</option>
              <option value="ılık">Ilik</option>
              <option value="bilinmiyor">Bilinmiyor</option>
            </select>
            {/* Nem */}
            <select value={nemF} onChange={e => setNemF(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: 'none', fontFamily: garamond.style.fontFamily, minHeight: 36 }}>
              <option value="">Tum Nem</option>
              <option value="kuru">Kuru</option>
              <option value="nemli">Nemli</option>
              <option value="bilinmiyor">Bilinmiyor</option>
            </select>
            {/* Organ */}
            <select value={organF} onChange={e => setOrganF(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: 'none', fontFamily: garamond.style.fontFamily, minHeight: 36 }}>
              <option value="">Tum Organlar</option>
              {uniqueOrganlar.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {/* Kaynak */}
            <select value={kaynakF} onChange={e => setKaynakF(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: 'none', fontFamily: garamond.style.fontFamily, minHeight: 36 }}>
              <option value="">Tum Kaynaklar</option>
              {uniqueKaynaklar.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            {(mizacF || nemF || organF || kaynakF || arama) && (
              <button onClick={() => { setMizacF(''); setNemF(''); setOrganF(''); setKaynakF(''); setArama('') }}
                style={{ padding: '8px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer', border: `1px solid ${C.border}`, background: 'transparent', color: '#999' }}>
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.border}` }}>
                <div style={{ height: 16, background: C.surface, borderRadius: 4, marginBottom: 8, width: '60%' }} />
                <div style={{ height: 12, background: C.surface, borderRadius: 4, marginBottom: 6, width: '40%' }} />
                <div style={{ height: 10, background: C.surface, borderRadius: 4, marginBottom: 12, width: '30%' }} />
                <div style={{ height: 10, background: C.surface, borderRadius: 4, marginBottom: 4, width: '100%' }} />
                <div style={{ height: 10, background: C.surface, borderRadius: 4, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* BITKI KARTLARI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
              {paged.map(b => {
                const expanded = expandedId === b.id
                const hasKontrendikasyon = b.kaynak_metin && (b.kaynak_metin.toLowerCase().includes('dikkat') || b.kaynak_metin.toLowerCase().includes('kontrendike') || b.kaynak_metin.toLowerCase().includes('zararl'))
                return (
                  <div key={b.id}
                    onClick={() => {
                      if (!isAbone) { setAboneUyari(true); return }
                      setExpandedId(expanded ? null : b.id)
                    }}
                    style={{
                      background: C.white, borderRadius: 12, padding: '16px 18px',
                      border: `1px solid ${C.border}`, borderTop: `3px solid ${borderTopColor(b)}`,
                      cursor: 'pointer', transition: 'box-shadow .15s',
                    }}>
                    {/* UST: Isimler + mizac */}
                    <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary, marginBottom: 2 }}>{b.ad_tr}</div>
                    {b.ad_ar && <div style={{ fontFamily: naskh.style.fontFamily, fontSize: 14, color: C.gold, direction: 'rtl', marginBottom: 2 }}>{b.ad_ar}</div>}
                    {b.ad_lat && <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic', marginBottom: 6 }}>{b.ad_lat}</div>}

                    {/* Mizac chip */}
                    {b.mizac_sicaklik && b.mizac_sicaklik !== 'bilinmiyor' ? (
                      isAbone ? (
                        <div style={{ display: 'inline-flex', gap: 4, marginBottom: 8 }}>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${MIZAC_RENK[b.mizac_sicaklik]}15`, color: MIZAC_RENK[b.mizac_sicaklik], fontWeight: 600 }}>
                            {b.mizac_sicaklik} {b.mizac_nem && b.mizac_nem !== 'bilinmiyor' ? `\u00B7 ${b.mizac_nem}` : ''} {b.mizac_derece ? `\u00B7 ${b.mizac_derece}. derece` : ''}
                          </span>
                        </div>
                      ) : (
                        <div style={{ fontSize: 10, color: C.secondary, filter: 'blur(4px)', userSelect: 'none', marginBottom: 8 }}>
                          sicak \u00B7 kuru \u00B7 2. derece <span style={{ filter: 'none' }}>{'\uD83D\uDD12'}</span>
                        </div>
                      )
                    ) : null}

                    {/* Organlar chip (maks 3) */}
                    {b.organlar?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginBottom: 6 }}>
                        {b.organlar.slice(0, 3).map((o, i) => (
                          <span key={i} style={{ fontSize: 9, background: '#E8F5E9', color: C.primary, padding: '2px 8px', borderRadius: 10 }}>{o}</span>
                        ))}
                        {b.organlar.length > 3 && <span style={{ fontSize: 9, color: '#999' }}>+{b.organlar.length - 3}</span>}
                      </div>
                    )}

                    {/* Faydalar onizleme */}
                    {isAbone && b.faydalari && !expanded && (
                      <div style={{ fontSize: 12, color: C.dark, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{b.faydalari}</div>
                    )}

                    {/* Kaynak */}
                    {b.kaynaklar?.[0] && (
                      <div style={{ fontSize: 10, color: C.gold, fontFamily: cinzel.style.fontFamily, marginTop: 6 }}>{b.kaynaklar[0].split('—')[0]?.trim()}</div>
                    )}

                    {/* Detay butonu */}
                    <div style={{ fontSize: 11, color: C.primary, fontWeight: 600, marginTop: 8 }}>
                      {expanded ? '\u25B2 Kapat' : '\u25BC Detay'}
                    </div>

                    {/* GENISLEME */}
                    {expanded && isAbone && (
                      <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                        {/* Tam faydalar */}
                        {b.faydalari && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1, marginBottom: 4, fontWeight: 600 }}>FAYDALARI</div>
                            <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.7 }}>{b.faydalari}</div>
                          </div>
                        )}

                        {/* Kaynak metin */}
                        {b.kaynak_metin && (
                          <div style={{ background: C.surface, borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 4 }}>KLASIK KAYNAK</div>
                            <div style={{ fontSize: 12, color: C.dark, lineHeight: 1.6, fontStyle: 'italic' }}>{b.kaynak_metin}</div>
                          </div>
                        )}

                        {/* Kontrendikasyon */}
                        {hasKontrendikasyon && (
                          <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: C.secondary }}>
                            {'\u26A0'} Dikkat: Bu bitki ile ilgili ozel uyarilar mevcuttur. Kullanim oncesi danismana basvurun.
                          </div>
                        )}

                        {/* Tum organlar */}
                        {b.organlar?.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 4 }}>ETKILEDIGI ORGANLAR</div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                              {b.organlar.map((o, i) => (
                                <span key={i} style={{ fontSize: 10, background: '#E8F5E9', color: C.primary, padding: '2px 8px', borderRadius: 10 }}>{o}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tum kaynaklar */}
                        {b.kaynaklar?.length > 0 && (
                          <div>
                            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 4 }}>KAYNAKLAR</div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                              {b.kaynaklar.map((k, i) => (
                                <span key={i} style={{ fontSize: 10, background: '#E8F5E9', color: C.primary, padding: '2px 8px', borderRadius: 10, fontStyle: 'italic' }}>{k}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* SAYFALAMA */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 40 }}>
                <button onClick={() => setSayfa(Math.max(1, sayfa - 1))} disabled={sayfa === 1}
                  style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: sayfa === 1 ? '#ccc' : C.primary, cursor: sayfa === 1 ? 'default' : 'pointer', fontSize: 12 }}>
                  {'\u2190'} Onceki
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let p: number
                  if (totalPages <= 7) p = i + 1
                  else if (sayfa <= 4) p = i + 1
                  else if (sayfa >= totalPages - 3) p = totalPages - 6 + i
                  else p = sayfa - 3 + i
                  return (
                    <button key={p} onClick={() => setSayfa(p)}
                      style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${sayfa === p ? C.primary : C.border}`, background: sayfa === p ? C.primary : C.white, color: sayfa === p ? C.gold : C.secondary, cursor: 'pointer', fontSize: 12, fontWeight: sayfa === p ? 600 : 400 }}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => setSayfa(Math.min(totalPages, sayfa + 1))} disabled={sayfa === totalPages}
                  style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: sayfa === totalPages ? '#ccc' : C.primary, cursor: sayfa === totalPages ? 'default' : 'pointer', fontSize: 12 }}>
                  Sonraki {'\u2192'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ABONE UYARI MODAL */}
      {aboneUyari && (
        <div onClick={() => setAboneUyari(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, maxWidth: 420, width: '100%', padding: '40px 36px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDD12'}</div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: C.primary, marginBottom: 8 }}>Bu Icerik Abonelere Ozeldir</div>
            <div style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6, marginBottom: 24 }}>
              Bitki Ansiklopedisi ne tam erisim icin uyelik gereklidir.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <a href="/odeme" style={{ textDecoration: 'none', padding: '12px 28px', borderRadius: 10, background: C.primary, color: C.gold, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>Abone Ol</a>
              <button onClick={() => setAboneUyari(false)} style={{ padding: '12px 28px', borderRadius: 10, background: 'transparent', border: `1px solid ${C.border}`, color: C.secondary, fontSize: 14, cursor: 'pointer' }}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
