'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#8B6914', cream: '#FAF7F2',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#E8DFD4',
  white: '#FFFFFF', surface: '#FAF7F2',
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

            {/* ABONE DEGIL — Blur + Plan kartlari */}
            {!isAbone && (
              <div>
                {/* Bulanik analiz onizleme */}
                <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px', marginBottom: 20, position: 'relative' as const, overflow: 'hidden' }}>
                  <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary, marginBottom: 8 }}>MIZAC ANALIZI</div>
                    <div style={{ height: 20, background: '#FFE8E8', borderRadius: 4, marginBottom: 8, width: '70%' }} />
                    <div style={{ height: 14, background: C.surface, borderRadius: 4, marginBottom: 6, width: '100%' }} />
                    <div style={{ height: 14, background: C.surface, borderRadius: 4, marginBottom: 6, width: '85%' }} />
                    <div style={{ height: 14, background: C.surface, borderRadius: 4, width: '60%' }} />
                  </div>
                  <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
                      <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.primary, letterSpacing: 1 }}>Analiz Sonucu</div>
                      <div style={{ fontSize: 12, color: C.secondary }}>Üyelik ile goruntulenebilir</div>
                    </div>
                  </div>
                </div>

                {/* Plan kartlari */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
                  {[
                    { ad: 'Aylik', fiyat: '890', birim: '/ay' },
                    { ad: 'Yillik', fiyat: '590', birim: '/ay', popular: true },
                    { ad: 'Tek Seferlik', fiyat: '1.290', birim: '' },
                  ].map(p => (
                    <div key={p.ad} style={{ background: C.white, borderRadius: 10, padding: '16px', border: `1px solid ${p.popular ? C.gold : C.border}`, textAlign: 'center', position: 'relative' as const }}>
                      {p.popular && <div style={{ position: 'absolute' as const, top: -8, left: '50%', transform: 'translateX(-50%)', background: C.gold, color: C.primary, fontSize: 8, fontWeight: 600, padding: '2px 8px', borderRadius: 8, letterSpacing: 1 }}>POPULER</div>}
                      <div style={{ fontSize: 11, color: C.secondary, marginBottom: 4 }}>{p.ad}</div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: C.dark }}>{p.fiyat}{'\u20BA'}<span style={{ fontSize: 11, fontWeight: 400, color: C.secondary }}>{p.birim}</span></div>
                    </div>
                  ))}
                </div>

                <button onClick={() => router.push('/odeme')}
                  style={{ width: '100%', padding: 16, background: C.gold, border: 'none', borderRadius: 12, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.primary, letterSpacing: 1, cursor: 'pointer', marginBottom: 12 }}>
                  Uye Ol ve Sonucu Gor
                </button>
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
                    &ldquo;Beden, ancak mizaci bilindiginde tedavi edilebilir.&rdquo; — el-Kanun fi&apos;t-Tib
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
