'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user && !data.session) {
        setError('Kayıt başarılı ancak e-posta onayı gerekiyor. Lütfen e-postanızı kontrol edin.')
        setLoading(false); return
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası oluştu')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: 10,
    fontSize: 15, outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#FAF6EF', fontFamily: garamond.style.fontFamily,
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
            <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
            <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
            <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
            <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#B8860B"/>
            <path d="M32 38 Q28.5 42 32 45.5 Q35.5 42 32 38Z" fill="#B8860B" opacity="0.8"/>
            <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
            <circle cx="26.5" cy="34" r="2" fill="#FF7043"/>
            <circle cx="37.5" cy="34" r="2" fill="#42A5F5"/>
            <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC"/>
          </svg>
          <h1 style={{
            fontFamily: cinzel.style.fontFamily, fontSize: 22, fontWeight: 600,
            color: '#1C3A26', margin: '0 0 4px 0', letterSpacing: 2,
          }}>
            İpek Yolu Şifacısı
          </h1>
          <p style={{ color: '#6B5744', fontSize: 14, margin: 0 }}>Yeni hesap oluşturun</p>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B5744', marginBottom: 6 }}>Ad Soyad</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Adınız Soyadınız" style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1C3A26')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B5744', marginBottom: 6 }}>E-posta</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="ornek@email.com" style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1C3A26')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B5744', marginBottom: 6 }}>Şifre</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              minLength={6} placeholder="En az 6 karakter" style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1C3A26')}
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
              backgroundColor: '#1C3A26', color: '#fff', border: 'none',
              fontFamily: cinzel.style.fontFamily, fontWeight: 600, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              letterSpacing: 1,
            }}
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#6B5744', marginTop: 24 }}>
          Zaten hesabınız var mı?{' '}
          <Link href="/login" style={{ color: '#1C3A26', fontWeight: 600, textDecoration: 'underline' }}>
            Giriş Yap
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  )
}
