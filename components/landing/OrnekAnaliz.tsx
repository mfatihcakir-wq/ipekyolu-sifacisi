/**
 * Blok 3, Örnek Analiz Önizlemesi
 *
 * Demo persona: Mehmet K. (38, mühendis). Şikayetler: sabahları kalkamama,
 * konsantrasyon güçlüğü, başın ağırlığı.
 *
 * Çıktı: balgamî baskın mizaç, Tahbîz Cilt 2 Bâderencbûye'den gerçek alıntı,
 * üç öneri kartı (bitki, beslenme, yaşam ritmi).
 */

const ONERILER = [
  {
    tip: 'Bitki',
    baslik: 'Bâderencbûye',
    aciklama:
      'Sıcak ve kuru, ikinci derece. Balgamı gideren, kalbi ve beyni kuvvetlendiren. Günde iki fincan demleme, sabah ve öğle.',
  },
  {
    tip: 'Beslenme',
    baslik: 'Sabahları sıcak ve kuru',
    aciklama:
      'Süt ürünlerini sabahtan akşama erteleyin. Bal, zencefil, tarçınlı sıcak içecek; balgamî bedende sabah yangını açar.',
  },
  {
    tip: 'Yaşam ritmi',
    baslik: 'Hareket, sabahın ilk saati',
    aciklama:
      'Balgamî mizaçta uzun yürüyüş tek başına yetmez; kısa, yoğun, ısı yükselten egzersiz; haftada üç gün, 20 dakika.',
  },
];

export default function OrnekAnaliz() {
  return (
    <section className="bg-landing-krem py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-roboto text-sm tracking-[0.2em] uppercase text-landing-altin mb-4">
            Örnek analiz, gerçek çıktı
          </p>
          <h2 className="font-cormorant text-4xl md:text-5xl text-kdyesil leading-tight mb-6">
            Şöyle görünür: Mehmet K. için bir önizleme.
          </h2>
          <p className="font-roboto text-lg text-ikincil leading-relaxed">
            Aşağıdaki, gerçek bir analizin nasıl çıktığının kısaltılmış halidir.
            Asıl raporda her bölüm uzar, hekim yorumları ayrılır, bitki ve
            beslenme kartları detaylanır.
          </p>
        </header>

        {/* Persona kartı */}
        <div className="bg-white border border-landing-altin/20 p-6 md:p-8 mb-8 grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3 flex md:block items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-acikaltin flex items-center justify-center flex-shrink-0">
              <span className="font-cormorant text-3xl md:text-4xl text-kdyesil">
                M
              </span>
            </div>
            <div>
              <p className="font-cormorant text-lg text-kdyesil leading-tight">
                Mehmet K.
              </p>
              <p className="font-roboto text-xs text-ikincil">
                38, mühendis &middot; İstanbul
              </p>
            </div>
          </div>

          <div className="md:col-span-9 md:border-l md:border-landing-altin/15 md:pl-6">
            <p className="font-roboto text-xs uppercase tracking-wider text-landing-altin mb-2">
              Şikayet (kendi cümleleriyle)
            </p>
            <p className="font-cormorant italic text-base text-anametin leading-relaxed">
              &ldquo;Son üç haftadır sabahları kalkmakta zorlanıyorum, başım
              ağır. Saat onu bulmadan kafam çalışmıyor; akşam altıdan sonra
              tam tersi, çok uyanık oluyorum.&rdquo;
            </p>
          </div>
        </div>

        {/* Mizaç tespiti */}
        <div className="grid md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-5 bg-kdyesil text-acikaltin p-7">
            <p className="font-roboto text-xs uppercase tracking-[0.2em] text-landing-altin mb-3">
              Hâlî mizaç tespiti
            </p>
            <p className="font-cormorant text-4xl text-acikaltin mb-1">Balgamî</p>
            <p className="font-arapca text-2xl text-landing-altin mb-4">بلغمي</p>
            <p className="font-roboto text-sm leading-relaxed text-acikaltin/85">
              Soğuk ve nemli mizaç baskın. Sabah ısınma süresi uzun, balgam
              beynin önünü tutuyor; akşamları beden ısındıkça uyanıklık geliyor.
              Sebep değil, semptom; balgamın akış yönü.
            </p>
          </div>

          <div className="md:col-span-7 bg-white border border-landing-altin/15 p-7">
            <p className="font-roboto text-xs uppercase tracking-[0.2em] text-landing-altin mb-3">
              Hangi hekim konuşuyor
            </p>
            <p className="font-cormorant text-2xl text-kdyesil mb-3">
              Tokatlı Mustafa Efendi
            </p>
            <p className="font-roboto text-xs text-ikincil mb-5">
              Tahbîzü&rsquo;l-Mathûn &middot; Cilt 2 &middot; Bâderencbûye
              faslı
            </p>

            <blockquote className="border-l-2 border-landing-altin pl-4 py-2">
              <p className="font-cormorant italic text-[15px] text-anametin leading-relaxed mb-2">
                &ldquo;Bâderencbûyenin sıcaklığı balgamı eritir, beynin
                önündeki tıkanıklığı açar; sabah demlenip içildiğinde kalbi
                kuvvetlendirir, melankoliyi giderir.&rdquo;
              </p>
              <cite className="font-roboto not-italic text-xs text-landing-altin">
                bölüm 188, beyit 4
              </cite>
            </blockquote>
          </div>
        </div>

        {/* Üç öneri kartı */}
        <div className="grid md:grid-cols-3 gap-6">
          {ONERILER.map((o) => (
            <article
              key={o.tip}
              className="bg-white border border-landing-altin/15 p-6"
            >
              <p className="font-roboto text-[11px] uppercase tracking-[0.15em] text-landing-altin mb-3">
                {o.tip}
              </p>
              <h3 className="font-cormorant text-xl text-kdyesil leading-tight mb-3">
                {o.baslik}
              </h3>
              <p className="font-roboto text-sm text-anametin leading-relaxed">
                {o.aciklama}
              </p>
            </article>
          ))}
        </div>

        <p className="text-center font-roboto text-sm text-ikincil mt-12">
          Bu örnek özettir; gerçek raporda her bölüm uzar, kaynak tam künyesiyle
          gösterilir, alternatif bitkiler ve karşıt durumlar (kontrendikasyon)
          ayrıca listelenir.
        </p>

        <div className="text-center mt-8">
          <a
            href="/analiz"
            className="inline-block bg-kdyesil text-acikaltin font-roboto text-sm tracking-wider uppercase px-8 py-4 hover:bg-landing-altin hover:text-kdyesil transition-colors"
          >
            Kendi analizimi başlat
          </a>
        </div>
      </div>
    </section>
  );
}
