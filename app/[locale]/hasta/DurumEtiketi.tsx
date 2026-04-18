const DURUM_MAP: Record<string, { etiket: string; bg: string; color: string }> = {
  yeni: { etiket: 'Beklemede', bg: '#FEF3C7', color: '#92400E' },
  isleniyor: { etiket: 'İnceleniyor', bg: '#DBEAFE', color: '#1E3A8A' },
  taslak_hazir: { etiket: 'Son Kontrol', bg: '#EDE9FE', color: '#5B21B6' },
  onayli: { etiket: 'Hazır', bg: '#D1FAE5', color: '#065F46' },
  iptal: { etiket: 'İptal', bg: '#F3F4F6', color: '#6B7280' },
  waitlist: { etiket: 'Sırada', bg: '#FED7AA', color: '#9A3412' },
}

export function DurumEtiketi({ durum }: { durum: string }) {
  const info = DURUM_MAP[durum] || { etiket: durum, bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: info.bg,
      color: info.color,
    }}>
      {info.etiket}
    </span>
  )
}
