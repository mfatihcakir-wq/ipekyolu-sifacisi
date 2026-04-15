'use client'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import { useRouter } from 'next/navigation'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

export default function NotFound() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EF', display: 'flex', flexDirection: 'column' as const, fontFamily: garamond.style.fontFamily }}>
      <div style={{ background: '#1C3A26', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: '#B8860B', fontSize: 14, fontWeight: 600, letterSpacing: 3 }}>{"İPEK YOLU ŞİFACISI"}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 80, marginBottom: 8, opacity: 0.3 }}>{"⚗️"}</div>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 48, color: '#1C3A26', marginBottom: 4, fontWeight: 300 }}>404</h1>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: '#1C3A26', marginBottom: 8, fontWeight: 500 }}>{"Sayfa Bulunamadı"}</h2>
          <p style={{ fontSize: 18, color: '#B8860B', fontFamily: 'serif', marginBottom: 24, direction: 'rtl' as const }}>{"الصفحة غير موجودة"}</p>
          <p style={{ fontSize: 14, color: '#6B5744', fontStyle: 'italic', marginBottom: 32 }}>{"Aradığınız sayfa mevcut değil veya taşınmış olabilir."}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => router.push('/')}
              style={{ background: '#1C3A26', color: 'white', border: 'none', borderRadius: 10, padding: '14px 28px', fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 }}>
              {"Ana Sayfaya Dön"}
            </button>
            <button onClick={() => router.push('/hasta')}
              style={{ background: 'transparent', color: '#1C3A26', border: '1.5px solid #1C3A26', borderRadius: 10, padding: '14px 28px', fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 }}>
              {"Danışan Paneline Git"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
