'use client'

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', border: '1px solid #DEB887', borderRadius: 16, padding: '48px 40px', maxWidth: 480, textAlign: 'center' as const }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>{"⚠️"}</div>
        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 600, color: '#1C3A26', marginBottom: 12 }}>
          {"Bir hata oluştu"}
        </div>
        <p style={{ fontSize: 15, color: '#6B5744', lineHeight: 1.7, marginBottom: 28 }}>
          {"Analiz render edilirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={reset}
            style={{ padding: '12px 28px', background: '#B8860B', border: 'none', borderRadius: 10, fontFamily: 'Cormorant Garamond,serif', fontSize: 13, fontWeight: 700, color: '#1C3A26', letterSpacing: 1, cursor: 'pointer' }}>
            {"TEKRAR DENE"}
          </button>
          <a href="/"
            style={{ padding: '12px 28px', background: 'transparent', border: '1px solid #DEB887', borderRadius: 10, fontFamily: 'Cormorant Garamond,serif', fontSize: 13, color: '#6B5744', letterSpacing: 1, textDecoration: 'none' }}>
            {"ANA SAYFA"}
          </a>
        </div>
      </div>
    </div>
  )
}
