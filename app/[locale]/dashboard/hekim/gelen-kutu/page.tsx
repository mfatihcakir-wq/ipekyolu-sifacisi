import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Gelen Kutu · Hekim Paneli · İpek Yolu Şifacısı',
}

export const dynamic = 'force-dynamic'

const DURUM_RENKLERI: Record<string, string> = {
  yeni: 'bg-amber-100 text-amber-900',
  isleniyor: 'bg-blue-100 text-blue-900',
  taslak_hazir: 'bg-purple-100 text-purple-900',
  onayli: 'bg-emerald-100 text-emerald-900',
  iptal: 'bg-stone-100 text-stone-600',
  waitlist: 'bg-orange-100 text-orange-900',
}

const DURUM_ETIKETLERI: Record<string, string> = {
  yeni: 'Yeni',
  isleniyor: 'İşleniyor',
  taslak_hazir: 'Taslak Hazır',
  onayli: 'Onaylı',
  iptal: 'İptal',
  waitlist: 'Bekleme Listesi',
}

export default async function GelenKutuPage() {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const rol = (user.app_metadata as { rol?: string } | undefined)?.rol
  if (rol !== 'hekim') redirect('/')

  const { data: talepler, error } = await supabase
    .from('analiz_talepleri')
    .select('id, ad_soyad, email, telefon, sikayetler, durum, created_at, yas_grubu, cinsiyet')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl mb-8">Gelen Kutu</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-900">
          Talepler yüklenirken hata: {error.message}
        </div>
      </main>
    )
  }

  const istatistikler = {
    toplam: talepler?.length ?? 0,
    yeni: talepler?.filter(t => t.durum === 'yeni').length ?? 0,
    isleniyor: talepler?.filter(t => t.durum === 'isleniyor').length ?? 0,
    onayli: talepler?.filter(t => t.durum === 'onayli').length ?? 0,
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-serif text-3xl text-stone-900">Gelen Kutu</h1>
        <div className="text-sm text-stone-500">
          Toplam <strong>{istatistikler.toplam}</strong> talep ·
          <span className="text-amber-700 ml-2">{istatistikler.yeni} yeni</span> ·
          <span className="text-blue-700 ml-2">{istatistikler.isleniyor} işleniyor</span> ·
          <span className="text-emerald-700 ml-2">{istatistikler.onayli} onaylı</span>
        </div>
      </div>

      {!talepler || talepler.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          Henüz talep yok. Yeni talepler bu sayfada görünecektir.
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 text-stone-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Danışan</th>
                <th className="text-left px-4 py-3 font-medium">Şikayet</th>
                <th className="text-left px-4 py-3 font-medium">Durum</th>
                <th className="text-left px-4 py-3 font-medium">Tarih</th>
                <th className="text-left px-4 py-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {talepler.map((t) => (
                <tr key={t.id} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-900">{t.ad_soyad}</div>
                    <div className="text-xs text-stone-500">{t.email}</div>
                    {t.yas_grubu && (
                      <div className="text-xs text-stone-400 mt-0.5">
                        {t.yas_grubu} · {t.cinsiyet}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-700 max-w-md">
                    <div className="line-clamp-2">{t.sikayetler || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${DURUM_RENKLERI[t.durum] ?? ''}`}>
                      {DURUM_ETIKETLERI[t.durum] ?? t.durum}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-500">
                    {new Date(t.created_at).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/hekim/talep/${t.id}`}
                      className="text-sm text-emerald-700 hover:text-emerald-900 font-medium"
                    >
                      Detay →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
