'use client'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'] })
const C = { primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6', secondary: '#5C4A2A' }

export default function BasarisizPage() {
  const router = useRouter()
  return (
    <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: garamond.style.fontFamily }}>
      <div style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28, color: '#A32D2D' }}>{'\u2715'}</div>
        <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, marginBottom: 8 }}>{"Ödeme Tamamlanamadı"}</div>
        <div style={{ fontSize: 14, color: C.secondary, fontStyle: 'italic', marginBottom: 8, lineHeight: 1.6 }}>
          {"Ödeme işleminiz gerçekleştirilemedi. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz."}
        </div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 28 }}>
          {"Sorun devam ederse info@ipekyolusicifacisi.com adresine yazabilirsiniz."}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => router.push('/odeme')}
            style={{ background: C.primary, color: C.gold, border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: 'pointer', letterSpacing: 1 }}>
            Tekrar Dene
          </button>
          <button onClick={() => router.push('/')}
            style={{ background: 'transparent', color: C.secondary, border: '1px solid #E0D5C5', borderRadius: 8, padding: '12px 24px', fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: 'pointer' }}>
            Ana Sayfa
          </button>
        </div>
      </div>
    </div>
  )
}
