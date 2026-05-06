export default function Danismaniniz() {
  return (
    <section className="bg-kdyesil text-acikaltin py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-1">
            <div className="aspect-square bg-acikaltin/10 mb-5 flex items-center justify-center">
              <span className="font-arapca text-7xl text-landing-altin opacity-30">طبّ</span>
            </div>
            <p className="font-cormorant text-2xl text-acikaltin mb-1">
              Mehmet Fatih Çakır
            </p>
            <p className="font-roboto text-sm text-landing-altin">
              Doktora Adayı, Klasik İslam Tıbbı Tarihi
            </p>
          </div>

          <div className="md:col-span-2 space-y-6">
            <p className="font-roboto text-sm tracking-[0.2em] uppercase text-landing-altin">
              Danışmanınız
            </p>
            <h2 className="font-cormorant text-4xl md:text-5xl leading-tight text-acikaltin">
              Bu işin arkasında bir kişi var.
            </h2>

            <blockquote className="border-l-2 border-landing-altin pl-5 py-1">
              <p className="font-cormorant italic text-xl text-acikaltin/90 leading-relaxed">
                Klasik İslam ve Osmanlı tıbbı üzerine doktora çalışmasını
                yürütüyor; on yılı aşkın süredir Arapça, Farsça ve Osmanlıca tıp
                metinleri okuyor.
              </p>
            </blockquote>

            <p className="font-roboto text-base leading-relaxed text-acikaltin/85">
              Yüksek lisans tezi, 18. yüzyıl Osmanlı hekimi Hekim Hayâtî&rsquo;nin{' '}
              <em>Şeceretü&rsquo;t-Tıb</em> adlı eseri üzerine yazılmış, akademik
              dünyada <strong className="text-landing-altin">ilk</strong> çalışmaydı.
              Sonra fark etti: bu metinleri ondan başkası okumuyor, okuyabilenler
              de hayatın içine indirmiyor. İpek Yolu Şifacısı bu boşluktan doğdu;
              sahaftaki kitabı mutfak masasına getirme çabası.
            </p>

            <p className="font-roboto text-base leading-relaxed text-acikaltin/85">
              Bugüne kadar yedi tercüme, on dörde yakın kitap, dört kıtada kitap
              fuarları. Ama asıl mesele şu: bu külliyatın önünden bin yıl sonra
              geçip <em>&ldquo;burada size dair bir şey var&rdquo;</em>{' '}
              diyebilmek.
            </p>

            <div className="pt-4 border-t border-acikaltin/15">
              <p className="font-roboto text-sm text-acikaltin/75 leading-relaxed">
                Sayfayı okudunuz, hâlâ bir sorunuz varsa{' '}
                <a
                  href="https://wa.me/447418600856"
                  className="text-landing-altin underline underline-offset-4 hover:text-acikaltin transition-colors"
                >
                  WhatsApp&rsquo;tan tek mesaj atın
                </a>
                ; bizzat ben dönüyorum, asistan değil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
