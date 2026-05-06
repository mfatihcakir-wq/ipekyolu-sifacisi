'use client';
import type { Mizac } from '@/lib/landing/types';

const META: Record<
  Mizac,
  { arabic: string; summary: string; traits: string[] }
> = {
  demevî: {
    arabic: 'دموي',
    summary: 'Sıcak ve nemli mizaç baskın; canlı, sosyal, atılgansınız.',
    traits: [
      'Enerjiniz yüksek, çabuk yorulmazsınız.',
      'Sosyal ve konuşkansınız.',
      'Yüzünüz çabuk kızarır, kanlanır.',
    ],
  },
  safravî: {
    arabic: 'صفراوي',
    summary: 'Sıcak ve kuru mizaç baskın; hızlı, kararlı, tepkilisiniz.',
    traits: [
      'Hızlı düşünür, hızlı karar verirsiniz.',
      'Sinir baskın; ani öfke patlamaları olabilir.',
      'Cildiniz hassas, sıcaktan kolay etkilenir.',
    ],
  },
  sevdavî: {
    arabic: 'سوداوي',
    summary: 'Soğuk ve kuru mizaç baskın; düşünceli, dikkatli, içe dönüksünüz.',
    traits: [
      'Derin düşünür, çabuk karar vermezsiniz.',
      'Endişeye yatkınsınız.',
      'Cildiniz kuru, ekstremlerde hassas.',
    ],
  },
  balgamî: {
    arabic: 'بلغمي',
    summary: 'Soğuk ve nemli mizaç baskın; sakin, dayanıklı, yavaş ritimlisiniz.',
    traits: [
      'Sakin ve sabırlısınız; tepki hızınız ölçülü.',
      'Soğuk havadan etkilenirsiniz.',
      'Tatlı ve nişastalıya yatkınsınız.',
    ],
  },
};

export default function ResultCard({
  mizac,
  onReset,
}: {
  mizac: Mizac;
  onReset: () => void;
}) {
  const m = META[mizac];

  const handleShare = async () => {
    const data = {
      title: `Mizacım: ${mizac}`,
      text: `İpek Yolu Şifacısı 60 saniye testine göre baskın mizacım: ${mizac}.`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${data.text} ${data.url}`);
        alert('Sonuç bağlantısı panoya kopyalandı.');
      }
    } catch {
      /* iptal edildi */
    }
  };

  return (
    <section className="min-h-screen bg-landing-krem flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full text-center">
        <p className="font-roboto text-sm tracking-[0.2em] uppercase text-ikincil mb-4">
          Baskın mizacınız
        </p>
        <h1 className="font-cormorant text-6xl md:text-7xl text-landing-altin mb-3 capitalize">
          {mizac}
        </h1>
        <p className="font-arapca text-3xl text-kdyesil mb-10">{m.arabic}</p>
        <p className="font-cormorant italic text-xl text-anametin mb-12 leading-relaxed">
          {m.summary}
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-12 text-left">
          {m.traits.map((t, i) => (
            <div key={i} className="bg-white border border-landing-altin/15 p-5">
              <p className="font-roboto text-xs uppercase tracking-wider text-landing-altin mb-2">
                Özellik {i + 1}
              </p>
              <p className="font-roboto text-sm text-anametin leading-relaxed">{t}</p>
            </div>
          ))}
        </div>

        <div className="bg-kdyesil text-acikaltin p-8 mb-6 text-left md:text-center">
          <p className="font-cormorant text-lg italic mb-2 text-acikaltin/85">
            Bu kabaca bir tahmindi.
          </p>
          <p className="font-roboto text-base mb-6 leading-relaxed">
            Gerçek mizaç haritanız 11 değişkenle hesaplanır; tam analizde hangi
            hekimin sizinle konuştuğunu, hangi bitkinin size uygun olduğunu,
            beslenme ritminizi görürsünüz.
          </p>
          <a
            href={`/analiz?on_giris=${encodeURIComponent(mizac)}`}
            className="inline-block bg-landing-altin text-kdyesil font-roboto text-sm tracking-wider uppercase px-8 py-4 hover:bg-acikaltin transition-colors"
          >
            Tam analiz başlat (10 dk)
          </a>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">
          <button
            onClick={handleShare}
            className="font-roboto text-sm text-ikincil underline underline-offset-4"
          >
            Sonucu paylaş
          </button>
          <button
            onClick={onReset}
            className="font-roboto text-sm text-ikincil underline underline-offset-4"
          >
            Yeniden çöz
          </button>
        </div>
      </div>
    </section>
  );
}
