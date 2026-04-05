import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column' as const, fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#1B4332', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ color: '#8B6914', fontSize: 14, fontWeight: 600, letterSpacing: 3 }}>{"İPEK YOLU ŞİFACISI"}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 80, marginBottom: 8, opacity: 0.3 }}>{"⚗️"}</div>
          <h1 style={{ fontSize: 48, color: '#1B4332', marginBottom: 4, fontWeight: 300 }}>404</h1>
          <h2 style={{ fontSize: 22, color: '#1B4332', marginBottom: 8, fontWeight: 500 }}>{"Sayfa Bulunamadı"}</h2>
          <p style={{ fontSize: 18, color: '#8B6914', fontFamily: 'serif', marginBottom: 24, direction: 'rtl' as const }}>{"الصفحة غير موجودة"}</p>
          <p style={{ fontSize: 14, color: '#6B5744', fontStyle: 'italic', marginBottom: 32 }}>{"Aradığınız sayfa mevcut değil veya taşınmış olabilir."}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/" style={{ background: '#1B4332', color: 'white', borderRadius: 10, padding: '14px 28px', fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: 1 }}>{"Ana Sayfaya Dön"}</Link>
            <Link href="/hasta" style={{ background: 'transparent', color: '#1B4332', border: '1.5px solid #1B4332', borderRadius: 10, padding: '14px 28px', fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: 1 }}>{"Hasta Paneline Git"}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
