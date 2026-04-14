import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ipekyolu-sifacisi.vercel.app'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/analiz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/hakkimizda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/sss`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/kvkk`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/gizlilik-politikasi`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
