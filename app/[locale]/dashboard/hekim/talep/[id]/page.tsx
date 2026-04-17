import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { DurumDegistirForm } from './DurumDegistirForm'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string; locale: string }>

export default async function TalepDetayPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const rol = (user.app_metadata as { rol?: string } | undefined)?.rol
  if (rol !== 'hekim') redirect('/')

  const { data: talep, error } = await supabase
    .from('analiz_talepleri')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !talep) notFound()

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/dashboard/hekim/gelen-kutu" className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-block">
        ← Gelen Kutu
      </Link>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">{talep.ad_soyad}</h1>
          <div className="text-sm text-stone-500 mt-1">
            {talep.email} · {talep.telefon || 'telefon yok'} ·
            Talep: {new Date(talep.created_at).toLocaleString('tr-TR')}
          </div>
        </div>
        <DurumDegistirForm talepId={talep.id} mevcutDurum={talep.durum} />
      </div>

      <div className="grid gap-6">
        <Bolum baslik="Temel Bilgiler">
          <Alan etiket="Yaş Grubu" deger={talep.yas_grubu} />
          <Alan etiket="Cinsiyet" deger={talep.cinsiyet} />
        </Bolum>

        <Bolum baslik="Şikayetler ve Öykü">
          <Alan etiket="Şikayetler" deger={talep.sikayetler} longText />
          <Alan etiket="Süresi" deger={talep.sikayet_suresi} />
          <Alan etiket="Kronik Hastalıklar" deger={talep.kronik_hastaliklar} longText />
          <Alan etiket="Kullanılan İlaçlar" deger={talep.kullanilan_ilaclar} longText />
        </Bolum>

        {talep.yasam_tarzi && Object.keys(talep.yasam_tarzi).length > 0 && (
          <Bolum baslik="Yaşam Tarzı"><JsonGoruntule veri={talep.yasam_tarzi} /></Bolum>
        )}
        {talep.nabiz && Object.keys(talep.nabiz).length > 0 && (
          <Bolum baslik="Nabız"><JsonGoruntule veri={talep.nabiz} /></Bolum>
        )}
        {talep.dil && Object.keys(talep.dil).length > 0 && (
          <Bolum baslik="Dil"><JsonGoruntule veri={talep.dil} /></Bolum>
        )}
        {talep.yuz && Object.keys(talep.yuz).length > 0 && (
          <Bolum baslik="Yüz"><JsonGoruntule veri={talep.yuz} /></Bolum>
        )}
        {talep.idrar && Object.keys(talep.idrar).length > 0 && (
          <Bolum baslik="İdrar"><JsonGoruntule veri={talep.idrar} /></Bolum>
        )}
        {talep.diski && Object.keys(talep.diski).length > 0 && (
          <Bolum baslik="Dışkı"><JsonGoruntule veri={talep.diski} /></Bolum>
        )}
        {talep.fizik_olcum && Object.keys(talep.fizik_olcum).length > 0 && (
          <Bolum baslik="Fizik Ölçüm"><JsonGoruntule veri={talep.fizik_olcum} /></Bolum>
        )}
        {talep.fitri_mizac && Object.keys(talep.fitri_mizac).length > 0 && (
          <Bolum baslik="Fıtrî Mizaç"><JsonGoruntule veri={talep.fitri_mizac} /></Bolum>
        )}
        {talep.danisan_mesaji && (
          <Bolum baslik="Danışan Mesajı">
            <div className="whitespace-pre-wrap text-stone-700">{talep.danisan_mesaji}</div>
          </Bolum>
        )}
      </div>

      <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <strong>Not:</strong> Claude analiz üretme özelliği Faz 2&apos;de eklenecek. Şu an sadece talep verisini inceleyebilirsin.
      </div>
    </main>
  )
}

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section className="border border-stone-200 rounded-lg overflow-hidden">
      <header className="bg-stone-50 px-4 py-3 border-b border-stone-200">
        <h2 className="font-medium text-stone-800">{baslik}</h2>
      </header>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  )
}

function Alan({ etiket, deger, longText = false }: { etiket: string; deger: string | null | undefined; longText?: boolean }) {
  if (!deger) return null
  return (
    <div className={longText ? 'space-y-1' : 'grid grid-cols-[160px_1fr] gap-4'}>
      <div className="text-sm text-stone-500">{etiket}</div>
      <div className={`text-sm text-stone-900 ${longText ? 'whitespace-pre-wrap' : ''}`}>{String(deger)}</div>
    </div>
  )
}

function JsonGoruntule({ veri }: { veri: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      {Object.entries(veri).map(([k, v]) => {
        if (v === null || v === undefined || v === '') return null
        const gosterilecek = typeof v === 'object' ? JSON.stringify(v) : String(v)
        if (gosterilecek === '{}' || gosterilecek === '[]') return null
        return (
          <div key={k} className="grid grid-cols-[160px_1fr] gap-4">
            <div className="text-sm text-stone-500 capitalize">{k.replace(/_/g, ' ')}</div>
            <div className="text-sm text-stone-900 break-words">{gosterilecek}</div>
          </div>
        )
      })}
    </div>
  )
}
