'use client';
import { useState } from 'react';
import ResultCard from './ResultCard';
import type { Mizac } from '@/lib/landing/types';

type Option = { label: string; score: Partial<Record<Mizac, number>> };
type Question = { q: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    q: 'Hangi sıcaklığı tercih edersiniz?',
    options: [
      { label: 'Sıcağı severim, soğukta bulanırım.', score: { demevî: 0.7, safravî: 0.7 } },
      { label: 'Serini severim, sıcakta bunalırım.', score: { balgamî: 1.0 } },
      { label: 'Ilımanı tercih ederim, ekstremlerde rahatsızım.', score: { sevdavî: 1.0 } },
      { label: 'Fark etmez, kolay uyum sağlarım.', score: { demevî: 0.5, balgamî: 0.5 } },
    ],
  },
  {
    q: 'Cilt ve saç tipiniz çoğunlukla?',
    options: [
      { label: 'Yağlı, parlak; saçım çabuk yağlanır.', score: { balgamî: 1.0 } },
      { label: 'Kuru, çatlamaya meyilli.', score: { sevdavî: 1.0 } },
      { label: 'Hassas, kızarmaya meyilli.', score: { safravî: 1.0 } },
      { label: 'Karışık, mevsime göre değişir.', score: { demevî: 1.0 } },
    ],
  },
  {
    q: 'Stresliyken ilk tepkiniz?',
    options: [
      { label: 'Sinirlenirim, sesim yükselir.', score: { safravî: 1.0 } },
      { label: 'İçime kapanırım, çok düşünürüm.', score: { sevdavî: 1.0 } },
      { label: 'Yemek yerim ya da uyurum.', score: { balgamî: 1.0 } },
      { label: 'Konuşurum, çevremle paylaşırım.', score: { demevî: 1.0 } },
    ],
  },
  {
    q: 'Sabah uyandığınızda?',
    options: [
      { label: 'Hemen kalkar, hızla aktif olurum.', score: { safravî: 1.0 } },
      { label: 'Yavaş kalkarım, ısınmam zaman alır.', score: { balgamî: 1.0 } },
      { label: 'Düşünceli ve sessiz uyanırım.', score: { sevdavî: 1.0 } },
      { label: 'Genelde dinç ve neşeliyimdir.', score: { demevî: 1.0 } },
    ],
  },
];

const SIFIR: Record<Mizac, number> = {
  demevî: 0,
  safravî: 0,
  sevdavî: 0,
  balgamî: 0,
};

export default function MizacQuiz() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Mizac, number>>({ ...SIFIR });
  const [done, setDone] = useState(false);

  const handleAnswer = (option: Option) => {
    const next = { ...scores };
    (Object.entries(option.score) as [Mizac, number][]).forEach(([k, v]) => {
      next[k] += v;
    });
    setScores(next);

    setTimeout(() => {
      if (step < QUESTIONS.length - 1) setStep(step + 1);
      else setDone(true);
    }, 200);
  };

  const reset = () => {
    setScores({ ...SIFIR });
    setStep(0);
    setDone(false);
  };

  if (done) {
    const winner = (Object.entries(scores) as [Mizac, number][]).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    return <ResultCard mizac={winner} onReset={reset} />;
  }

  const current = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <section className="min-h-screen bg-landing-krem flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <p className="font-roboto text-xs tracking-wider uppercase text-ikincil">
            Soru {step + 1} / {QUESTIONS.length}
          </p>
          <p className="font-roboto text-xs text-landing-altin">ortalama 60 saniye</p>
        </div>
        <div
          className="h-px bg-landing-altin/20 mb-12 relative"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="absolute top-0 left-0 h-full bg-landing-altin transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h2 className="font-cormorant text-3xl md:text-4xl text-kdyesil mb-10 leading-tight">
          {current.q}
        </h2>

        <div className="space-y-3">
          {current.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="w-full text-left p-5 bg-white border border-landing-altin/20 hover:border-landing-altin hover:bg-acikaltin transition-all font-roboto text-[15px] text-anametin"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
