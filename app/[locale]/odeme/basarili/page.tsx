'use client'
import { useRouter } from 'next/navigation'
import { Cinzel } from 'next/font/google'
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600'] })
const C = { primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6' }
export default function BasariliPage() {
  const router = useRouter()
  return (
    <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u2713'}</div>
        <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, color: C.primary, marginBottom: 8 }}>{"Ödeme Başarılı"}</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>{"Danışmanınız en kısa sürede WhatsApp'tan ulaşacak."}</div>
        <button onClick={() => router.push('/')} style={{ background: C.primary, color: C.gold, border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: cinzel.style.fontFamily, fontSize: 13, cursor: 'pointer' }}>{"Ana Sayfaya Dön"}</button>
      </div>
    </div>
  )
}
