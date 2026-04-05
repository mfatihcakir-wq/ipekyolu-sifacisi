'use client'
import { useState } from 'react'
import { Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1B4332', gold: '#8B6914', cream: '#FAF7F2', secondary: '#6B5744', border: '#E8DFD4', white: '#FFFFFF' }

export default function YorumYazPage() {
  const [puan, setPuan] = useState(5)
  const [adSoyad, setAdSoyad] = useState('')
  const [sehir, setSehir] = useState('')
  const [yorum, setYorum] = useState('')
  const [kvkk, setKvkk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adSoyad.trim() || !yorum.trim()) {
      setError('Ad soyad ve yorum alanlari zorunludur.')
      return
    }
    if (!kvkk) {
      setError('KVKK metnini onaylamaniz gerekmektedir.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/yorum/gonder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_soyad: adSoyad, sehir, yorum, puan }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Bir hata olustu.')
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch {
      setError('Baglanti hatasi. Lutfen tekrar deneyin.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ fontFamily: garamond.style.fontFamily, color: '#1C1C1C', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
          <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
            <div style={{
              background: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: 16, padding: 36,
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{"✓"}</div>
              <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, fontWeight: 600, color: C.primary, marginBottom: 12 }}>
                {"Yorumunuz Alindi"}
              </h2>
              <p style={{ fontSize: 16, color: C.secondary, lineHeight: 1.7, marginBottom: 24 }}>
                {"Yorumunuz incelendikten sonra yayinlanacaktir. Katkilariniz icin tesekkur ederiz."}
              </p>
              <a href="/" style={{
                display: 'inline-block', background: C.gold, color: C.primary, fontFamily: cinzel.style.fontFamily,
                fontSize: 13, fontWeight: 600, padding: '12px 32px', borderRadius: 10, textDecoration: 'none', letterSpacing: 1,
              }}>
                {"Ana Sayfaya Don"}
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ fontFamily: garamond.style.fontFamily, color: '#1C1C1C', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '48px 16px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, fontWeight: 600, color: C.primary, textAlign: 'center', marginBottom: 8 }}>
            {"Deneyiminizi Paylasin"}
          </h1>
          <p style={{ textAlign: 'center', fontStyle: 'italic', fontSize: 15, color: C.secondary, marginBottom: 32 }}>
            {"Yorumunuz incelendikten sonra yayinlanacaktir."}
          </p>

          <form onSubmit={handleSubmit} style={{
            background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 36,
          }}>
            {/* Puan */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                {"Puaniniz"}
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setPuan(n)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, padding: '0 2px',
                    color: n <= puan ? C.gold : C.border,
                  }}>
                    {"\u2605"}
                  </button>
                ))}
              </div>
            </div>

            {/* Ad Soyad */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                {"Ad Soyad *"}
              </label>
              <input
                type="text"
                value={adSoyad}
                onChange={e => setAdSoyad(e.target.value)}
                placeholder="Adiniz Soyadiniz"
                style={{
                  width: '100%', minHeight: 44, fontSize: 16, padding: '10px 14px',
                  border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: garamond.style.fontFamily,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Sehir */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                {"Sehir"}
              </label>
              <input
                type="text"
                value={sehir}
                onChange={e => setSehir(e.target.value)}
                placeholder="Sehriniz (istege bagli)"
                style={{
                  width: '100%', minHeight: 44, fontSize: 16, padding: '10px 14px',
                  border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: garamond.style.fontFamily,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Yorum */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                {"Yorumunuz *"}
              </label>
              <textarea
                value={yorum}
                onChange={e => { if (e.target.value.length <= 500) setYorum(e.target.value) }}
                placeholder="Deneyiminizi paylasın..."
                rows={5}
                style={{
                  width: '100%', minHeight: 120, fontSize: 16, padding: '10px 14px',
                  border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: garamond.style.fontFamily,
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
              <div style={{ textAlign: 'right', fontSize: 13, color: C.secondary, marginTop: 4 }}>
                {`${yorum.length}/500`}
              </div>
            </div>

            {/* KVKK */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={kvkk}
                  onChange={e => setKvkk(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6 }}>
                  {"Kisisel verilerimin KVKK kapsaminda islenmesini ve yorumumun site uzerinde yayinlanmasini onayliyorum."}
                </span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: 10, padding: '12px 16px',
                fontSize: 14, color: '#C53030', marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: loading ? C.border : C.gold, color: C.primary,
                fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, letterSpacing: 1,
                padding: '14px 24px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Gonderiliyor...' : 'Yorumu Gonder'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
