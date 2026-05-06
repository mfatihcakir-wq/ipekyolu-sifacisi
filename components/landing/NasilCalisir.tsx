const ADIMLAR = [
  {
    no: '1',
    sure: '3 dakika',
    baslik: 'Anlatın',
    metin:
      'Şikayetinizi kendi cümlelerinizle yazın. Sistem üç başlık sorar; ne hissediyorsunuz, ne zamandır, neyi denediniz.',
    arka:
      'Şikayetiniz beş klinik katmana ayrışır: mizaç dengesi, ahlât teorisi, organ ekseni, çevre, hayat ritmi.',
  },
  {
    no: '2',
    sure: '5 ile 7 dakika',
    baslik: 'Analiz',
    metin:
      'Yapay zekâ 71.900 metin parçasını tarar; tablonuza uyan pasajları çeker, beş klasik hekimin gözünden yorumlar. Mizacınız hesaplanır, vakanızla en çok konuşacak hekim seçilir.',
    arka:
      'Adlandırılmış kaynaklar; Tahbîzü\u2019l-Mathûn Cilt 2 sayfa 188; el-Hâvî Cilt 4 fasıl 12. Gerçek alıntı, gerçek folio.',
  },
  {
    no: '3',
    sure: 'sürekli',
    baslik: 'Raporunuz kalır',
    metin:
      'Üç bölümlü rapor; mizaç haritanız, hekim yorumları, yapılacaklar (bitki, beslenme, ritim). Rapor hesabınızda kalır; sonraki analizinizle karşılaştırılır.',
    arka:
      'Tek seferlik test değil, kişisel defter. Mizaç değişmez ama dengesi kayar; kendi seyrinizi izlersiniz.',
  },
];

export default function NasilCalisir() {
  return (
    <section className="bg-landing-krem py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-20 max-w-3xl mx-auto">
          <p className="font-roboto text-sm tracking-[0.2em] uppercase text-landing-altin mb-4">
            Süreç
          </p>
          <h2 className="font-cormorant text-4xl md:text-5xl text-kdyesil leading-tight mb-6">
            Üç adım, on dakika, bir ömür birikim.
          </h2>
          <p className="font-roboto text-lg text-ikincil leading-relaxed">
            Şikayetinizi yazıyorsunuz. Yapay zekâ binyıllık metinleri tarıyor.
            Mizacınızı, hangi hekimin sizinle konuştuğunu, ne yapmanız
            gerektiğini öğreniyorsunuz.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
          <div
            className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-landing-altin/30"
            aria-hidden
          />

          {ADIMLAR.map((a) => (
            <article
              key={a.no}
              className="relative bg-white rounded-sm p-8 border border-landing-altin/15"
            >
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-cormorant text-6xl text-landing-altin leading-none">
                  {a.no}
                </span>
                <span className="font-roboto text-xs tracking-wider uppercase px-3 py-1 bg-acikaltin text-ikincil rounded-sm">
                  {a.sure}
                </span>
              </div>
              <h3 className="font-cormorant text-2xl text-kdyesil mb-4">{a.baslik}</h3>
              <p className="font-roboto text-[15px] leading-relaxed text-anametin mb-6">
                {a.metin}
              </p>
              <div className="bg-landing-krem border-l-2 border-landing-altin pl-4 py-3">
                <p className="font-roboto text-xs uppercase tracking-wider text-landing-altin mb-2">
                  Bu adımda ne oluyor
                </p>
                <p className="font-roboto text-sm text-ikincil leading-relaxed">
                  {a.arka}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
