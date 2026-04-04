import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/dashboard/', '/api/'],
    },
    sitemap: 'https://ipekyolu-sifacisi.vercel.app/sitemap.xml',
  }
}
