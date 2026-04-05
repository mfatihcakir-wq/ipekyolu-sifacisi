import type { Metadata } from 'next'
import AnalizClient from './AnalizClient'

export const metadata: Metadata = {
  title: 'Mizaç Analiz Formu — İpek Yolu Şifacısı',
  description: '8 adımlı klasik İslam tıbbı mizaç analiz formu. Nabız, dil, yüz ve laboratuvar değerleriyle kişisel protokol hazırlama.',
}

export default function Page() {
  return <AnalizClient />
}
