'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

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
  const [arama, setArama] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { yukle() }, [])

  useEffect(() => {
    let list = vakalar
    if (mizacFiltre) list = list.filter(v => v.mizac?.toLowerCase().includes(mizacFiltre.toLowerCase()))
    if (arama) list = list.filter(v =>
      v.detailed_forms?.tam_ad?.toLowerCase().includes(arama.toLowerCase()) ||
      v.detailed_forms?.telefon?.includes(arama)
    )
    setFiltered(list)
  }, [vakalar, mizacFiltre, arama])

  async function yukle() {
    setLoading(true)
    const { data } = await supabase
      .from('analyses')
      .select('*, detailed_forms(tam_ad, telefon, tum_form_verisi)')
      .order('created_at', { ascending: false })
    setVakalar(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const mizacRenk = (m: string) => {
    if (!m) return { bg: '#F5F5F5', color: '#999' }
    const ml = m.toLowerCase()
    if (ml.includes('safra')) return { bg: '#FFF8E7', color: '#B8860B' }
    if (ml.includes('dem')) return { bg: '#FFE8E8', color: '#C62828' }
    if (ml.includes('balgam')) return { bg: '#E3F2FD', color: '#1565C0' }
    if (ml.includes('sevda')) return { bg: '#F3E5F5', color: '#6A1B9A' }
    return { bg: '#E8F5E9', color: '#1B5E20' }
  }

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
          ].map(s => (
            <div key={s.label} style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}`, borderLeft: `4px solid ${s.accent}` }}>
              <div style={{ fontSize: 11, color: C.secondary, letterSpacing: 1, textTransform: 'uppercase' as const }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 600, fontFamily: cinzel.style.fontFamily, color: s.accent, marginTop: 4 }}>{s.val}</div>
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
            <option value="">{"Tüm Mizaçlar"}</option>
            <option value="safra">{"Safravî"}</option>
            <option value="balgam">{"Balgamî"}</option>
            <option value="dem">{"Demevî"}</option>
            <option value="sevda">{"Sevdavî"}</option>
          </select>
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
                  const fv = v.detailed_forms?.tum_form_verisi || {}
                  return (
                    <div key={v.id} onClick={() => setSecili(secili?.id === v.id ? null : v)}
                      style={{ background: secili?.id === v.id ? '#E8F5E9' : C.white, border: `1px solid ${secili?.id === v.id ? C.primary : C.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: C.dark }}>{v.detailed_forms?.tam_ad || 'Bilinmiyor'}</div>
                        <span style={{ fontSize: 10, background: mr.bg, color: mr.color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{v.mizac?.split(',')[0] || '-'}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.secondary }}>{v.detailed_forms?.telefon || '-'}</div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        <div style={{ fontSize: 11, color: '#999' }}>{tarih}</div>
                        {fv.symptoms && <div style={{ fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: 200 }}>{fv.symptoms}</div>}
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
                    <div key={i} style={{ fontSize: 12, padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
                      🌿 <strong>{b.bitki}</strong> — {b.doz}
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
              <a href={`https://wa.me/${(secili.detailed_forms?.telefon || '').replace(/[^0-9]/g, '')}`} target="_blank"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: 'white', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily }}>
                WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
