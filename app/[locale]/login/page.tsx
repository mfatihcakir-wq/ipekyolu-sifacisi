'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

export default function LoginPage() {
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
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası oluştu')
      setLoading(false)
    }
  }

  async function handleSifreSifirla() {
    if (!sifirlaEmail.trim()) { setSifirlaMsg('E-posta adresinizi girin.'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(sifirlaEmail, {
      redirectTo: 'https://ipekyolu-sifacisi.vercel.app/sifre-guncelle',
    })
    if (error) { setSifirlaMsg('Hata: ' + error.message) }
    else { setSifirlaMsg('Sifre sifirlama baglantisi e-postaniza gonderildi.') }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#F5EFE6', fontFamily: garamond.style.fontFamily,
    }}>
      <Header />
      <div style={{
        width: '100%', maxWidth: 420, padding: 40,
        backgroundColor: '#fff', borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 12px auto', display: 'block' }}>
            <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
            <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
            <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
            <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#8B6914"/>
            <path d="M32 38 Q28.5 42 32 45.5 Q35.5 42 32 38Z" fill="#8B6914" opacity="0.8"/>
            <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
            <circle cx="26.5" cy="34" r="2" fill="#FF7043"/>
            <circle cx="37.5" cy="34" r="2" fill="#42A5F5"/>
            <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC"/>
          </svg>
          <h1 style={{
            fontFamily: cinzel.style.fontFamily, fontSize: 22, fontWeight: 600,
            color: '#1B4332', margin: '0 0 4px 0', letterSpacing: 2,
          }}>
            İpek Yolu Şifacısı
          </h1>
          <p style={{ color: '#5C4A2A', fontSize: 14, margin: 0 }}>Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#5C4A2A', marginBottom: 6 }}>E-posta</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="ornek@email.com"
              style={{
                width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: 10,
                fontSize: 15, outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1B4332')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#5C4A2A', marginBottom: 6 }}>Şifre</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: 10,
                fontSize: 15, outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1B4332')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
            />
          </div>

          {error && (
            <p style={{
              color: '#dc2626', fontSize: 13, backgroundColor: '#fef2f2',
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            }}>{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 10,
              backgroundColor: '#1B4332', color: '#fff', border: 'none',
              fontFamily: cinzel.style.fontFamily, fontWeight: 600, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              letterSpacing: 1,
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {!sifreSifirla ? (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button onClick={() => setSifreSifirla(true)}
              style={{ background: 'none', border: 'none', color: '#5C4A2A', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
              {"Şifremi Unuttum"}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 16, padding: '16px', background: '#FAF7F2', borderRadius: 10, border: '1px solid #E0D5C5' }}>
            <div style={{ fontSize: 13, color: '#1B4332', marginBottom: 10, fontWeight: 600 }}>{"Şifre Sıfırlama"}</div>
            <input
              type="email" value={sifirlaEmail} onChange={e => setSifirlaEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0D5C5', borderRadius: 8, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' as const }}
            />
            {sifirlaMsg && (
              <div style={{ fontSize: 12, color: sifirlaMsg.startsWith('Hata') ? '#C62828' : '#2E7D32', marginBottom: 8 }}>
                {sifirlaMsg}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSifreSifirla}
                style={{ flex: 1, padding: '10px', background: '#1B4332', border: 'none', borderRadius: 8, color: '#8B6914', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {"Gönder"}
              </button>
              <button onClick={() => { setSifreSifirla(false); setSifirlaMsg('') }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #E0D5C5', borderRadius: 8, color: '#5C4A2A', fontSize: 12, cursor: 'pointer' }}>
                {"İptal"}
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 14, color: '#5C4A2A', marginTop: 24 }}>
          Hesabınız yok mu?{' '}
          <Link href="/register" style={{ color: '#1B4332', fontWeight: 600, textDecoration: 'underline' }}>
            Kayıt Ol
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  )
}
