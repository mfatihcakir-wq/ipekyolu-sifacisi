'use client'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF', secondary: '#6B5744', border: '#DEB887', white: '#FFFFFF' }

const h2Style = { fontFamily: cinzel.style.fontFamily, fontSize: 16, color: C.primary, marginBottom: 10, fontWeight: 500 as const }
const pStyle = { fontSize: 14, color: C.secondary, lineHeight: 1.8, marginBottom: 10 }
const ulStyle = { fontSize: 14, color: C.secondary, lineHeight: 1.8, marginBottom: 10, paddingLeft: 22 }

export default function KVKKPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 28, color: C.primary, marginBottom: 8, fontWeight: 500 }}>{"KVKK Aydınlatma Metni"}</h1>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 32 }}>{"Son güncelleme: Nisan 2026"}</p>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"1. Veri Sorumlusunun Kimliği"}</h2>
          <p style={pStyle}>{"6698 sayılı Kişisel Verilerin Korunması Kanunu (\u201CKVKK\u201D) md. 10 uyarınca, İpek Yolu Şifacısı platformu adına veri sorumlusu sıfatıyla hareket eden gerçek kişi aşağıda belirtilmiştir:"}</p>
          <ul style={ulStyle}>
            <li><strong>{"Ad-Soyad: "}</strong>{"Mehmet Fatih Çakır"}</li>
            <li><strong>{"Başvuru Adresi: "}</strong>{"[BURAYI KULLANICI DOLDURACAK — faaliyet/tebligat adresi]"}</li>
            <li><strong>{"E-posta: "}</strong>{"m.fatih.cakir@gmail.com"}</li>
            <li><strong>{"Telefon: "}</strong>{"+90 533 168 72 26"}</li>
            <li><strong>{"VERBİS Kaydı: "}</strong>{"Veri Sorumluları Siciline kayıt başvuru süreci devam etmektedir. Başvuru tamamlandığında sicil numarası bu metinde ilan edilecektir."}</li>
          </ul>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"2. İşlenen Kişisel Veri Kategorileri"}</h2>
          <p style={pStyle}>{"Platformumuzda aşağıdaki kişisel ve özel nitelikli kişisel veriler işlenmektedir:"}</p>
          <ul style={ulStyle}>
            <li><strong>{"Kimlik bilgileri: "}</strong>{"ad, soyad"}</li>
            <li><strong>{"İletişim bilgileri: "}</strong>{"e-posta, telefon (WhatsApp)"}</li>
            <li><strong>{"Demografik bilgiler: "}</strong>{"yaş grubu, cinsiyet"}</li>
            <li><strong>{"Sağlık verileri (özel nitelikli): "}</strong>{"şikayetler, semptomlar, nabız ve fiziksel gözlem verileri, yaşam tarzı bilgileri, fıtrî ve hâlî mizaç bilgileri, isteğe bağlı laboratuvar değerleri"}</li>
          </ul>
          <p style={pStyle}>{"KVKK md. 6 uyarınca sağlık verileriniz \u201Cözel nitelikli kişisel veri\u201Ddir ve yalnızca açık rızanıza dayanılarak işlenir."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"3. İşleme Amacı ve Hukuki Dayanak"}</h2>
          <p style={pStyle}>{"Kişisel verileriniz şu amaçlarla, aşağıdaki hukuki sebeplere dayanılarak işlenir:"}</p>
          <ul style={ulStyle}>
            <li>{"Klasik İslam tıbbı geleneğine dayalı bireysel danışmanlık sunmak "}<em>{"(açık rıza — md. 6/2)"}</em></li>
            <li>{"Danışmanınızın kişiye özel bilgi rehberi hazırlaması "}<em>{"(sözleşmenin ifası — md. 5/2-c)"}</em></li>
            <li>{"WhatsApp üzerinden iletişim kurulması "}<em>{"(açık rıza)"}</em></li>
            <li>{"Hizmet kalitesinin iyileştirilmesi ve analiz sisteminin geliştirilmesi "}<em>{"(meşru menfaat — md. 5/2-f)"}</em></li>
          </ul>
          <p style={pStyle}><strong>{"Bu platform tıbbi tanı, tedavi veya reçete hizmeti sunmaz."}</strong>{" Modern hekim konsültasyonunun yerini tutmaz. Paylaşılan bilgiler geleneksel/tarihî bir çerçevede sunulan genel bilgilendirmedir."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"4. Verilerin Aktarıldığı Taraflar"}</h2>
          <p style={pStyle}>{"Kişisel verileriniz reklam amacıyla hiçbir üçüncü tarafla paylaşılmaz. Aktarım yalnızca teknik altyapı sağlayıcılarıyla, hizmetin ifası için zorunlu olduğu ölçüde yapılır:"}</p>
          <ul style={ulStyle}>
            <li><strong>{"Supabase Inc. "}</strong>{"(veritabanı, ABD)"}</li>
            <li><strong>{"Vercel Inc. "}</strong>{"(barındırma, ABD)"}</li>
            <li><strong>{"Anthropic PBC "}</strong>{"(analiz motoru — Claude yapay zeka; ABD). Anthropic, API üzerinden gönderilen verileri model eğitiminde kullanmaz. Detaylar için: "}<a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.primary, textDecoration: 'underline' }}>{"https://www.anthropic.com/legal/privacy"}</a></li>
          </ul>
          <p style={pStyle}>{"Yurt dışına aktarım, KVKK md. 9/6 çerçevesinde açık rızanıza dayanmaktadır."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"5. Toplama Yöntemi"}</h2>
          <p style={pStyle}>{"Kişisel verileriniz; platform üzerindeki analiz formu, üyelik kayıt ekranı, WhatsApp yazışmaları ve çerezler aracılığıyla elektronik ortamda toplanır."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"6. Saklama Süresi"}</h2>
          <p style={pStyle}>{"Sağlık verileriniz, hizmet ilişkisinin sona ermesinden itibaren 2 yıl süreyle saklanır. Talep etmeniz halinde verileriniz 30 gün içinde kalıcı olarak silinir, yok edilir veya anonim hâle getirilir."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"7. Haklarınız (KVKK md. 11)"}</h2>
          <p style={pStyle}>{"Kişisel verileriniz hakkında şu haklara sahipsiniz: işlenip işlenmediğini öğrenme, işlenme amacını ve bunların amaca uygun kullanılıp kullanılmadığını öğrenme, yurt içinde ve yurt dışında aktarıldığı üçüncü kişileri öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, düzeltme/silme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme, otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonuç çıkmasına itiraz etme ve zarara uğramanız hâlinde tazminat talep etme."}</p>
          <p style={pStyle}>{"Başvurularınızı "}<strong>{"m.fatih.cakir@gmail.com"}</strong>{" adresine veya yukarıdaki posta adresine yazılı olarak iletebilirsiniz. Başvurunuz en geç 30 gün içinde yanıtlanır."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"8. Değişiklikler"}</h2>
          <p style={pStyle}>{"Bu aydınlatma metni güncellenebilir. Güncel sürüm daima bu sayfada yayınlanır. Son güncelleme tarihi yukarıda belirtilmiştir."}</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
