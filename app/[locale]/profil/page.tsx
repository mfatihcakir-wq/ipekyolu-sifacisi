'use client'

import { useEffect, useState } from 'react'
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

const MIZAC_ETIKET: Record<string, { label: string; renk: string }> = {
  demevi: { label: 'Demevi (Sıcak-Nemli)', renk: '#EF5350' },
  safravi: { label: 'Safravi (Sıcak-Kuru)', renk: '#FF9800' },
  balgami: { label: 'Balgami (Soğuk-Nemli)', renk: '#42A5F5' },
  sevdavi: { label: 'Sevdavi (Soğuk-Kuru)', renk: '#AB47BC' },
  belirlenmedi: { label: 'Henüz Belirlenmedi', renk: '#999' },
}

interface Profil {
  ad?: string | null
  soyad?: string | null
  telefon?: string | null
  fitri_mizac?: string | null
  last_analysis_at?: string | null
  last_karakter_at?: string | null
  last_cilt_at?: string | null
}

interface AnalizOzet {
  id: string
  created_at: string
  durum: string
  tum_form_verisi: Record<string, string> | null
}

function kalanGunHesapla(isoTarih: string | null | undefined): number {
  if (!isoTarih) return 0
  const son = new Date(isoTarih).getTime()
  const gecen = (Date.now() - son) / (1000 * 60 * 60 * 24)
  const kalan = Math.ceil(7 - gecen)
  return kalan > 0 ? kalan : 0
}

function tarihFormat(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ProfilPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [uyelikTarihi, setUyelikTarihi] = useState('')
  const [profil, setProfil] = useState<Profil>({})
  const [analizler, setAnalizler] = useState<AnalizOzet[]>([])

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }

      setEmail(user.email || '')
      if (user.created_at) setUyelikTarihi(user.created_at)

      const { data: p } = await supabase
        .from('profiles')
        .select('ad, soyad, telefon, fitri_mizac, last_analysis_at, last_karakter_at, last_cilt_at')
        .eq('id', user.id)
        .single()
      if (p) setProfil(p as Profil)

      const { data: forms } = await supabase
        .from('detailed_forms')
        .select('id, created_at, durum, tum_form_verisi')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setAnalizler((forms || []) as AnalizOzet[])

      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const mizacKey = profil.fitri_mizac || 'belirlenmedi'
  const mizacBilgi = MIZAC_ETIKET[mizacKey] || MIZAC_ETIKET.belirlenmedi
  const kalanGun = kalanGunHesapla(profil.last_analysis_at)
  const tamAd = [profil.ad, profil.soyad].filter(Boolean).join(' ') || 'İsimsiz Kullanıcı'

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/hasta')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, letterSpacing: 2 }}>PROFİLİM</div>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>

        {/* PROFIL KARTI */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: C.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.gold, fontFamily: cinzel.style.fontFamily, fontSize: 22, fontWeight: 600, flexShrink: 0,
            }}>
              {(profil.ad?.[0] || email[0] || '?').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: C.primary, fontWeight: 500 }}>{tamAd}</div>
              <div style={{ fontSize: 13, color: C.secondary, overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
            <div>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.secondary, letterSpacing: 2, marginBottom: 4 }}>TELEFON</div>
              <div style={{ fontSize: 14, color: C.dark }}>{profil.telefon || '—'}</div>
            </div>
            <div>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.secondary, letterSpacing: 2, marginBottom: 4 }}>ÜYELİK</div>
              <div style={{ fontSize: 14, color: C.dark }}>{tarihFormat(uyelikTarihi)}</div>
            </div>
          </div>
        </div>

        {/* MIZAC KARTI */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16, borderTop: `3px solid ${mizacBilgi.renk}` }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 10 }}>FITRİ MİZAÇ</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: mizacBilgi.renk }} />
            <div style={{ fontSize: 16, color: C.dark, fontWeight: 500 }}>{mizacBilgi.label}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, paddingTop: 12, borderTop: `1px solid ${C.surface}` }}>
            <div>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.secondary, letterSpacing: 2, marginBottom: 4 }}>SON ANALİZ</div>
              <div style={{ fontSize: 13, color: C.dark }}>{tarihFormat(profil.last_analysis_at)}</div>
            </div>
            <div>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.secondary, letterSpacing: 2, marginBottom: 4 }}>HAFTALIK LİMİT</div>
              <div style={{ fontSize: 13, color: kalanGun > 0 ? '#C62828' : C.primary, fontWeight: 500 }}>
                {kalanGun > 0 ? `${kalanGun} gün kaldı` : 'Analiz yapabilirsiniz'}
              </div>
            </div>
          </div>

          {kalanGun > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: C.secondary, fontStyle: 'italic' }}>
              Klasik tıp geleneğinde mizaç değişimi zaman alır; haftada bir analizle süreci doğru takip edebilirsiniz.
            </div>
          )}
        </div>

        {/* SON ANALIZLER */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2 }}>SON ANALİZLER</div>
            <a href="/hasta" style={{ fontSize: 11, color: C.gold, textDecoration: 'none', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>TÜMÜ {'\u2192'}</a>
          </div>

          {analizler.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 13, color: C.secondary, marginBottom: 12 }}>Henüz analiz yok.</p>
              <button onClick={() => router.push('/analiz')}
                style={{ padding: '10px 22px', background: C.primary, color: C.gold, border: 'none', borderRadius: 8, fontFamily: cinzel.style.fontFamily, fontSize: 11, cursor: 'pointer', letterSpacing: 1, fontWeight: 600 }}>
                İlk Analizini Yap
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {analizler.map(a => {
                const form = a.tum_form_verisi || {}
                const tarih = new Date(a.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                const sikayet = form.symptoms ? (form.symptoms.length > 60 ? form.symptoms.slice(0, 60) + '...' : form.symptoms) : 'Şikâyet belirtilmemiş'
                return (
                  <div key={a.id} style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.surface}`, background: C.surface }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' as const }}>
                      <span style={{ fontSize: 12, color: C.secondary, fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>{tarih}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 10,
                        background: (a.durum === 'tamamlandi' || a.durum === 'onaylandi') ? '#E8F5E9' : a.durum === 'bekliyor' ? '#FFF8E7' : C.white,
                        color: (a.durum === 'tamamlandi' || a.durum === 'onaylandi') ? '#2E7D32' : a.durum === 'bekliyor' ? '#E65100' : C.secondary,
                      }}>
                        {a.durum === 'onaylandi' ? 'Onaylandı' : a.durum === 'tamamlandi' ? 'Tamamlandı' : a.durum === 'bekliyor' ? 'Bekliyor' : a.durum}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: C.dark }}>{sikayet}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AYARLAR LINK */}
        <a href="/hasta/ayarlar"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
            padding: '16px 24px', marginBottom: 16, textDecoration: 'none',
          }}>
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 2 }}>AYARLAR</div>
            <div style={{ fontSize: 12, color: C.secondary }}>Fıtrî mizaç, bildirimler, şifre</div>
          </div>
          <span style={{ color: C.gold, fontSize: 18 }}>{'\u2192'}</span>
        </a>
      </div>
    </div>
  )
}
