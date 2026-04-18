import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MaliyetPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')
  const rol = (user.app_metadata as { rol?: string } | undefined)?.rol
  if (rol !== 'hekim') redirect('/')

  const buAyBaslangici = new Date()
  buAyBaslangici.setDate(1)
  buAyBaslangici.setHours(0, 0, 0, 0)

  const { data: sonuclar } = await supabase
    .from('analiz_sonuclari')
    .select('input_token_sayisi, output_token_sayisi, tahmini_maliyet_usd, created_at, model_versiyonu')
    .gte('created_at', buAyBaslangici.toISOString())
    .order('created_at', { ascending: false })

  const toplamMaliyet = sonuclar?.reduce((s, r) => s + (r.tahmini_maliyet_usd || 0), 0) || 0
  const toplamAnaliz = sonuclar?.length || 0
  const toplamInput = sonuclar?.reduce((s, r) => s + (r.input_token_sayisi || 0), 0) || 0
  const toplamOutput = sonuclar?.reduce((s, r) => s + (r.output_token_sayisi || 0), 0) || 0

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl text-stone-900 mb-2">Maliyet Takibi</h1>
      <p className="text-sm text-stone-500 mb-8">
        Bu ay — {buAyBaslangici.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide">Toplam Maliyet</div>
          <div className="text-2xl font-serif text-stone-900 mt-1">${toplamMaliyet.toFixed(2)}</div>
          <div className="text-xs text-stone-500 mt-1">≈ {(toplamMaliyet * 38).toFixed(0)} ₺</div>
        </div>
        <div className="border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide">Analiz Sayısı</div>
          <div className="text-2xl font-serif text-stone-900 mt-1">{toplamAnaliz}</div>
        </div>
        <div className="border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide">Input Token</div>
          <div className="text-2xl font-serif text-stone-900 mt-1">{(toplamInput / 1000).toFixed(1)}K</div>
        </div>
        <div className="border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide">Output Token</div>
          <div className="text-2xl font-serif text-stone-900 mt-1">{(toplamOutput / 1000).toFixed(1)}K</div>
        </div>
      </div>

      {toplamMaliyet > 50 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-900">
          ⚠️ Bu ay $50&apos;ı geçti ({(toplamMaliyet * 38).toFixed(0)}₺).
        </div>
      )}

      <h2 className="font-medium text-stone-800 mb-4">Son Analizler</h2>
      <div className="border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50">
            <tr>
              <th className="text-left px-3 py-2 text-stone-600 font-medium">Tarih</th>
              <th className="text-left px-3 py-2 text-stone-600 font-medium">Model</th>
              <th className="text-right px-3 py-2 text-stone-600 font-medium">Input</th>
              <th className="text-right px-3 py-2 text-stone-600 font-medium">Output</th>
              <th className="text-right px-3 py-2 text-stone-600 font-medium">Maliyet</th>
            </tr>
          </thead>
          <tbody>
            {sonuclar?.slice(0, 30).map((s, i) => (
              <tr key={i} className="border-t border-stone-100">
                <td className="px-3 py-2">{new Date(s.created_at).toLocaleString('tr-TR')}</td>
                <td className="px-3 py-2 text-stone-500 text-xs">{s.model_versiyonu}</td>
                <td className="px-3 py-2 text-right">{s.input_token_sayisi?.toLocaleString('tr-TR')}</td>
                <td className="px-3 py-2 text-right">{s.output_token_sayisi?.toLocaleString('tr-TR')}</td>
                <td className="px-3 py-2 text-right font-mono">${s.tahmini_maliyet_usd?.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
