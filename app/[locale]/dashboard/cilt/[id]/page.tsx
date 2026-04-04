'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormData = Record<string, any>

export default function DashboardCiltPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [form, setForm] = useState<FormData | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sonuc, setSonuc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analizYukleniyor, setAnalizYukleniyor] = useState(false)
  const [onayYukleniyor, setOnayYukleniyor] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    async function yukle() {
      const { data } = await supabase
        .from('cilt_forms')
        .select('*')
        .eq('id', params.id)
        .single()
      if (!data) { router.push('/dashboard'); return }
      setForm(data)
      if (data.sonuc_verisi) setSonuc(data.sonuc_verisi)
      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function analizYap() {
    if (!form) return
    setAnalizYukleniyor(true)
    try {
      const res = await fetch('/api/cilt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setToast('Hata: ' + data.error); setAnalizYukleniyor(false); return }
      setSonuc(data)
      await supabase.from('cilt_forms').update({ sonuc_verisi: data, durum: 'analiz_edildi' }).eq('id', params.id)
      setToast('Analiz tamamlandi')
    } catch {
      setToast('Analiz sirasinda hata olustu')
    }
    setAnalizYukleniyor(false)
  }

  async function onaylaVeGonder() {
    setOnayYukleniyor(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('cilt_forms').update({
        durum: 'onaylandi',
        onaylayan_id: user?.id,
        onay_tarihi: new Date().toISOString(),
      }).eq('id', params.id)
      setToast('Onaylandi ve gonderildi')
      if (form) setForm({ ...form, durum: 'onaylandi' })
    } catch {
      setToast('Onay sirasinda hata olustu')
    }
    setOnayYukleniyor(false)
  }

  if (loading) {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!form) return null

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, letterSpacing: 2 }}>CILT ANALIZI — ADMIN</div>
        </div>
        <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: form.durum === 'onaylandi' ? '#E8F5E9' : '#FFF8E7', color: form.durum === 'onaylandi' ? '#2E7D32' : '#E65100', fontWeight: 600 }}>
          {form.durum}
        </span>
      </header>

      {toast && (
        <div style={{ position: 'fixed' as const, top: 20, right: 20, zIndex: 9999, background: toast.includes('Hata') ? '#FCEBEB' : '#EAF3DE', border: '1px solid', borderColor: toast.includes('Hata') ? '#F7C1C1' : '#C0DD97', color: toast.includes('Hata') ? '#A32D2D' : '#3B6D11', padding: '12px 20px', borderRadius: 10, fontSize: 13 }}>
          {toast}
          <button onClick={() => setToast('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>{'\u2715'}</button>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: sonuc ? '1fr 1fr' : '1fr', gap: 20 }}>
          {/* SOL: FORM VERISI */}
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>FORM VERISI</div>
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
              {[
                ['Tarih', new Date(form.created_at).toLocaleDateString('tr-TR')],
                ['Yas Grubu', form.yas_grubu],
                ['Cinsiyet', form.cinsiyet],
                ['Cilt Tipi', form.cilt_tipi],
                ['Ten Rengi', form.cilt_rengi],
                ['Hassasiyet', form.hassasiyet],
                ['Sorunlar', form.sorunlar?.join(', ')],
                ['Sorun Suresi', form.sorun_suresi],
                ['Bolgeler', form.sorun_bolge?.join(', ')],
                ['Gunes', form.gunes_maruziyeti],
                ['Su', form.su_tuketimi],
                ['Stres', form.stres_seviyesi],
                ['Uyku', form.uyku_duzeni],
                ['Mevcut Urunler', form.mevcut_urunler],
                ['Alerjiler', form.alerjiler],
                ['Kronik', form.kronik_hastalik],
                ['Hamilelik', form.hamilelik],
                ['Notlar', form.ek_notlar],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.surface}`, fontSize: 13 }}>
                  <span style={{ color: C.secondary, fontWeight: 500 }}>{k}</span>
                  <span style={{ color: C.dark, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                </div>
              ))}
            </div>

            {!sonuc && (
              <button onClick={analizYap} disabled={analizYukleniyor}
                style={{ width: '100%', padding: 16, background: analizYukleniyor ? '#999' : C.primary, border: 'none', borderRadius: 12, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.gold, letterSpacing: 1, cursor: analizYukleniyor ? 'not-allowed' : 'pointer', marginTop: 16 }}>
                {analizYukleniyor ? 'Analiz Yapiliyor...' : 'Cilt Analizi Yap'}
              </button>
            )}
          </div>

          {/* SAG: SONUC */}
          {sonuc && (
            <div>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>ANALIZ SONUCU</div>
              <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
                {sonuc.sorun_ozeti && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1, marginBottom: 4 }}>OZET</div>
                    <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.7 }}>{sonuc.sorun_ozeti}</p>
                  </div>
                )}
                {sonuc.hilt_baglantisi && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1, marginBottom: 4 }}>HILT BAGLANTISI</div>
                    <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.7 }}>{sonuc.hilt_baglantisi}</p>
                  </div>
                )}
                {sonuc.topikal_recete?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1, marginBottom: 8 }}>TOPIKAL PROTOKOL</div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {sonuc.topikal_recete.map((r: any, i: number) => (
                      <div key={i} style={{ fontSize: 12, padding: '6px 0', borderBottom: `1px solid ${C.surface}` }}>
                        <strong>{r.urun || r.ad}</strong> — {r.uygulama || r.doz}
                        {r.kaynak && <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{r.kaynak}</div>}
                      </div>
                    ))}
                  </div>
                )}
                {sonuc.gunluk_rutin && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1, marginBottom: 4 }}>GUNLUK RUTIN</div>
                    <p style={{ fontSize: 12, color: C.dark, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{typeof sonuc.gunluk_rutin === 'string' ? sonuc.gunluk_rutin : JSON.stringify(sonuc.gunluk_rutin, null, 2)}</p>
                  </div>
                )}
              </div>

              {form.durum !== 'onaylandi' && (
                <button onClick={onaylaVeGonder} disabled={onayYukleniyor}
                  style={{ width: '100%', padding: 16, background: onayYukleniyor ? '#999' : C.gold, border: 'none', borderRadius: 12, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.primary, letterSpacing: 1, cursor: onayYukleniyor ? 'not-allowed' : 'pointer' }}>
                  {onayYukleniyor ? 'Gonderiliyor...' : 'Onayla ve Gonder'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
