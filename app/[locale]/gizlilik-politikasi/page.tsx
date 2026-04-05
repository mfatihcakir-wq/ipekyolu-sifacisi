'use client'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1C3A26', gold: '#8B6914', cream: '#FAF7F2', secondary: '#6B5744', border: '#E8DFD4', white: '#FFFFFF' }

const BOLUMLER = [
  { baslik: '1. Genel Bilgi', icerik: 'Bu gizlilik politikasi, ipekyolusicifacisi.com adresinde sunulan hizmetlerin kullanicilarina ait kisisel verilerin nasil toplandigi, islendigi ve korundugunun aciklanmasi amaciyla hazirlanmistir.' },
  { baslik: '2. Toplanan Veriler', icerik: 'Platformumuzda su veriler toplanmaktadir: Ad soyad, telefon numarasi (WhatsApp iletisimi icin), e-posta adresi, yas grubu, cinsiyet, saglik sikayetleri ve semptomlar, yasam tarzi bilgileri (uyku, beslenme, egzersiz), nabiz ve fiziksel gozlem verileri, istege bagli laboratuvar degerleri, fıtrî mizaç bilgileri.' },
  { baslik: '3. Verilerin Kullanim Amaci', icerik: 'Toplanan veriler yalnizca su amaclarla kullanilmaktadir: Klasik Islam tibbi gelenegine dayali kisisel saglik danışmanlığı sunmak, danismaninizin size ozel protokol hazirlamasi, WhatsApp uzerinden iletisim kurulmasi, hizmet kalitesinin iyilestirilmesi ve analiz motorunun gelistirilmesi.' },
  { baslik: '4. Veri Paylasimi', icerik: 'Kisisel verileriniz hicbir kosulda reklam amaciyla ucuncu taraflarla paylasilmaz. Verileriniz yalnizca teknik altyapi saglayicilarimizla (Supabase — veritabani, Vercel — hosting, Anthropic — yapay zeka analizi, iyzico — odeme) zorunlu olarak paylasilmaktadir.' },
  { baslik: '5. Cerez Politikasi', icerik: 'Platformumuz zorunlu oturum cerezleri disminda herhangi bir izleme cerezi veya ucuncu taraf analitik araci kullanmamaktadir. Google Analytics veya benzeri izleme yazilimlari bulunmamaktadir.' },
  { baslik: '6. Veri Guvenligi', icerik: 'Tum veriler Supabase uzerinde Row Level Security (RLS) ile korunmaktadir. Odeme islemleri iyzico altyapisi ile 256-bit SSL sifreleme altinda gerceklestirilmektedir. Kart bilgileri sunucularimizda saklanmamaktadir.' },
  { baslik: '7. Veri Saklama Suresi', icerik: 'Saglik verileriniz hizmet iliskisinin sona ermesinden itibaren 2 yil sureyle saklanmaktadir. Talep etmeniz halinde verileriniz 30 gun icinde kalici olarak silinmektedir.' },
  { baslik: '8. Haklariniz', icerik: '6698 sayili KVKK kapsaminda su haklara sahipsiniz: Verilerinizin islenip islenmedigini ogrenme, islenen verilere iliskin bilgi talep etme, verilerin duzeltilmesini isteme, silinmesini talep etme, islenmesine itiraz etme. Talepleriniz icin: info@ipekyolusicifacisi.com' },
  { baslik: '9. Degisiklikler', icerik: 'Bu gizlilik politikasi gerektiginde guncellenebilir. Onemli degisiklikler e-posta veya platform uzerinden bildirilecektir. Son guncelleme: Nisan 2026.' },
]

export default function GizlilikPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const router = useRouter()
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 28, color: C.primary, marginBottom: 8, fontWeight: 500 }}>{"Gizlilik Politikası"}</h1>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 32 }}>{"Son güncelleme: Nisan 2026"}</p>

        {BOLUMLER.map(b => (
          <div key={b.baslik} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 16, color: C.primary, marginBottom: 10, fontWeight: 500 }}>{b.baslik}</h2>
            <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.8 }}>{b.icerik}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  )
}
