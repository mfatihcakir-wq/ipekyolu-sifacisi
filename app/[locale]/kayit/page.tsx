'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2', darkBg: '#0F2D1C',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', border: `1.5px solid ${C.border}`, borderRadius: 10,
  fontSize: 16, minHeight: 44, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', background: C.surface, color: C.dark,
}

export default function KayitPage() {
  const [adSoyad, setAdSoyad] = useState('')
  const [telefon, setTelefon] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [kvkk, setKvkk] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!kvkk) { setError('KVKK onayi gereklidir.'); return }
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: adSoyad, phone: telefon } },
      })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user && !data.session) {
        setError('Kayit basarili, e-posta onay linki gonderildi.')
        setLoading(false); return
      }

      // localStorage'daki form verisini kaydet
      const formStr = localStorage.getItem('ipekyolu_analiz_form')
      if (formStr && data.user) {
        try {
          const form = JSON.parse(formStr)
          await supabase.from('basic_forms').insert({
            user_id: data.user.id,
            yas_grubu: form.age_group,
            cinsiyet: form.gender,
            mevsim: form.season,
            kronik: form.chronic,
            sikayet: form.symptoms,
            uyku: form.exercise_habit,
            stres: form.mood_detail,
            kvkk_onay: form.kvkk,
          })
        } catch { /* form yoksa sessizce devam */ }
      }

      router.push('/odeme')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Baglanti hatasi')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: garamond.style.fontFamily }}>
      {/* SOL PANEL */}
      <div style={{
        width: '45%', background: C.primary, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: '60px 40px',
        position: 'relative' as const, overflow: 'hidden',
      }}
        className="kayit-sol-panel"
      >
        <div style={{ position: 'absolute' as const, inset: 0, background: `radial-gradient(circle at 70% 30%, ${C.darkBg} 0%, transparent 60%)`, opacity: 0.5 }} />
        <div style={{ position: 'relative' as const, zIndex: 1, textAlign: 'center', maxWidth: 360 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 24 }}>
            <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke={C.gold} strokeWidth="1.5"/>
            <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke={C.gold} strokeWidth="1.5"/>
            <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke={C.gold} strokeWidth="1.5"/>
            <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill={C.gold}/>
            <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
            <circle cx="26.5" cy="34" r="2" fill="#FF7043"/>
            <circle cx="37.5" cy="34" r="2" fill="#42A5F5"/>
            <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC"/>
          </svg>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 20, fontWeight: 600, letterSpacing: 3, marginBottom: 24 }}>
            IPEK YOLU SIFACISI
          </div>
          <div style={{ width: 40, height: 1, background: C.gold, margin: '0 auto 24px', opacity: 0.4 }} />
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 1.8 }}>
            &ldquo;Bin yillik bilgelik sizin icin burada.&rdquo;
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
            Klasik Islam Tibbi Danismanligi
          </p>
        </div>
      </div>

      {/* SAG FORM */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.cream, padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, color: C.primary, marginBottom: 4, fontWeight: 500 }}>
            Kayit Ol
          </h1>
          <p style={{ fontSize: 14, color: C.secondary, marginBottom: 20 }}>Hesabinizi olusturun</p>

          {/* Info banner */}
          <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#2E7D32', lineHeight: 1.5 }}>
            Form verileriniz kayit sonrasinda otomatik aktarilacak
          </div>

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, letterSpacing: 0.5 }}>AD SOYAD *</label>
              <input type="text" value={adSoyad} onChange={e => setAdSoyad(e.target.value)} required
                placeholder="Adiniz Soyadiniz" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, letterSpacing: 0.5 }}>TELEFON (WhatsApp)</label>
              <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)}
                placeholder="+90 555 000 0000" style={inputStyle} />
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Sonuclar WhatsApp uzerinden iletilecektir</div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, letterSpacing: 0.5 }}>E-POSTA *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="ornek@email.com" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, letterSpacing: 0.5 }}>SIFRE *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                minLength={6} placeholder="En az 6 karakter" style={inputStyle} />
            </div>

            {/* KVKK */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
              <input type="checkbox" checked={kvkk} onChange={e => setKvkk(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
              <label style={{ fontSize: 12, color: C.secondary, lineHeight: 1.6, cursor: 'pointer' }} onClick={() => setKvkk(!kvkk)}>
                Saglik verilerimin klasik Islam tibbi danismanligi amaciyla islenmesine KVKK kapsaminda onay veriyorum.
              </label>
            </div>

            {error && (
              <div style={{ background: error.includes('basarili') ? '#E8F5E9' : '#fef2f2', border: `1px solid ${error.includes('basarili') ? '#A5D6A7' : '#fecaca'}`, color: error.includes('basarili') ? '#2E7D32' : '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                background: C.gold, color: C.primary, fontFamily: cinzel.style.fontFamily,
                fontWeight: 600, fontSize: 15, letterSpacing: 1, minHeight: 44,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              }}>
              {loading ? 'Kayit yapiliyor...' : 'Kayit Ol ve Devam Et'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: C.secondary, marginTop: 24 }}>
            Zaten hesabiniz var mi?{' '}
            <Link href="/giris" style={{ color: C.gold, fontWeight: 600, textDecoration: 'none' }}>Giris Yap</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .kayit-sol-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
