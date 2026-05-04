import type { Metadata } from 'next'
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

export default function BitkilerPage() {
  return <BitkilerClient />
}
