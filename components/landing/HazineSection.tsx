'use client';
import { useState } from 'react';
import type { Hekim, Makale, EserKart } from '@/lib/landing/types';

type Counts = { hekim: number; eser: number; makale: number };

type Props = {
  hekimler: Hekim[];
  eserler: EserKart[];
  makaleler: Makale[];
  counts: Counts;
};

const TABS = [
  { key: 'hekimler', label: 'Hekimler' },
  { key: 'eserler', label: 'Eserler' },
  { key: 'makaleler', label: 'Makaleler' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function HazineSection({ hekimler, eserler, makaleler, counts }: Props) {
  const [active, setActive] = useState<TabKey>('hekimler');

  return (
    <section className="bg-landing-krem py-24 md:py-32 border-t border-landing-altin/10">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-12 max-w-3xl mx-auto">
          <p className="font-roboto text-sm tracking-[0.2em] uppercase text-landing-altin mb-4">
            Klasik Tıbbın Hazinesi
          </p>
          <h2 className="font-cormorant text-4xl md:text-5xl text-kdyesil leading-tight mb-6">
            Beş hekim, doksan sekiz eser, binyıllık bir defter.
          </h2>
          <p className="font-roboto text-lg text-ikincil leading-relaxed">
            Hangisi sizinle konuşuyor, hangisini bilmek isterdiniz; başlayın.
          </p>
        </header>

        <div
          role="tablist"
          className="flex justify-center mb-12 border-b border-landing-altin/20 overflow-x-auto"
        >
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            const count = counts[tab.key === 'hekimler' ? 'hekim' : tab.key === 'eserler' ? 'eser' : 'makale'];
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.key)}
                className={`px-6 md:px-10 py-4 font-roboto text-sm tracking-wider uppercase transition-all relative whitespace-nowrap ${
                  isActive ? 'text-kdyesil' : 'text-ikincil/60 hover:text-ikincil'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs text-landing-altin">({count})</span>
                {isActive && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-landing-altin" />
                )}
              </button>
            );
          })}
        </div>

        {active === 'hekimler' && <HekimGrid hekimler={hekimler} />}
        {active === 'eserler' && <EserGrid eserler={eserler} />}
        {active === 'makaleler' && <MakaleGrid makaleler={makaleler} />}

        <div className="text-center mt-12">
          <a
            href={`/${active}`}
            className="font-roboto text-sm tracking-wider uppercase text-kdyesil border-b border-landing-altin pb-1 hover:text-landing-altin transition-colors"
          >
            Tümünü gör
          </a>
        </div>
      </div>
    </section>
  );
}

function HekimGrid({ hekimler }: { hekimler: Hekim[] }) {
  if (!hekimler.length) {
    return (
      <p className="text-center text-ikincil font-roboto">
        Hekim profilleri yakında eklenecek.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
      {hekimler.map((h) => {
        const initial = h.isim_ar?.split(' ')[0] ?? h.isim.charAt(0);
        return (
          <a
            key={h.slug}
            href={`/hekim/${h.slug}`}
            className="bg-white border border-landing-altin/15 p-6 hover:border-landing-altin/40 transition-all block"
          >
            <div className="aspect-square bg-acikaltin mb-4 flex items-center justify-center">
              <span className="font-arapca text-3xl text-kdyesil">{initial}</span>
            </div>
            <h3 className="font-cormorant text-xl text-kdyesil mb-1 leading-tight">
              {h.isim}
            </h3>
            {h.dogum_olum && (
              <p className="font-roboto text-xs text-landing-altin mb-3">{h.dogum_olum}</p>
            )}
            {h.biyografi && (
              <p className="font-roboto text-sm text-ikincil leading-relaxed line-clamp-3">
                {h.biyografi}
              </p>
            )}
          </a>
        );
      })}
    </div>
  );
}

function EserGrid({ eserler }: { eserler: EserKart[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {eserler.map((e) => (
        <article key={e.kaynak_kodu} className="bg-white border border-landing-altin/15 p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-20 bg-kdyesil flex items-center justify-center flex-shrink-0">
              <span className="font-arapca text-2xl text-landing-altin">ك</span>
            </div>
            <div>
              <h3 className="font-cormorant text-lg text-kdyesil leading-tight mb-1">
                {e.baslik}
              </h3>
              <p className="font-roboto text-xs text-landing-altin">{e.yazar}</p>
            </div>
          </div>
          <p className="font-roboto text-sm text-ikincil leading-relaxed">
            {e.aciklama}
          </p>
          <p className="font-roboto text-xs text-landing-altin/70 mt-4">{e.kaynak_kodu}</p>
        </article>
      ))}
    </div>
  );
}

function MakaleGrid({ makaleler }: { makaleler: Makale[] }) {
  if (!makaleler.length) {
    return (
      <p className="text-center text-ikincil font-roboto">
        Yeni makaleler hazırlanıyor.
      </p>
    );
  }
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {makaleler.map((m) => (
        <a
          key={m.slug}
          href={`/makale/${m.slug}`}
          className="bg-white border border-landing-altin/15 p-6 hover:border-landing-altin/40 transition-all block"
        >
          {m.kategori && (
            <p className="font-roboto text-xs uppercase tracking-wider text-landing-altin mb-3">
              {m.kategori}
            </p>
          )}
          <h3 className="font-cormorant text-xl text-kdyesil leading-tight mb-3">
            {m.baslik}
          </h3>
          {m.ozet && (
            <p className="font-roboto text-sm text-ikincil leading-relaxed line-clamp-3">
              {m.ozet}
            </p>
          )}
        </a>
      ))}
    </div>
  );
}
