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

interface CiltForm {
  id: string
  created_at: string
  kayit_no?: string
  durum: string
  sorunlar: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sonuc_verisi: any
}

const durumBadge = (d: string) => {
  if (d === 'email_gonderildi') return { bg: '#1B4332', color: '#F5EFE6', text: 'Gonderildi' }
  if (d === 'onaylandi' || d === 'analiz_edildi') return { bg: '#E8F5E9', color: '#2E7D32', text: 'Recete Hazir' }
  if (d === 'reddedildi') return { bg: '#fef2f2', color: '#dc2626', text: 'Reddedildi' }
  return { bg: '#FFF8E7', color: '#E65100', text: 'Bekliyor' }
}

export default function CiltAnalizlerimPage() {
  const router = useRouter()
  const supabase = createClient()
  const [forms, setForms] = useState<CiltForm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }
      const { data } = await supabase
        .from('cilt_forms')
        .select('id, created_at, kayit_no, durum, sorunlar, sonuc_verisi')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setForms(data || [])
      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      {/* Sticky Header */}
      <header style={{
        background: C.primary, padding: '0 24px', height: 60, display: 'flex',
        alignItems: 'center', gap: 16, position: 'sticky' as const, top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <button onClick={() => router.push('/hasta')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 14, letterSpacing: 3, fontWeight: 600 }}>
            {"IPEK YOLU SIFACISI"}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, marginTop: 1 }}>
            {"Cilt Analizlerim"}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
        {/* Title Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, fontWeight: 500, margin: 0 }}>
            {"Cilt Analizlerim"}
          </h1>
          <button onClick={() => router.push('/hasta/cilt')} style={{
            padding: '8px 18px', background: C.gold, border: 'none', borderRadius: 8,
            fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.primary, cursor: 'pointer', fontWeight: 600,
          }}>
            {"+ Yeni Analiz"}
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : forms.length === 0 ? (
          /* Empty State */
          <div style={{
            background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
            padding: 48, textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>{'\uD83C\uDF3F'}</div>
            <p style={{ fontSize: 16, color: C.dark, marginBottom: 6, fontWeight: 500 }}>
              {"Henuz cilt analiziniz bulunmuyor"}
            </p>
            <p style={{ fontSize: 13, color: C.secondary, marginBottom: 24, lineHeight: 1.6 }}>
              {"Klasik Islam tibbi kaynaklarina dayali kisisel cilt bakim recetenizi olusturmak icin ilk analizinizi baslatin."}
            </p>
            <button onClick={() => router.push('/hasta/cilt')} style={{
              padding: '12px 28px', background: C.primary, color: C.gold, border: 'none',
              borderRadius: 10, fontFamily: cinzel.style.fontFamily, fontSize: 13, cursor: 'pointer', fontWeight: 600, letterSpacing: 1,
            }}>
              {"Ilk Cilt Analizini Baslat"}
            </button>
          </div>
        ) : (
          /* Cards */
          <div style={{ display: 'grid', gap: 14 }}>
            {forms.map(f => {
              const badge = durumBadge(f.durum)
              const tarih = new Date(f.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
              const aktif = f.durum !== 'beklemede'
              const ozet = f.sonuc_verisi?.teshis?.sorun_ozeti || f.sonuc_verisi?.sorun_ozeti || ''
              return (
                <div key={f.id} style={{
                  background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
                  padding: '20px 24px', transition: 'box-shadow 0.2s',
                }}>
                  {/* Top row: tarih + kayit_no + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, color: C.dark, fontWeight: 500 }}>{tarih}</div>
                      {f.kayit_no && (
                        <div style={{ fontSize: 11, color: C.secondary, marginTop: 3, fontFamily: 'monospace' }}>
                          {"#"}{f.kayit_no}
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: 10, background: badge.bg, color: badge.color,
                      padding: '4px 12px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap',
                    }}>
                      {badge.text}
                    </span>
                  </div>

                  {/* Sorunlar chips */}
                  {f.sorunlar && f.sorunlar.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {f.sorunlar.map((s, i) => (
                        <span key={i} style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 14,
                          background: C.surface, border: `1px solid ${C.border}`, color: C.secondary,
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Teshis ozeti */}
                  {ozet && (
                    <div style={{
                      fontSize: 13, color: C.secondary, fontStyle: 'italic', marginBottom: 12,
                      lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {ozet}
                    </div>
                  )}

                  {/* Action button */}
                  <button
                    onClick={() => aktif ? router.push(`/hasta/cilt-analizlerim/${f.id}`) : null}
                    style={{
                      padding: '9px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: aktif ? 'pointer' : 'not-allowed',
                      border: `1px solid ${aktif ? C.primary : C.border}`,
                      background: aktif ? C.primary : 'transparent',
                      color: aktif ? C.gold : '#999',
                      opacity: aktif ? 1 : 0.5,
                      fontFamily: cinzel.style.fontFamily, letterSpacing: 0.5,
                    }}
                  >
                    {aktif ? 'Recetemi Gor' : 'Analiz Bekleniyor'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && forms.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 32, paddingBottom: 40 }}>
            <button onClick={() => router.push('/hasta/cilt')} style={{
              padding: '14px 32px', background: C.gold, border: 'none', borderRadius: 10,
              fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600,
              color: C.primary, cursor: 'pointer', letterSpacing: 1,
            }}>
              {"Yeni Cilt Analizi Baslat"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
