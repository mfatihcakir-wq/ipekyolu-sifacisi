import type { LandingStats } from '@/lib/landing/types';

type Props = { stats: LandingStats };

export default function Hero({ stats }: Props) {
  return (
    <section className="bg-landing-krem">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
          {/* SOL: Copy + CTA + Alıntı */}
          <div className="md:col-span-7">
            <p className="font-roboto text-xs tracking-[0.25em] uppercase text-landing-altin mb-6">
              Klasik İslam Tıbbı, Bugünün Sağlığı İçin
            </p>

            <h1 className="font-cormorant text-4xl md:text-6xl text-kdyesil leading-[1.05] tracking-tight mb-6">
              Bedeniniz size bir şey söylüyor.
              <br />
              <span className="text-landing-altin italic">
                Klasik metinler tercüme ediyor.
              </span>
            </h1>

            <p className="font-roboto text-lg text-anametin leading-relaxed mb-10 max-w-xl">
              Şikayetinizi yazın, yapay zekâ binyıllık tıp külliyatını sizin
              için tarasın. Mizacınızı, hangi hekimin sizinle konuştuğunu ve
              ne yapmanız gerektiğini öğrenin.
            </p>

            {/* İki seviyeli CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <a
                href="/analiz"
                className="bg-kdyesil text-acikaltin font-roboto text-sm tracking-wider uppercase px-8 py-4 hover:bg-landing-altin hover:text-kdyesil transition-colors text-center"
              >
                Tam analiz başlat
                <span className="block text-[11px] tracking-normal normal-case text-acikaltin/70 mt-0.5">
                  10 dakika, kişisel rapor
                </span>
              </a>
              <a
                href="/mizac-tahmini"
                className="border border-kdyesil text-kdyesil font-roboto text-sm tracking-wider uppercase px-8 py-4 hover:bg-acikaltin transition-colors text-center"
              >
                Mizaç tahmini
                <span className="block text-[11px] tracking-normal normal-case text-ikincil mt-0.5">
                  60 saniye, hızlı tahmin
                </span>
              </a>
            </div>

            {/* İbn Sînâ alıntısı, altın çubuklu blockquote */}
            <blockquote className="border-l-2 border-landing-altin pl-5 py-2 max-w-xl">
              <p className="font-arapca text-xl text-kdyesil mb-2 leading-snug">
                الجسم لا يُعالَج إلا بمعرفة مزاجه
              </p>
              <p className="font-cormorant italic text-base text-anametin leading-relaxed mb-2">
                Beden, ancak mizacı bilindiğinde tedavi edilebilir.
              </p>
              <cite className="font-roboto not-italic text-xs text-ikincil">
                İbn Sînâ, el-Kânûn fi&rsquo;t-Tıb (Kitab 1)
              </cite>
            </blockquote>
          </div>

          {/* SAĞ: Mizaç çarkı SVG + canlı sayılar */}
          <div className="md:col-span-5 flex flex-col items-center">
            <MizacCarki />

            <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-sm">
              <Stat label="Klasik eser" value={stats.kaynak} />
              <Stat label="Metin parçası" value={stats.chunk} />
              <Stat label="Bitki" value={stats.bitki} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-cormorant text-2xl md:text-3xl text-kdyesil leading-none">
        {value.toLocaleString('tr-TR')}
      </p>
      <p className="font-roboto text-[10px] uppercase tracking-wider text-ikincil mt-2 leading-tight">
        {label}
      </p>
    </div>
  );
}

/**
 * Mizaç çarkı: dört hılt (demevî, safravî, sevdavî, balgamî) eksenli, sıcak/soğuk
 * ve nemli/kuru eksenleri ile dört çeyrekli klasik diyagram.
 * SVG inline; ek istek yok, hafif.
 */
function MizacCarki() {
  return (
    <svg
      viewBox="0 0 320 320"
      className="w-full max-w-[300px] h-auto"
      role="img"
      aria-label="Mizaç çarkı: dört hılt diyagramı"
    >
      {/* Dış halka */}
      <circle cx="160" cy="160" r="148" fill="none" stroke="#B8860B" strokeWidth="0.5" opacity="0.4" />
      <circle cx="160" cy="160" r="120" fill="none" stroke="#B8860B" strokeWidth="0.5" opacity="0.25" />
      <circle cx="160" cy="160" r="60" fill="#FAF6EF" stroke="#B8860B" strokeWidth="0.5" opacity="0.6" />

      {/* Dört çeyrek ayraç çizgileri */}
      <line x1="12" y1="160" x2="308" y2="160" stroke="#B8860B" strokeWidth="0.5" opacity="0.3" />
      <line x1="160" y1="12" x2="160" y2="308" stroke="#B8860B" strokeWidth="0.5" opacity="0.3" />

      {/* Eksen etiketleri (Arapça + Türkçe) */}
      <text x="160" y="22" textAnchor="middle" fontSize="10" fill="#5C4A2A" fontFamily="var(--font-roboto)" letterSpacing="2">
        SICAK
      </text>
      <text x="160" y="305" textAnchor="middle" fontSize="10" fill="#5C4A2A" fontFamily="var(--font-roboto)" letterSpacing="2">
        SOĞUK
      </text>
      <text x="14" y="164" textAnchor="start" fontSize="10" fill="#5C4A2A" fontFamily="var(--font-roboto)" letterSpacing="2">
        NEM
      </text>
      <text x="306" y="164" textAnchor="end" fontSize="10" fill="#5C4A2A" fontFamily="var(--font-roboto)" letterSpacing="2">
        KURU
      </text>

      {/* Dört hılt: konum + etiket + Arapça karşılığı */}
      {/* Demevî (sıcak + nemli) - sol üst */}
      <g>
        <circle cx="100" cy="100" r="34" fill="#B8860B" opacity="0.12" />
        <circle cx="100" cy="100" r="34" fill="none" stroke="#B8860B" strokeWidth="0.8" />
        <text x="100" y="92" textAnchor="middle" fontSize="13" fill="#1C3A26" fontFamily="var(--font-cormorant)" fontWeight="500">
          Demevî
        </text>
        <text x="100" y="108" textAnchor="middle" fontSize="13" fill="#B8860B" fontFamily="var(--font-arapca)">
          دموي
        </text>
      </g>

      {/* Safravî (sıcak + kuru) - sağ üst */}
      <g>
        <circle cx="220" cy="100" r="34" fill="#B8860B" opacity="0.12" />
        <circle cx="220" cy="100" r="34" fill="none" stroke="#B8860B" strokeWidth="0.8" />
        <text x="220" y="92" textAnchor="middle" fontSize="13" fill="#1C3A26" fontFamily="var(--font-cormorant)" fontWeight="500">
          Safravî
        </text>
        <text x="220" y="108" textAnchor="middle" fontSize="13" fill="#B8860B" fontFamily="var(--font-arapca)">
          صفراوي
        </text>
      </g>

      {/* Balgamî (soğuk + nemli) - sol alt */}
      <g>
        <circle cx="100" cy="220" r="34" fill="#B8860B" opacity="0.12" />
        <circle cx="100" cy="220" r="34" fill="none" stroke="#B8860B" strokeWidth="0.8" />
        <text x="100" y="212" textAnchor="middle" fontSize="13" fill="#1C3A26" fontFamily="var(--font-cormorant)" fontWeight="500">
          Balgamî
        </text>
        <text x="100" y="228" textAnchor="middle" fontSize="13" fill="#B8860B" fontFamily="var(--font-arapca)">
          بلغمي
        </text>
      </g>

      {/* Sevdavî (soğuk + kuru) - sağ alt */}
      <g>
        <circle cx="220" cy="220" r="34" fill="#B8860B" opacity="0.12" />
        <circle cx="220" cy="220" r="34" fill="none" stroke="#B8860B" strokeWidth="0.8" />
        <text x="220" y="212" textAnchor="middle" fontSize="13" fill="#1C3A26" fontFamily="var(--font-cormorant)" fontWeight="500">
          Sevdavî
        </text>
        <text x="220" y="228" textAnchor="middle" fontSize="13" fill="#B8860B" fontFamily="var(--font-arapca)">
          سوداوي
        </text>
      </g>

      {/* Merkez: tıbb */}
      <text x="160" y="155" textAnchor="middle" fontSize="22" fill="#1C3A26" fontFamily="var(--font-arapca)" fontWeight="700">
        طبّ
      </text>
      <text x="160" y="175" textAnchor="middle" fontSize="9" fill="#5C4A2A" fontFamily="var(--font-roboto)" letterSpacing="3">
        TIBB
      </text>
    </svg>
  );
}
