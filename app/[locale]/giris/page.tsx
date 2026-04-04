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

export default function GirisPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sifreSifirla, setSifreSifirla] = useState(false)
  const [sifirlaEmail, setSifirlaEmail] = useState('')
  const [sifirlaMsg, setSifirlaMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/hasta')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Baglanti hatasi')
      setLoading(false)
    }
  }

  async function handleSifreSifirla() {
    if (!sifirlaEmail.trim()) { setSifirlaMsg('E-posta adresinizi girin.'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(sifirlaEmail, {
      redirectTo: 'https://ipekyolu-sifacisi.vercel.app/sifre-guncelle',
    })
    setSifirlaMsg(error ? 'Hata: ' + error.message : 'Sifre sifirlama baglantisi gonderildi.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: garamond.style.fontFamily }}>
      {/* SOL PANEL */}
      <div style={{
        width: '45%', background: C.primary, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: '60px 40px',
        position: 'relative' as const, overflow: 'hidden',
      }}
        className="giris-sol-panel"
      >
        <div style={{ position: 'absolute' as const, inset: 0, background: `radial-gradient(circle at 30% 70%, ${C.darkBg} 0%, transparent 60%)`, opacity: 0.5 }} />
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
            &ldquo;Bedeninizi tanimak sagliginizin temelidir.&rdquo;
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
            el-Kanun fi&apos;t-Tib, Kitab 1
          </p>
        </div>
      </div>

      {/* SAG FORM */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.cream, padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, color: C.primary, marginBottom: 4, fontWeight: 500 }}>
            Giris Yap
          </h1>
          <p style={{ fontSize: 14, color: C.secondary, marginBottom: 32 }}>Hesabiniza giris yapin</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, letterSpacing: 0.5 }}>E-POSTA</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="ornek@email.com" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, letterSpacing: 0.5 }}>SIFRE</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" style={inputStyle} />
            </div>

            <div style={{ textAlign: 'right' as const, marginBottom: 20 }}>
              <button type="button" onClick={() => setSifreSifirla(!sifreSifirla)}
                style={{ background: 'none', border: 'none', color: C.gold, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                Sifremi Unuttum
              </button>
            </div>

            {sifreSifirla && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <input type="email" value={sifirlaEmail} onChange={e => setSifirlaEmail(e.target.value)}
                  placeholder="E-posta adresiniz" style={{ ...inputStyle, marginBottom: 8 }} />
                {sifirlaMsg && (
                  <div style={{ fontSize: 12, color: sifirlaMsg.startsWith('Hata') ? '#C62828' : '#2E7D32', marginBottom: 8 }}>{sifirlaMsg}</div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={handleSifreSifirla}
                    style={{ flex: 1, padding: '10px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Gonder
                  </button>
                  <button type="button" onClick={() => { setSifreSifirla(false); setSifirlaMsg('') }}
                    style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.secondary, fontSize: 12, cursor: 'pointer' }}>
                    Iptal
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                background: C.primary, color: C.white, fontFamily: cinzel.style.fontFamily,
                fontWeight: 600, fontSize: 15, letterSpacing: 1, minHeight: 44,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              }}>
              {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: 14, color: C.secondary, marginBottom: 8 }}>
              Hesabiniz yok mu?{' '}
              <Link href="/kayit" style={{ color: C.gold, fontWeight: 600, textDecoration: 'none' }}>Kayit Ol</Link>
            </p>
            <p style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
              Form doldurmak icin giris gerekmez
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .giris-sol-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
