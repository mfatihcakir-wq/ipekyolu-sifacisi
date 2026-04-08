import MakaleUret from '@/components/MakaleUret'

export default function AdminPage() {
  return (
    <main style={{
      background: '#122518',
      minHeight: '100vh',
      padding: '60px clamp(24px,5vw,80px)'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'Cormorant Garamond,serif',
          fontSize: 11,
          letterSpacing: 4,
          color: 'rgba(212,168,67,0.45)',
          marginBottom: 8
        }}>YÖNETİM PANELİ</div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond,serif',
          fontSize: 32,
          fontWeight: 600,
          color: '#F5EAD4',
          marginBottom: 48
        }}>İçerik Yönetimi</h1>
        <MakaleUret />
      </div>
    </main>
  )
}
