'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#DEB887',
  white: '#FFFFFF', surface: '#FAF6EF',
}

export default function SonucPage() {
  const router = useRouter()
  const [durum, setDurum] = useState<'yukleniyor' | 'gonderildi' | 'hata'>('yukleniyor')
  const [telefon, setTelefon] = useState('')
  const [ad, setAd] = useState('')
  const [kayitNo, setKayitNo] = useState('')
  const [isAbone, setIsAbone] = useState(false)
  const [kopyalandi, setKopyalandi] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function formGonder() {
      try {
        const formStr = localStorage.getItem('ipekyolu_analiz_form')
        if (!formStr) { router.push('/analiz'); return }
        const form = JSON.parse(formStr)

        setTelefon(form.telefon || '')
        setAd(form.ad_soyad || '')

        const { data: { user } } = await supabase.auth.getUser()

        // Abonelik kontrol
        if (user) {
          const { data: abonelik } = await supabase
            .from('abonelikler')
            .select('durum')
            .eq('kullanici_id', user.id)
            .eq('durum', 'aktif')
            .single()
          setIsAbone(!!abonelik)
        }

        const { data, error } = await supabase
          .from('basic_forms')
          .insert({
            user_id: user?.id || null,
            yas_grubu: form.age_group,
            cinsiyet: form.gender,
            mevsim: form.season,
            kronik: form.chronic,
            sikayet: form.symptoms,
            uyku: form.exercise_habit,
            stres: form.mood_detail,
            tahmin_mizac: null,
            kvkk_onay: form.kvkk,
          })
          .select()
          .single()

        if (error) throw error

        await supabase
          .from('detailed_forms')
          .insert({
            user_id: user?.id || null,
            basic_form_id: data?.id || null,
            telefon: form.telefon,
            tam_ad: form.ad_soyad,
            tum_form_verisi: form,
            durum: 'bekliyor',
          })

        const no = 'IYS-' + new Date().getFullYear().toString().slice(2) +
          String(new Date().getMonth()+1).padStart(2,'0') +
          String(new Date().getDate()).padStart(2,'0') + '-' +
          String(new Date().getHours()).padStart(2,'0') +
          String(new Date().getMinutes()).padStart(2,'0')
        setKayitNo(no)

        localStorage.removeItem('ipekyolu_analiz_form')
        setDurum('gonderildi')
      } catch (err) {
        console.error(err)
        setDurum('hata')
      }
    }
    formGonder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function kopyala() {
    navigator.clipboard.writeText(kayitNo)
    setKopyalandi(true)
    setTimeout(() => setKopyalandi(false), 2000)
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
        {/* YUKLENIYOR */}
        {durum === 'yukleniyor' && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 48, height: 48, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px auto' }} />
            <p style={{ fontFamily: cinzel.style.fontFamily, color: C.primary, fontSize: 16, letterSpacing: 2 }}>Formunuz Iletiliyor...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* GONDERILDI */}
        {durum === 'gonderildi' && (
          <div>
            {/* Basari kart */}
            <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '48px 40px', textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, fontWeight: 500, color: C.primary, marginBottom: 12, letterSpacing: 1 }}>
                Formunuz Danismana Iletildi
              </h1>
              <p style={{ fontSize: 16, color: C.secondary, fontStyle: 'italic', lineHeight: 1.7, marginBottom: 24 }}>
                {ad ? `${ad}, f` : 'F'}ormunuz alindi. Danismaniniz 24-48 saat icinde WhatsApp uzerinden size ulasacaktir.
              </p>

              {/* Kayit no + kopyala */}
              {kayitNo && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 20px', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#999', letterSpacing: 1, marginBottom: 4 }}>KAYIT NUMARASI</div>
                    <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.primary, fontWeight: 600, letterSpacing: 3 }}>{kayitNo}</div>
                  </div>
                  <button onClick={kopyala}
                    style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 11, color: C.secondary }}>
                    {kopyalandi ? 'Kopyalandi' : 'Kopyala'}
                  </button>
                </div>
              )}

              {telefon && (
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: '#2E7D32', fontWeight: 600, marginBottom: 4 }}>WhatsApp bildirim numaraniz</div>
                  <div style={{ fontSize: 16, color: '#1B5E20', fontWeight: 600 }}>{telefon}</div>
                </div>
              )}
            </div>

            {/* ANALİZ İLETİLDİ BİLDİRİMİ */}
            {!isAbone && (
              <div>
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: '#1B4332', marginBottom: 6, letterSpacing: 0.5 }}>{"Analiziniz Alındı"}</div>
                      <p style={{ fontSize: 14, color: '#1B4332', lineHeight: 1.7, margin: 0 }}>
                        {"Analiziniz danışmanınıza iletildi. 24-48 saat içinde WhatsApp üzerinden protokolünüz ve ücretlendirme bilgisi iletilecektir."}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                  <a href="https://wa.me/905331687226" target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, minWidth: 200, padding: '14px 20px', background: '#25D366', border: 'none', borderRadius: 12, fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: 1, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' as const }}>
                    {"DANIŞMANA SOR →"}
                  </a>
                  <button onClick={() => router.push('/')}
                    style={{ flex: 1, minWidth: 200, padding: '14px 20px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 12, fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, color: C.primary, letterSpacing: 1, cursor: 'pointer' }}>
                    {"ANA SAYFA"}
                  </button>
                </div>
              </div>
            )}

            {/* ABONE — Tam icerik */}
            {isAbone && (
              <div>
                <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 16 }}>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>SONRAKI ADIMLAR</div>
                  {[
                    'Danismaniniz formunuzu klasik Islam tibbi kaynaklari ile analiz eder.',
                    'Mizac tipiniz, hilt dengeniz ve etkilenen organlar belirlenir.',
                    'Size ozel bitkisel protokol hazirlanir.',
                    'WhatsApp uzerinden sonuclariniz ve onerileriniz iletilir.',
                  ].map((text, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, background: C.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.gold, fontWeight: 600 }}>{i + 1}</div>
                      <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6, margin: 0, paddingTop: 3 }}>{text}</p>
                    </div>
                  ))}
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: C.secondary, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                    &ldquo;Beden, ancak mizaci bilindiginde tedavi edilebilir.&rdquo; — el-Kânûn fi&apos;t-Tib
                  </p>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <a href="https://wa.me/905331687226"
                target="_blank"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: 'white', borderRadius: 10, padding: 13, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily }}>
                {"💬 Danismana Sor"}
              </a>
              <button onClick={() => router.push('/')}
                style={{ background: 'transparent', border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: 13, fontSize: 13, fontWeight: 600, color: C.primary, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
                Ana Sayfa
              </button>
            </div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{"Soru sormak veya geri bildirim vermek icin"}</div>
          </div>
        )}

        {/* HATA */}
        {durum === 'hata' && (
          <div style={{ background: C.white, borderRadius: 20, border: '1px solid #FFCDD2', padding: '48px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>!</div>
            <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: '#C62828', marginBottom: 12 }}>Bir Sorun Olustu</h2>
            <p style={{ fontSize: 14, color: C.secondary, marginBottom: 24, lineHeight: 1.6 }}>{"Formunuz kaydedilemedi. Lutfen tekrar deneyin veya danismana ulasin."}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => router.push('/analiz')}
                style={{ background: C.primary, color: 'white', border: 'none', borderRadius: 10, padding: 12, fontSize: 13, cursor: 'pointer', fontFamily: cinzel.style.fontFamily }}>
                Tekrar Dene
              </button>
              <a href="https://wa.me/905331687226" target="_blank"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: 'white', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                {"💬 Danismana Sor"}
              </a>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
