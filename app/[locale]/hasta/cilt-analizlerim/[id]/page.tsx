'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#8B6914', cream: '#FAF7F2',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#E8DFD4',
  white: '#FFFFFF', surface: '#FAF7F2',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sonuc = Record<string, any>

export default function CiltRaporPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [sonuc, setSonuc] = useState<Sonuc | null>(null)
  const [loading, setLoading] = useState(true)
  const [sorunlar, setSorunlar] = useState<string[]>([])
  const [tarih, setTarih] = useState('')

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }
      const { data } = await supabase
        .from('cilt_forms')
        .select('sonuc_verisi, sorunlar, created_at, durum')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()
      if (!data || !data.sonuc_verisi) { router.push('/hasta/cilt-analizlerim'); return }
      setSonuc(data.sonuc_verisi)
      setSorunlar(data.sorunlar || [])
      setTarih(new Date(data.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }))
      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  if (loading) {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!sonuc) return null

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/hasta/cilt-analizlerim')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, letterSpacing: 2 }}>CILT RAPORU</div>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, marginBottom: 4 }}>Cilt Analiz Raporu</h1>
          <p style={{ fontSize: 13, color: C.secondary }}>{tarih} · {sorunlar.join(', ')}</p>
        </div>

        {/* OZET */}
        {sonuc.sorun_ozeti && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 8 }}>DEGERLENDIRME</div>
            <p style={{ fontSize: 14, color: C.dark, lineHeight: 1.7 }}>{sonuc.sorun_ozeti}</p>
          </div>
        )}

        {/* HILT BAGLANTISI */}
        {sonuc.hilt_baglantisi && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 8 }}>HILT BAGLANTISI</div>
            <p style={{ fontSize: 14, color: C.dark, lineHeight: 1.7 }}>{sonuc.hilt_baglantisi}</p>
          </div>
        )}

        {/* TOPIKAL RECETE */}
        {sonuc.topikal_recete?.length > 0 && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>TOPIKAL PROTOKOL</div>
            {sonuc.topikal_recete.map((r: Sonuc, i: number) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < sonuc.topikal_recete.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.primary }}>{r.urun || r.ad}</div>
                {r.icerik && <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{r.icerik}</div>}
                {r.uygulama && <div style={{ fontSize: 12, color: C.dark, marginTop: 4 }}>{r.uygulama}</div>}
                {r.kaynak && <div style={{ fontSize: 10, color: '#888', fontStyle: 'italic', marginTop: 2 }}>{r.kaynak}</div>}
              </div>
            ))}
          </div>
        )}

        {/* GUNLUK RUTIN */}
        {sonuc.gunluk_rutin && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 8 }}>GUNLUK BAKIM RUTINI</div>
            {typeof sonuc.gunluk_rutin === 'string' ? (
              <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{sonuc.gunluk_rutin}</p>
            ) : (
              Object.entries(sonuc.gunluk_rutin).map(([k, v]) => (
                <div key={k} style={{ fontSize: 13, color: C.dark, padding: '4px 0' }}><strong>{k}:</strong> {String(v)}</div>
              ))
            )}
          </div>
        )}

        {/* BESLENME */}
        {sonuc.beslenme_onerileri && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 8 }}>BESLENME ONERILERI</div>
            <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.7 }}>{typeof sonuc.beslenme_onerileri === 'string' ? sonuc.beslenme_onerileri : JSON.stringify(sonuc.beslenme_onerileri)}</p>
          </div>
        )}

        {/* UYARILAR */}
        {sonuc.ozel_uyarilar?.length > 0 && (
          <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>UYARILAR</div>
            {sonuc.ozel_uyarilar.map((u: string, i: number) => (
              <div key={i} style={{ fontSize: 12, color: C.secondary, lineHeight: 1.5 }}>{'\u26A0'} {u}</div>
            ))}
          </div>
        )}

        {/* BUTONLAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
          <a href={`https://wa.me/905331687226?text=${encodeURIComponent('Merhaba, cilt analizim hakkinda bilgi almak istiyorum.')}`}
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: 'white', borderRadius: 10, padding: 13, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily }}>
            WhatsApp
          </a>
          <button onClick={() => window.print()}
            style={{ background: 'transparent', border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: 13, fontSize: 13, fontWeight: 600, color: C.primary, cursor: 'pointer', fontFamily: cinzel.style.fontFamily }}>
            PDF Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
