'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function HastaAnalizDetayPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analiz, setAnaliz] = useState<any>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState('')

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }

      const { data, error } = await supabase
        .from('detailed_forms')
        .select('id, tam_ad, durum, analiz_sonucu, onay_tarihi, tum_form_verisi')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) { setHata('Analiz bulunamadı'); setYukleniyor(false); return }
      if ((data.durum !== 'onaylandi' && data.durum !== 'tamamlandi') || !data.analiz_sonucu) {
        setHata('Bu analiz henüz onaylanmamış')
        setYukleniyor(false)
        return
      }
      setAnaliz(data.analiz_sonucu)
      setYukleniyor(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  if (yukleniyor) {
    return <main style={{ background: '#FAF6EF', minHeight: '100vh', padding: 80, textAlign: 'center', color: '#5C4A2A' }}>{"Yükleniyor..."}</main>
  }
  if (hata) {
    return (
      <main style={{ background: '#FAF6EF', minHeight: '100vh', padding: 80, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, color: '#1C3A26', marginBottom: 12 }}>{hata}</div>
        <a href="/hasta" style={{ color: '#B8860B', textDecoration: 'none', fontFamily: 'Cormorant Garamond,serif', fontSize: 12, letterSpacing: 1.5 }}>{"← HASTA PANELİ"}</a>
      </main>
    )
  }

  return (
    <main style={{ background: '#FAF6EF', minHeight: '100vh', padding: '60px clamp(20px,5vw,80px)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <a href="/hasta" style={{ display: 'inline-block', fontFamily: 'Cormorant Garamond,serif', fontSize: 11, color: '#B8860B', letterSpacing: 2, textDecoration: 'none', marginBottom: 24 }}>
          {"← HASTA PANELİ"}
        </a>

        <div style={{ background: 'white', border: '1px solid #DEB887', borderRadius: 16, padding: '36px 40px' }}>
          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 10, letterSpacing: 3, color: '#B8860B', marginBottom: 8 }}>{"ANALİZ SONUCU"}</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 28, color: '#1A1208', marginBottom: 8 }}>{analiz.mizac || 'Mizaç Belirlenmedi'}</h1>
          {analiz.ozet && (
            <p style={{ fontSize: 16, color: '#5C4A2A', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 24, paddingLeft: 16, borderLeft: '3px solid #B8860B' }}>{analiz.ozet}</p>
          )}

          {analiz.fitri_hali && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 16, color: '#B8860B', letterSpacing: 1.5, marginBottom: 10 }}>{"FITRÎ–HÂLÎ KARŞILAŞTIRMASI"}</h2>
              <div style={{ fontSize: 14, color: '#5C4A2A', lineHeight: 1.75 }}>
                {analiz.fitri_hali.fitri_mizac && <div><strong>Fıtrî mizaç:</strong> {analiz.fitri_hali.fitri_mizac}</div>}
                {analiz.fitri_hali.hali_mizac && <div><strong>Hâlî mizaç:</strong> {analiz.fitri_hali.hali_mizac}</div>}
                {analiz.fitri_hali.sapma && <div><strong>Sapma:</strong> {analiz.fitri_hali.sapma}</div>}
                {analiz.fitri_hali.tedavi_hedefi && <div><strong>Hedef:</strong> {analiz.fitri_hali.tedavi_hedefi}</div>}
              </div>
            </section>
          )}

          {analiz.klinik_gozlemler && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 16, color: '#B8860B', letterSpacing: 1.5, marginBottom: 10 }}>{"KLİNİK GÖZLEMLER"}</h2>
              <div style={{ fontSize: 14, color: '#5C4A2A', lineHeight: 1.8, whiteSpace: 'pre-wrap' as const }}>
                {Array.isArray(analiz.klinik_gozlemler) ? analiz.klinik_gozlemler.join('\n\n') : analiz.klinik_gozlemler}
              </div>
            </section>
          )}

          {Array.isArray(analiz.bitki_recetesi) && analiz.bitki_recetesi.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 16, color: '#B8860B', letterSpacing: 1.5, marginBottom: 10 }}>{"BİTKİSEL PROTOKOL"}</h2>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {analiz.bitki_recetesi.map((b: any, i: number) => (
                <div key={i} style={{ background: '#FAF6EF', border: '1px solid #DEB887', borderRadius: 10, padding: '14px 18px', marginBottom: 10 }}>
                  <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 15, fontWeight: 600, color: '#1C3A26' }}>{b.bitki}</div>
                  {b.bitki_ar && <div style={{ fontFamily: 'serif', fontSize: 13, color: '#B8860B', direction: 'rtl' as const }}>{b.bitki_ar}</div>}
                  {b.doz && <div style={{ fontSize: 13, color: '#5C4A2A', marginTop: 6 }}><strong>Doz:</strong> {b.doz} · <strong>Zaman:</strong> {b.zaman} · <strong>Süre:</strong> {b.sure}</div>}
                  {b.etki && <div style={{ fontSize: 13, color: '#5C4A2A', marginTop: 4, fontStyle: 'italic' }}>{b.etki}</div>}
                  {b.kaynak && <div style={{ fontSize: 11, color: '#9B8060', marginTop: 6 }}>{b.kaynak}</div>}
                </div>
              ))}
            </section>
          )}

          {analiz.beslenme_recetesi && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 16, color: '#B8860B', letterSpacing: 1.5, marginBottom: 10 }}>{"BESLENME"}</h2>
              <div style={{ fontSize: 14, color: '#5C4A2A', lineHeight: 1.75 }}>
                {typeof analiz.beslenme_recetesi === 'string' ? analiz.beslenme_recetesi : JSON.stringify(analiz.beslenme_recetesi, null, 2)}
              </div>
            </section>
          )}

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #DEB887', textAlign: 'center' as const }}>
            <a href="https://wa.me/905331687226" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '12px 28px', background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: 10, fontFamily: 'Cormorant Garamond,serif', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
              {"DANIŞMANA SOR →"}
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
