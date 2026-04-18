import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const DURUM_ETIKETLERI: Record<string, { etiket: string; renk: string }> = {
  yeni: { etiket: 'Beklemede', renk: 'bg-amber-100 text-amber-900' },
  isleniyor: { etiket: 'İnceleniyor', renk: 'bg-blue-100 text-blue-900' },
  taslak_hazir: { etiket: 'Son Kontrol', renk: 'bg-purple-100 text-purple-900' },
  onayli: { etiket: 'Hazır', renk: 'bg-emerald-100 text-emerald-900' },
  iptal: { etiket: 'İptal', renk: 'bg-stone-100 text-stone-600' },
  waitlist: { etiket: 'Sırada', renk: 'bg-orange-100 text-orange-900' },
}

export default async function AnalizlerimPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: talepler } = await supabase
    .from('analiz_talepleri')
    .select('id, sikayetler, durum, created_at, onaylandi_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl text-stone-900 mb-8">Analizlerim</h1>

      {!talepler || talepler.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          Henüz bir analiz talebiniz yok.
          <div className="mt-4">
            <Link href="/analiz" className="text-emerald-700 hover:text-emerald-900 font-medium">
              Yeni Analiz Başlat →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {talepler.map((t) => {
            const durumInfo = DURUM_ETIKETLERI[t.durum] || { etiket: t.durum, renk: 'bg-stone-100' }
            return (
              <div
                key={t.id}
                className="border border-stone-200 rounded-lg p-4 hover:border-stone-300 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-stone-700 line-clamp-2">
                      {t.sikayetler || 'Şikayet belirtilmemiş'}
                    </div>
                    <div className="text-xs text-stone-500 mt-2">
                      Talep: {new Date(t.created_at).toLocaleDateString('tr-TR')}
                      {t.onaylandi_at && (
                        <> · Hazırlandı: {new Date(t.onaylandi_at).toLocaleDateString('tr-TR')}</>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${durumInfo.renk}`}
                    >
                      {durumInfo.etiket}
                    </span>
                    {t.durum === 'onayli' && (
                      <Link
                        href={`/hasta/analizlerim/${t.id}`}
                        className="text-sm text-emerald-700 hover:text-emerald-900 font-medium"
                      >
                        Görüntüle →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
