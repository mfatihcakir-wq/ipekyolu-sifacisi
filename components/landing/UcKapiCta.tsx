/**
 * Blok 7, Üç Kapı Son CTA
 *
 * Üç farklı taahhüt seviyesi için üç giriş kapısı:
 * - Tam analiz: yüksek taahhüt, 10 dakika, kişisel rapor
 * - Mizaç tahmini: orta taahhüt, 60 saniye, hızlı tahmin
 * - WhatsApp: düşük taahhüt, anında, doğrudan soru
 *
 * Birinci kapı görsel olarak ön planda (primary), diğer ikisi denk.
 */

const KAPILAR = [
  {
    seviye: 'Yüksek taahhüt',
    sure: '10 dakika',
    baslik: 'Tam analiz',
    aciklama:
      'Form doldurun, mizaç tespiti, klasik kaynak gösterimli kişisel protokol. Üç bölümlü rapor hesabınızda kalır.',
    cta: 'Analizimi başlat',
    href: '/analiz',
    primary: true,
  },
  {
    seviye: 'Orta taahhüt',
    sure: '60 saniye',
    baslik: 'Mizaç tahmini',
    aciklama:
      'Dört soruluk mini test. Baskın mizacınızın kabaca ne olabileceğini görün; isterseniz tam analize geçin.',
    cta: 'Tahmini başlat',
    href: '/mizac-tahmini',
    primary: false,
  },
  {
    seviye: 'Düşük taahhüt',
    sure: 'anında',
    baslik: 'WhatsApp\u2019tan tek soru',
    aciklama:
      'Aklınızda belirli bir konu varsa doğrudan sorun. Kısa, samimi cevap; analiz değil sohbet.',
    cta: 'WhatsApp\u2019ı aç',
    href: 'https://wa.me/447418600856',
    primary: false,
  },
];

export default function UcKapiCta() {
  return (
    <section className="bg-acikaltin py-24 md:py-32 border-t border-landing-altin/10">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-roboto text-sm tracking-[0.2em] uppercase text-landing-altin mb-4">
            Üç giriş kapısı
          </p>
          <h2 className="font-cormorant text-4xl md:text-5xl text-kdyesil leading-tight mb-6">
            Hangisi şu an size uygunsa, oradan başlayın.
          </h2>
          <p className="font-roboto text-lg text-ikincil leading-relaxed">
            Hepsi aynı yere değil; farklı insanlar için farklı kapılar. Hangisini
            seçerseniz seçin, bilgileriniz KVKK kapsamında korunur.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {KAPILAR.map((k) => {
            const isPrimary = k.primary;
            const cardClass = isPrimary
              ? 'bg-kdyesil text-acikaltin border-kdyesil'
              : 'bg-white text-anametin border-landing-altin/20';
            const seviyeClass = isPrimary ? 'text-landing-altin' : 'text-landing-altin';
            const baslikClass = isPrimary ? 'text-acikaltin' : 'text-kdyesil';
            const aciklamaClass = isPrimary
              ? 'text-acikaltin/85'
              : 'text-anametin';
            const ctaClass = isPrimary
              ? 'bg-landing-altin text-kdyesil hover:bg-acikaltin'
              : 'bg-kdyesil text-acikaltin hover:bg-landing-altin hover:text-kdyesil';

            return (
              <article
                key={k.baslik}
                className={`border p-7 flex flex-col ${cardClass}`}
              >
                <div className="flex items-baseline justify-between mb-5">
                  <p
                    className={`font-roboto text-[11px] uppercase tracking-[0.15em] ${seviyeClass}`}
                  >
                    {k.seviye}
                  </p>
                  <p
                    className={`font-roboto text-xs ${
                      isPrimary ? 'text-acikaltin/70' : 'text-ikincil'
                    }`}
                  >
                    {k.sure}
                  </p>
                </div>

                <h3
                  className={`font-cormorant text-2xl leading-tight mb-4 ${baslikClass}`}
                >
                  {k.baslik}
                </h3>

                <p
                  className={`font-roboto text-sm leading-relaxed flex-1 mb-6 ${aciklamaClass}`}
                >
                  {k.aciklama}
                </p>

                <a
                  href={k.href}
                  className={`font-roboto text-xs tracking-wider uppercase px-5 py-3 text-center transition-colors ${ctaClass}`}
                  {...(k.href.startsWith('http')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {k.cta}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
