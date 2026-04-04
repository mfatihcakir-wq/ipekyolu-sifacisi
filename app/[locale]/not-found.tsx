'use client'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { useRouter } from 'next/navigation'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

export default function NotFound() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#F5EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: garamond.style.fontFamily }}>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 80, marginBottom: 16, opacity: 0.3 }}>{"⚗️"}</div>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 28, color: '#1B4332', marginBottom: 8, fontWeight: 500 }}>Sayfa Bulunamadı</h1>
        <p style={{ fontSize: 16, color: '#5C4A2A', fontStyle: 'italic', marginBottom: 32 }}>{"Aradığınız sayfa mevcut değil veya taşınmış olabilir."}</p>
        <button onClick={() => router.push('/')}
          style={{ background: '#1B4332', color: 'white', border: 'none', borderRadius: 10, padding: '14px 32px', fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: 2 }}>
          {"Ana Sayfaya Dön"}
        </button>
      </div>
    </div>
  )
}
