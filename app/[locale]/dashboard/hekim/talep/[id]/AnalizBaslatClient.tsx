'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AnalizBaslatClient({ talepId }: { talepId: string; durum?: string }) {
  const router = useRouter()
  const [baslatiyor, setBaslatiyor] = useState(false)
  const [hata, setHata] = useState<string>('')

  async function baslat() {
    setBaslatiyor(true)
    setHata('')
    try {
      const res = await fetch(`/api/hekim/analiz-baslat/${talepId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Hata')
      router.refresh()
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Beklenmeyen hata')
    } finally {
      setBaslatiyor(false)
    }
  }

  return (
    <section className="border border-emerald-200 bg-emerald-50 rounded-lg p-6">
      <h2 className="font-medium text-emerald-900 mb-2">Analizi Başlat</h2>
      <p className="text-sm text-emerald-800 mb-4">
        Claude Opus 4.7 + MİZAN sistem promptu + Supabase klasik kaynaklar ile taslak üretilir.
        30-60 saniye sürer. Tamamlandığında taslağı düzenleyebilirsin.
      </p>
      {hata && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-900">
          {hata}
        </div>
      )}
      <button
        onClick={baslat}
        disabled={baslatiyor}
        className="px-5 py-2.5 bg-emerald-700 text-white text-sm font-medium rounded hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {baslatiyor ? 'Analiz oluşturuluyor... (30-60 sn)' : 'Analizi Başlat'}
      </button>
      <div className="mt-3 text-xs text-emerald-700">
        Tahminî maliyet: ~$0.50-1.00
      </div>
    </section>
  )
}
