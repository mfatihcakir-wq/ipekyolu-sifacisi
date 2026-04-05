'use client'
import { Cinzel, EB_Garamond } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F5EFE6', display: 'flex', flexDirection: 'column' as const, fontFamily: garamond.style.fontFamily }}>
      {/* Header */}
      <div style={{ background: '#1B4332', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: '#8B6914', fontSize: 14, fontWeight: 600, letterSpacing: 3 }}>{"İPEK YOLU ŞİFACISI"}</div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.4 }}>{"⚠️"}</div>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, color: '#1B4332', marginBottom: 8, fontWeight: 500 }}>{"Bir Şeyler Ters Gitti"}</h1>
          <p style={{ fontSize: 15, color: '#5C4A2A', fontStyle: 'italic', marginBottom: 8 }}>{"Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."}</p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <pre style={{ background: '#FFF8E7', border: '1px solid #E0D5C5', borderRadius: 8, padding: 12, fontSize: 11, color: '#8B0000', marginBottom: 24, textAlign: 'left' as const, overflow: 'auto', maxHeight: 120 }}>{error.message}</pre>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <button onClick={() => reset()} style={{ background: '#1B4332', color: 'white', border: 'none', borderRadius: 10, padding: '14px 28px', fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 }}>{"Sayfayı Yenile"}</button>
            <button onClick={() => window.location.href = '/'} style={{ background: 'transparent', color: '#1B4332', border: '1.5px solid #1B4332', borderRadius: 10, padding: '14px 28px', fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 }}>{"Ana Sayfaya Dön"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
