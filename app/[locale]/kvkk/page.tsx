'use client'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6', secondary: '#5C4A2A', border: '#E0D5C5', white: '#FFFFFF' }

export default function KVKKPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const router = useRouter()
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 28, color: C.primary, marginBottom: 8, fontWeight: 500 }}>{"KVKK Aydınlatma Metni"}</h1>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 32 }}>{"Son güncelleme: Nisan 2026"}</p>

        {[
          { baslik: '1. Veri Sorumlusu', icerik: "İpek Yolu Şifacısı olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz. İletişim: info@ipekyolusicifacisi.com" },
          { baslik: '2. İşlenen Kişisel Veriler', icerik: "Platformumuzda şu kişisel veriler işlenmektedir: Ad soyad, telefon numarası (WhatsApp), e-posta adresi, yaş grubu, cinsiyet, sağlık şikayetleri, yaşam tarzı bilgileri, nabız ve fiziksel gözlem verileri, isteğe bağlı laboratuvar değerleri." },
          { baslik: '3. Verilerin İşlenme Amacı', icerik: "Kişisel verileriniz; klasik İslam tıbbı geleneğine dayalı sağlık danışmanlığı hizmeti sunmak, danışmanınızın size özel protokol hazırlaması, WhatsApp üzerinden iletişim kurulması ve hizmet kalitesinin iyileştirilmesi amacıyla işlenmektedir." },
          { baslik: '4. Verilerin Paylaşımı', icerik: "Kişisel verileriniz; reklam amaçlı olarak üçüncü taraflarla paylaşılmamaktadır. Yalnızca hizmet altyapısını sağlayan Supabase (veritabanı) ve Vercel (hosting) ile teknik zorunluluk kapsamında paylaşılmaktadır." },
          { baslik: '5. Veri Saklama Süresi', icerik: "Sağlık verileriniz, hizmet ilişkisinin sona ermesinden itibaren 2 yıl süreyle saklanmaktadır. Talep etmeniz halinde verileriniz derhal silinmektedir." },
          { baslik: '6. Haklarınız', icerik: "KVKK kapsamında şu haklara sahipsiniz: Verilerinizin işlenip işlenmediğini öğrenme, işlenen verilere ilişkin bilgi talep etme, verilerin düzeltilmesini isteme, silinmesini talep etme, işlenmesine itiraz etme. Talepleriniz için: info@ipekyolusicifacisi.com" },
        ].map(s => (
          <div key={s.baslik} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 16, color: C.primary, marginBottom: 10, fontWeight: 500 }}>{s.baslik}</h2>
            <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.8 }}>{s.icerik}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  )
}
