import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://www.ipekyolusifacisi.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/analiz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/bitkiler`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/karakter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/hakkimizda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/sss`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/kvkk`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/gizlilik-politikasi`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Hekim ve makale slug'larını Supabase'den dinamik çek
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [hekimRes, makaleRes] = await Promise.all([
      supabase.from('hekim_biyografileri').select('slug').eq('aktif', true),
      supabase.from('makaleler').select('slug, guncelleme').eq('yayinda', true),
    ])

    const hekimRoutes: MetadataRoute.Sitemap = (hekimRes.data || []).map((h: { slug: string }) => ({
      url: `${BASE}/hekim/${h.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    const makaleRoutes: MetadataRoute.Sitemap = (makaleRes.data || []).map((m: { slug: string; guncelleme?: string }) => ({
      url: `${BASE}/makale/${m.slug}`,
      lastModified: m.guncelleme ? new Date(m.guncelleme) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticRoutes, ...hekimRoutes, ...makaleRoutes]
  } catch (e) {
    console.error('sitemap dynamic fetch failed; statik liste döndürülüyor:', e)
    return staticRoutes
  }
}
