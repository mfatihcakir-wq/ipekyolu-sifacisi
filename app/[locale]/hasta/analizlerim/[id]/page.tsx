import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string; locale: string }>

type Bitki = {
  bitki?: string
  ar?: string
  doz?: string
  hazirlanis?: string
  endikasyon?: string
  kaynak?: string
}

type Cikti = {
  ozet?: string
  fitri_hali?: {
    fitri_mizac?: string
    hali_mizac?: string
    sapma?: string
    tedavi_hedefi?: string
  }
  beslenme_recetesi?: {
    ilke?: string
    onerililer?: string[]
    kacinilacaklar?: string[]
  }
  bitki_recetesi?: Bitki[]
  egzersiz_recetesi?: {
    tur?: string
    sure?: string
    zaman?: string
    ozel?: string
  }
  gunluk_rutin?: Record<string, string[]>
  uyarilar?: string[]
  hikmetli_soz?: {
    metin?: string
    metin_ar?: string
    kaynak?: string
  }
}

export default async function AnalizDetayPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: talep } = await supabase
    .from('analiz_talepleri')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('durum', 'onayli')
    .single()
  if (!talep) notFound()

  const { data: sonuc } = await supabase
    .from('analiz_sonuclari')
    .select('onayli_cikti, onaylandi_at')
    .eq('talep_id', id)
    .single()
  if (!sonuc?.onayli_cikti) notFound()

  const cikti = sonuc.onayli_cikti as Cikti

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/hasta/analizlerim"
        className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-block"
      >
        ← Analizlerim
      </Link>

      <header className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Analiz Raporu</h1>
        <div className="text-sm text-stone-500 mt-1">
          Onaylandı: {sonuc.onaylandi_at ? new Date(sonuc.onaylandi_at).toLocaleDateString('tr-TR') : '—'}
        </div>
      </header>

      {cikti.ozet && (
        <section className="mb-8 bg-emerald-50 border border-emerald-200 rounded-lg p-5">
          <h2 className="font-medium text-emerald-900 mb-2">Özet</h2>
          <p className="text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">{cikti.ozet}</p>
        </section>
      )}

      {cikti.fitri_hali && (
        <Bolum baslik="Mizaç Değerlendirmesi">
          {cikti.fitri_hali.hali_mizac && <Alan etiket="Hâlî Mizaç" deger={cikti.fitri_hali.hali_mizac} />}
          {cikti.fitri_hali.fitri_mizac && <Alan etiket="Fıtrî Mizaç" deger={cikti.fitri_hali.fitri_mizac} />}
          {cikti.fitri_hali.sapma && <Alan etiket="Mevcut Durum" deger={cikti.fitri_hali.sapma} longText />}
          {cikti.fitri_hali.tedavi_hedefi && (
            <Alan etiket="Hedef" deger={cikti.fitri_hali.tedavi_hedefi} longText />
          )}
        </Bolum>
      )}

      {cikti.beslenme_recetesi && (
        <Bolum baslik="Beslenme Önerisi">
          {cikti.beslenme_recetesi.ilke && (
            <p className="text-sm text-stone-700 mb-3">{cikti.beslenme_recetesi.ilke}</p>
          )}
          {cikti.beslenme_recetesi.onerililer && (
            <div className="mb-3">
              <div className="text-xs font-medium text-stone-500 mb-1">Önerilenler</div>
              <div className="flex flex-wrap gap-2">
                {cikti.beslenme_recetesi.onerililer.map((g: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-800 text-xs rounded">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
          {cikti.beslenme_recetesi.kacinilacaklar && (
            <div>
              <div className="text-xs font-medium text-stone-500 mb-1">Kaçınılacaklar</div>
              <div className="flex flex-wrap gap-2">
                {cikti.beslenme_recetesi.kacinilacaklar.map((g: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-red-50 text-red-800 text-xs rounded">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Bolum>
      )}

      {cikti.bitki_recetesi && cikti.bitki_recetesi.length > 0 && (
        <Bolum baslik="Bitki Önerileri">
          <div className="space-y-3">
            {cikti.bitki_recetesi.map((b, i) => (
              <div key={i} className="border border-stone-200 rounded p-3">
                <div className="font-medium text-stone-900">
                  {b.bitki}{' '}
                  {b.ar && <span className="text-stone-500 font-normal">({b.ar})</span>}
                </div>
                {b.doz && <div className="text-sm text-stone-700 mt-1">Doz: {b.doz}</div>}
                {b.hazirlanis && <div className="text-sm text-stone-700 mt-1">Hazırlama: {b.hazirlanis}</div>}
                {b.endikasyon && <div className="text-sm text-stone-600 mt-1 italic">{b.endikasyon}</div>}
                {b.kaynak && <div className="text-xs text-stone-400 mt-2">Kaynak: {b.kaynak}</div>}
              </div>
            ))}
          </div>
        </Bolum>
      )}

      {cikti.egzersiz_recetesi && (
        <Bolum baslik="Egzersiz Önerisi">
          <Alan etiket="Tür" deger={cikti.egzersiz_recetesi.tur} />
          <Alan etiket="Süre" deger={cikti.egzersiz_recetesi.sure} />
          <Alan etiket="Zaman" deger={cikti.egzersiz_recetesi.zaman} />
          {cikti.egzersiz_recetesi.ozel && (
            <Alan etiket="Açıklama" deger={cikti.egzersiz_recetesi.ozel} longText />
          )}
        </Bolum>
      )}

      {cikti.gunluk_rutin && (
        <Bolum baslik="Günlük Rutin">
          {(['sabah', 'oglen', 'aksam'] as const).map((zd) => {
            const liste = cikti.gunluk_rutin?.[zd]
            if (!liste || liste.length === 0) return null
            return (
              <div key={zd} className="mb-3">
                <div className="text-xs font-medium text-stone-500 mb-1 capitalize">{zd}</div>
                <ul className="text-sm text-stone-700 space-y-1">
                  {liste.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </Bolum>
      )}

      {cikti.uyarilar && cikti.uyarilar.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6">
          <h2 className="font-medium text-amber-900 mb-2">Uyarılar</h2>
          <ul className="text-sm text-amber-900 space-y-1">
            {cikti.uyarilar.map((u: string, i: number) => (
              <li key={i}>• {u}</li>
            ))}
          </ul>
        </section>
      )}

      {cikti.hikmetli_soz && (
        <section className="bg-stone-50 border border-stone-200 rounded-lg p-5 mb-6 text-center">
          {cikti.hikmetli_soz.metin_ar && (
            <div className="text-lg text-stone-700 font-serif mb-2" dir="rtl">
              {cikti.hikmetli_soz.metin_ar}
            </div>
          )}
          {cikti.hikmetli_soz.metin && (
            <div className="text-sm text-stone-600 italic mb-2">{cikti.hikmetli_soz.metin}</div>
          )}
          {cikti.hikmetli_soz.kaynak && (
            <div className="text-xs text-stone-400">— {cikti.hikmetli_soz.kaynak}</div>
          )}
        </section>
      )}

      <div className="mt-12 bg-stone-50 border border-stone-200 rounded-lg p-5 text-sm text-stone-600">
        <strong className="text-stone-800">Önemli:</strong> Bu rapor klasik İslam tıbbı geleneğinin bir uyarlamasıdır ve tıbbi tanı veya tedavi değildir. Ciddi sağlık sorunlarınız için mutlaka bir hekime başvurun.
      </div>
    </main>
  )
}

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section className="border border-stone-200 rounded-lg p-5 mb-6">
      <h2 className="font-medium text-stone-800 mb-4">{baslik}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Alan({
  etiket,
  deger,
  longText = false,
}: {
  etiket: string
  deger: unknown
  longText?: boolean
}) {
  if (deger == null || deger === '') return null
  return (
    <div className={longText ? 'space-y-1' : 'grid grid-cols-[140px_1fr] gap-3'}>
      <div className="text-xs text-stone-500">{etiket}</div>
      <div className={`text-sm text-stone-900 ${longText ? 'whitespace-pre-wrap' : ''}`}>
        {String(deger)}
      </div>
    </div>
  )
}
