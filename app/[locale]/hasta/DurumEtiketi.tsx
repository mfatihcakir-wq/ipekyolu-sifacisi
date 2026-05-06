const DURUM_MAP: Record<string, { etiket: string; class: string }> = {
  yeni: { etiket: 'Beklemede', class: 'bg-amber-100 text-amber-800' },
  isleniyor: { etiket: 'İnceleniyor', class: 'bg-blue-100 text-blue-900' },
  taslak_hazir: { etiket: 'Son Kontrol', class: 'bg-violet-100 text-violet-800' },
  onayli: { etiket: 'Hazır', class: 'bg-emerald-100 text-emerald-800' },
  iptal: { etiket: 'İptal', class: 'bg-gray-100 text-gray-500' },
  waitlist: { etiket: 'Sırada', class: 'bg-orange-200 text-orange-800' },
}

export function DurumEtiketi({ durum }: { durum: string }) {
  const info = DURUM_MAP[durum] || { etiket: durum, class: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-block px-[10px] py-[3px] rounded-[20px] text-[11px] font-semibold ${info.class}`}>
      {info.etiket}
    </span>
  )
}
