'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const DURUMLAR = [
  { deger: 'yeni', etiket: 'Yeni' },
  { deger: 'isleniyor', etiket: 'İşleniyor' },
  { deger: 'taslak_hazir', etiket: 'Taslak Hazır' },
  { deger: 'onayli', etiket: 'Onaylı' },
  { deger: 'iptal', etiket: 'İptal' },
  { deger: 'waitlist', etiket: 'Bekleme Listesi' },
]

export function DurumDegistirForm({ talepId, mevcutDurum }: { talepId: string; mevcutDurum: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [yeniDurum, setYeniDurum] = useState(mevcutDurum)
  const [kaydediyor, setKaydediyor] = useState(false)

  async function kaydet() {
    setKaydediyor(true)

    const guncellemeler: Record<string, string> = { durum: yeniDurum }
    if (yeniDurum === 'isleniyor' && mevcutDurum === 'yeni') {
      guncellemeler.islenmeye_baslandi_at = new Date().toISOString()
    }
    if (yeniDurum === 'taslak_hazir') {
      guncellemeler.taslak_hazir_at = new Date().toISOString()
    }
    if (yeniDurum === 'onayli') {
      guncellemeler.onaylandi_at = new Date().toISOString()
    }
    if (yeniDurum === 'iptal') {
      guncellemeler.iptal_edildi_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('analiz_talepleri')
      .update(guncellemeler)
      .eq('id', talepId)

    setKaydediyor(false)
    if (!error) router.refresh()
    else alert('Hata: ' + error.message)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={yeniDurum}
        onChange={(e) => setYeniDurum(e.target.value)}
        className="px-3 py-2 border border-stone-300 rounded text-sm bg-white"
      >
        {DURUMLAR.map((d) => (
          <option key={d.deger} value={d.deger}>{d.etiket}</option>
        ))}
      </select>
      <button
        onClick={kaydet}
        disabled={kaydediyor || yeniDurum === mevcutDurum}
        className="px-4 py-2 bg-emerald-700 text-white text-sm rounded hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {kaydediyor ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  )
}
