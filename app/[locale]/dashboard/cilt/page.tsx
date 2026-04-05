'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#8B6914', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CiltFormItem {
  id: string
  created_at: string
  hasta_adi?: string
  durum: string
  sorunlar?: string[]
  kayit_no?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sonuc_verisi?: any
}

const durumBadge = (d: string) => {
  if (d === 'email_gonderildi') return { bg: '#1B4332', color: '#F5EFE6', text: 'Gonderildi' }
  if (d === 'onaylandi') return { bg: '#E8F5E9', color: '#2E7D32', text: 'Onaylandi' }
  if (d === 'analiz_edildi') return { bg: '#E3F2FD', color: '#1565C0', text: 'Analiz Edildi' }
  if (d === 'reddedildi') return { bg: '#fef2f2', color: '#dc2626', text: 'Reddedildi' }
  return { bg: '#FFF8E7', color: '#E65100', text: 'Bekliyor' }
}

export default function DashboardCiltListPage() {
  const router = useRouter()
  const supabase = createClient()
  const [forms, setForms] = useState<CiltFormItem[]>([])
  const [filtered, setFiltered] = useState<CiltFormItem[]>([])
  const [loading, setLoading] = useState(true)
  const [arama, setArama] = useState('')

  useEffect(() => {
    async function yukle() {
      const { data } = await supabase
        .from('cilt_forms')
        .select('id, created_at, hasta_adi, durum, sorunlar, kayit_no, sonuc_verisi')
        .order('created_at', { ascending: false })
      setForms(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!arama.trim()) {
      setFiltered(forms)
    } else {
      const q = arama.toLowerCase()
      setFiltered(forms.filter(f => (f.hasta_adi || '').toLowerCase().includes(q)))
    }
  }, [arama, forms])

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      {/* Header */}
      <header style={{
        background: C.primary, padding: '0 24px', height: 60, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky' as const, top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 14, letterSpacing: 3, fontWeight: 600 }}>
              {"IPEK YOLU SIFACISI"}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, marginTop: 1 }}>
              {"Cilt Analizleri Yonetimi"}
            </div>
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 14px',
          fontSize: 12, color: C.gold, fontWeight: 600,
        }}>
          {forms.length} {"kayit"}
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Hasta adi ile ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', border: `1.5px solid ${C.border}`,
              borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit', background: C.white, color: C.dark,
            }}
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 40, textAlign: 'center' }}>
            {arama ? (
              <p style={{ fontSize: 14, color: C.secondary }}>{"Aramayla eslesen kayit bulunamadi."}</p>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>{"🌸"}</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: '#1B4332', marginBottom: 8 }}>{"Henüz cilt analizi formu gelmedi"}</div>
                <div style={{ fontSize: 14, color: '#5C4A2A' }}>{"Hastalar cilt formu doldurduğunda burada görünecek"}</div>
              </div>
            )}
          </div>
        ) : (
          /* Table-like list */
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 120px',
              padding: '12px 20px', background: C.surface, borderBottom: `1px solid ${C.border}`,
              fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase' as const,
              fontFamily: cinzel.style.fontFamily,
            }}>
              <span>{"Hasta"}</span>
              <span>{"Tarih"}</span>
              <span>{"Sorunlar"}</span>
              <span>{"Durum"}</span>
              <span style={{ textAlign: 'right' }}>{"Islem"}</span>
            </div>

            {/* Rows */}
            {filtered.map((f) => {
              const badge = durumBadge(f.durum)
              const tarih = new Date(f.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
              const needsAnalysis = !f.sonuc_verisi
              return (
                <div
                  key={f.id}
                  onClick={() => router.push(`/dashboard/cilt/${f.id}`)}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 120px',
                    padding: '14px 20px', borderBottom: `1px solid ${C.surface}`,
                    cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.surface }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                >
                  {/* Hasta adi */}
                  <div>
                    <div style={{ fontSize: 14, color: C.dark, fontWeight: 500 }}>{f.hasta_adi || 'Isimsiz'}</div>
                    {f.kayit_no && <div style={{ fontSize: 10, color: '#999', marginTop: 2, fontFamily: 'monospace' }}>{"#"}{f.kayit_no}</div>}
                  </div>

                  {/* Tarih */}
                  <div style={{ fontSize: 13, color: C.secondary }}>{tarih}</div>

                  {/* Sorunlar chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(f.sorunlar || []).slice(0, 3).map((s, i) => (
                      <span key={i} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 10,
                        background: C.surface, border: `1px solid ${C.border}`, color: C.secondary,
                      }}>
                        {s}
                      </span>
                    ))}
                    {(f.sorunlar || []).length > 3 && (
                      <span style={{ fontSize: 10, color: '#999' }}>+{(f.sorunlar || []).length - 3}</span>
                    )}
                  </div>

                  {/* Status badge */}
                  <span style={{
                    fontSize: 10, background: badge.bg, color: badge.color,
                    padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                    display: 'inline-block', textAlign: 'center', whiteSpace: 'nowrap',
                  }}>
                    {badge.text}
                  </span>

                  {/* Action button */}
                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/cilt/${f.id}`) }}
                      style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        border: needsAnalysis ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                        background: needsAnalysis ? C.gold : 'transparent',
                        color: needsAnalysis ? C.primary : C.secondary,
                        cursor: 'pointer', fontFamily: cinzel.style.fontFamily,
                      }}
                    >
                      {needsAnalysis ? 'Analiz Yap' : 'Goruntule'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
