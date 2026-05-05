import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import BitkilerClient from './BitkilerClient'

export const metadata: Metadata = {
  title: 'Bitki Atlası · 1.180+ Klasik Tıbbî Bitki',
  description: 'İbn Beytâr el-Câmi, el-Hâvî ve el-Şâmil eserlerinden derlenen 1.180+ tıbbî bitki ve müfredât. Mizaç, sıcaklık, nem, organ ve kaynak filtreleriyle.',
  openGraph: {
    title: 'Bitki Atlası, İpek Yolu Şifacısı',
    description: 'Klasik İslam tıbbının en kapsamlı bitki rehberi: 1.180+ kayıt, kaynak gösterimli.',
    type: 'website',
  },
}

// Sayfayi her istek icin yeniden render et (Supabase verisi guncellense de tutarli olsun)
export const revalidate = 3600 // 1 saat ISR

export default async function BitkilerPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Server-side initial fetch (SEO icin tum bitkiler ilk render'da gelir)
  const [p1, p2, countRes] = await Promise.all([
    supabase.from('bitkiler').select('*').order('ad_tr', { ascending: true }).range(0, 999),
    supabase.from('bitkiler').select('*').order('ad_tr', { ascending: true }).range(1000, 1999),
    supabase.from('bitkiler').select('id', { count: 'exact', head: true }),
  ])

  const initialBitkiler = [...(p1.data || []), ...(p2.data || [])]
  const initialCount = countRes.count || initialBitkiler.length

  return <BitkilerClient initialBitkiler={initialBitkiler} initialCount={initialCount} />
}
