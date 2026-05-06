'use client';
import { useEffect, useState } from 'react';

export default function MobilStickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-landing-krem border-t border-landing-altin/30 px-4 py-3 flex gap-2 z-30 transition-transform ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <a
        href="/analiz"
        className="flex-1 bg-kdyesil text-acikaltin font-roboto text-xs tracking-wider uppercase py-3 text-center"
      >
        Tam analiz
      </a>
      <a
        href="/mizac-tahmini"
        className="flex-1 border border-kdyesil text-kdyesil font-roboto text-xs tracking-wider uppercase py-3 text-center"
      >
        60 sn tahmin
      </a>
    </div>
  );
}
