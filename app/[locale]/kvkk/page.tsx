'use client'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF', secondary: '#6B5744', border: '#DEB887', white: '#FFFFFF' }

const BOLUMLER = [
  {
    baslik: '1. Veri Sorumlusunun Kimliği',
    icerik: `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") md. 10 uyarınca, İpek Yolu Şifacısı platformu adına veri sorumlusu sıfatıyla hareket eden gerçek kişi aşağıda belirtilmiştir:

Ad-Soyad: Mehmet Fatih Çakır
E-posta: m.fatih.cakir@gmail.com
Telefon: +90 533 168 72 26
VERBİS Kaydı: Veri Sorumluları Siciline kayıt başvuru süreci devam etmektedir. Başvuru tamamlandığında sicil numarası bu metinde ilan edilecektir.`
  },
  {
    baslik: '2. İşlenen Kişisel Veri Kategorileri',
    icerik: `Platformumuzda aşağıdaki kişisel ve özel nitelikli kişisel veriler işlenmektedir:

Kimlik bilgileri: ad, soyad
İletişim bilgileri: e-posta, telefon (WhatsApp)
Demografik bilgiler: yaş grubu, cinsiyet
Sağlık verileri (özel nitelikli): şikayetler, semptomlar, nabız ve fiziksel gözlem verileri, yaşam tarzı bilgileri, fıtrî ve hâlî mizaç bilgileri, isteğe bağlı laboratuvar değerleri

KVKK md. 6 uyarınca sağlık verileriniz "özel nitelikli kişisel veri"dir ve yalnızca açık rızanıza dayanılarak işlenir.`
  },
  {
    baslik: '3. İşleme Amacı ve Hukuki Dayanak',
    icerik: `Kişisel verileriniz şu amaçlarla, aşağıdaki hukuki sebeplere dayanılarak işlenir:

Klasik İslam tıbbı geleneğine dayalı bireysel danışmanlık sunmak (açık rıza — md. 6/2)
Danışmanınızın kişiye özel bilgi rehberi hazırlaması (sözleşmenin ifası — md. 5/2-c)
WhatsApp üzerinden iletişim kurulması (açık rıza)
Hizmet kalitesinin iyileştirilmesi ve analiz sisteminin geliştirilmesi (meşru menfaat — md. 5/2-f)

Bu platform tıbbi tanı, tedavi veya reçete hizmeti sunmaz. Modern hekim konsültasyonunun yerini tutmaz. Paylaşılan bilgiler geleneksel/tarihî bir çerçevede sunulan genel bilgilendirmedir.`
  },
  {
    baslik: '4. Verilerin Aktarıldığı Taraflar',
    icerik: `Kişisel verileriniz reklam amacıyla hiçbir üçüncü tarafla paylaşılmaz. Aktarım yalnızca teknik altyapı sağlayıcılarıyla, hizmetin ifası için zorunlu olduğu ölçüde yapılır:

Supabase Inc. (veritabanı, ABD)
Vercel Inc. (barındırma, ABD)
Anthropic PBC (analiz motoru — Claude yapay zeka; ABD). Anthropic, API üzerinden gönderilen verileri model eğitiminde kullanmaz.

Yurt dışına aktarım, KVKK md. 9/6 çerçevesinde açık rızanıza dayanmaktadır.`
  },
  {
    baslik: '5. Toplama Yöntemi',
    icerik: 'Kişisel verileriniz; platform üzerindeki analiz formu, üyelik kayıt ekranı, WhatsApp yazışmaları ve çerezler aracılığıyla elektronik ortamda toplanır.'
  },
  {
    baslik: '6. Saklama Süresi',
    icerik: 'Sağlık verileriniz, hizmet ilişkisinin sona ermesinden itibaren 2 yıl süreyle saklanır. Talep etmeniz halinde verileriniz 30 gün içinde kalıcı olarak silinir, yok edilir veya anonim hâle getirilir.'
  },
  {
    baslik: '7. Haklarınız (KVKK md. 11)',
    icerik: `Kişisel verileriniz hakkında şu haklara sahipsiniz: işlenip işlenmediğini öğrenme, işlenme amacını ve bunların amaca uygun kullanılıp kullanılmadığını öğrenme, yurt içinde ve yurt dışında aktarıldığı üçüncü kişileri öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, düzeltme/silme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme, otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonuç çıkmasına itiraz etme ve zarara uğramanız hâlinde tazminat talep etme.

Başvurularınızı m.fatih.cakir@gmail.com adresine yazılı olarak iletebilirsiniz. Başvurunuz en geç 30 gün içinde yanıtlanır.`
  },
  {
    baslik: '8. Değişiklikler',
    icerik: 'Bu aydınlatma metni güncellenebilir. Güncel sürüm daima bu sayfada yayınlanır. Son güncelleme tarihi yukarıda belirtilmiştir.'
  },
]

export default function KVKKPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 28, color: C.primary, marginBottom: 8, fontWeight: 500 }}>{"KVKK Aydınlatma Metni"}</h1>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 32 }}>{"Son güncelleme: Nisan 2026"}</p>

        {BOLUMLER.map(s => (
          <div key={s.baslik} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 16, color: C.primary, marginBottom: 10, fontWeight: 500 }}>{s.baslik}</h2>
            {s.icerik.split('\n\n').map((paragraf, i) => (
              <p key={i} style={{ fontSize: 14, color: C.secondary, lineHeight: 1.8, marginBottom: 10, whiteSpace: 'pre-line' as const }}>{paragraf}</p>
            ))}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  )
}
