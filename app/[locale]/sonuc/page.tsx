'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332',
  gold: '#C9A84C',
  cream: '#F5EFE6',
  dark: '#1C1C1C',
  secondary: '#5C4A2A',
  border: '#E0D5C5',
  white: '#FFFFFF',
  surface: '#FAF7F2',
}

export default function SonucPage() {
  const router = useRouter()
  const [durum, setDurum] = useState<'yukleniyor' | 'gonderildi' | 'hata'>('yukleniyor')
  const [telefon, setTelefon] = useState('')
  const [ad, setAd] = useState('')
  const [kayitNo, setKayitNo] = useState('')
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

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#C9A84C"/>
            <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
            <circle cx="26.5" cy="34" r="2" fill="#FF7043"/>
            <circle cx="37.5" cy="34" r="2" fill="#42A5F5"/>
            <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC"/>
          </svg>
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, fontWeight: 600, letterSpacing: 3 }}>İPEK YOLU ŞİFACISI</div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>

        {durum === 'yukleniyor' && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 48, height: 48, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px auto' }} />
            <p style={{ fontFamily: cinzel.style.fontFamily, color: C.primary, fontSize: 16, letterSpacing: 2 }}>Formunuz İletiliyor...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {durum === 'gonderildi' && (
          <div>
            <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '48px 40px', textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, fontWeight: 500, color: C.primary, marginBottom: 12, letterSpacing: 1 }}>
                Formunuz Danışmana İletildi
              </h1>
              <p style={{ fontSize: 16, color: C.secondary, fontStyle: 'italic', lineHeight: 1.7, marginBottom: 24 }}>
                {ad ? `${ad}, f` : 'F'}ormunuz alındı. Danışmanınız inceleyip 24-48 saat içinde WhatsApp üzerinden size ulaşacaktır.
              </p>

              {kayitNo && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 20px', marginBottom: 24, display: 'inline-block' }}>
                  <div style={{ fontSize: 11, color: '#999', letterSpacing: 1, marginBottom: 4 }}>KAYIT NUMARASI</div>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.primary, fontWeight: 600, letterSpacing: 3 }}>{kayitNo}</div>
                </div>
              )}

              {telefon && (
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: '#2E7D32', fontWeight: 600, marginBottom: 4 }}>WhatsApp bildirim numaranız</div>
                  <div style={{ fontSize: 16, color: '#1B5E20', fontWeight: 600 }}>{telefon}</div>
                </div>
              )}

              <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', lineHeight: 1.6 }}>
                Kayıt numaranızı saklayın. Danışmanınızla iletişimde referans olarak kullanabilirsiniz.
              </p>
            </div>

            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 16 }}>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>SONRAKI ADIMLAR</div>
              {[
                { num: '1', text: 'Danışmanınız formunuzu klasik İslam tıbbı kaynakları ile analiz eder.' },
                { num: '2', text: 'Mizaç tipiniz, hılt dengeniz ve etkilenen organlar belirlenir.' },
                { num: '3', text: 'Size özel bitkisel protokol hazırlanır.' },
                { num: '4', text: 'WhatsApp üzerinden sonuçlarınız ve önerileriniz iletilir.' },
              ].map(item => (
                <div key={item.num} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, background: C.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.gold, fontWeight: 600 }}>{item.num}</div>
                  <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6, margin: 0, paddingTop: 3 }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <a href={`https://wa.me/905331687226?text=${encodeURIComponent(`Merhaba, ${kayitNo} numaralı analiz formumu gönderdim. İletişime geçmek istedim.`)}`}
                target="_blank"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: 'white', borderRadius: 10, padding: '13px', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.136.563 4.14 1.544 5.877L.057 23.943l6.25-1.508A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.01-1.375l-.36-.213-3.712.896.934-3.613-.234-.372A9.774 9.774 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182c5.434 0 9.818 4.383 9.818 9.818 0 5.434-4.384 9.818-9.818 9.818z"/></svg>
                WhatsApp
              </a>
              <button onClick={() => router.push('/')}
                style={{ background: 'transparent', border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: '13px', fontSize: 13, fontWeight: 600, color: C.primary, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
                Ana Sayfa
              </button>
            </div>
          </div>
        )}

        {durum === 'hata' && (
          <div style={{ background: C.white, borderRadius: 20, border: '1px solid #FFCDD2', padding: '48px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: '#C62828', marginBottom: 12 }}>Bir Sorun Oluştu</h2>
            <p style={{ fontSize: 14, color: C.secondary, marginBottom: 24, lineHeight: 1.6 }}>Formunuz kaydedilemedi. Lütfen tekrar deneyin veya doğrudan WhatsApp üzerinden ulaşın.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => router.push('/analiz')}
                style={{ background: C.primary, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 13, cursor: 'pointer', fontFamily: cinzel.style.fontFamily }}>
                Tekrar Dene
              </button>
              <a href="https://wa.me/905331687226" target="_blank"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: 'white', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                WhatsApp
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
