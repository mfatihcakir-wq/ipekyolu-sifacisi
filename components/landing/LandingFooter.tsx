import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="bg-anametin text-acikaltin pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-5">
            <Logo size={48} mode="footer" color="light" showText={true} />
            <p className="mt-4 font-roboto text-sm text-acikaltin/70 leading-relaxed max-w-md">
              Klasik İslam ve Osmanlı tıp külliyatını yapay zekâ ile okunur kılan
              bir araştırma projesi. Sahaftaki kitabı mutfak masasına getirme
              çabası.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="font-roboto text-xs uppercase tracking-wider text-landing-altin mb-4">
              Keşfet
            </p>
            <ul className="space-y-3 font-roboto text-sm text-acikaltin/80">
              <li><a href="/analiz" className="hover:text-landing-altin">Mizaç analizi</a></li>
              <li><a href="/mizac-tahmini" className="hover:text-landing-altin">60 sn tahmin</a></li>
              <li><a href="/bitkiler" className="hover:text-landing-altin">Bitki külliyatı</a></li>
              <li><a href="/hekimler" className="hover:text-landing-altin">Hekimler</a></li>
              <li><a href="/makaleler" className="hover:text-landing-altin">Makaleler</a></li>
              <li><a href="/proje-hakkinda" className="hover:text-landing-altin">Proje Hakkında</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="font-roboto text-xs uppercase tracking-wider text-landing-altin mb-4">
              İletişim
            </p>
            <ul className="space-y-3 font-roboto text-sm text-acikaltin/80">
              <li>
                <a href="https://wa.me/447418600856" className="hover:text-landing-altin">
                  WhatsApp; tek soru, doğrudan
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/ipekyolusicfacisi"
                  className="hover:text-landing-altin"
                >
                  Instagram: @ipekyolusicfacisi
                </a>
              </li>
              <li>
                <a href="mailto:m.fatih.cakir@gmail.com" className="hover:text-landing-altin">
                  E-posta
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-acikaltin/15 pt-6 flex flex-col md:flex-row justify-between gap-4 font-roboto text-xs text-acikaltin/50">
          <p>
            &copy; {new Date().getFullYear()} İpek Yolu Şifacısı. Tüm hakları
            saklıdır.
          </p>
          <div className="flex gap-6 flex-wrap">
            <a href="/gizlilik-politikasi" className="hover:text-landing-altin">Gizlilik</a>
            <a href="/kvkk" className="hover:text-landing-altin">KVKK</a>
          </div>
        </div>

        <p className="mt-8 font-roboto text-xs text-acikaltin/40 leading-relaxed max-w-3xl">
          Bu site bir tanı veya tedavi servisi değildir. Sunulan içerik klasik
          tıp külliyatından akademik araştırma temelli derlemelerdir; modern
          tıbbi tedavinin yerini almaz. Sağlık şikayetleriniz için lütfen
          hekiminize başvurunuz.
        </p>
      </div>
    </footer>
  );
}
