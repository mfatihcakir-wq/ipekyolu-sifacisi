'use client';
import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';

const NAV = [
  { href: '/analiz', label: 'Analiz' },
  { href: '/bitkiler', label: 'Bitkiler' },
  { href: '/hekimler', label: 'Hekimler' },
  { href: '/makale', label: 'Makaleler' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (isAdminEmail(u?.email)) setIsAdmin(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navLinks = isAdmin ? [...NAV, { href: '/dashboard', label: 'Yönetim' }] : NAV;

  return (
    <header className="sticky top-0 z-40 bg-landing-krem/90 backdrop-blur-md border-b border-landing-altin/15">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3" aria-label="Anasayfa">
          <Logo size={36} mode="header" showText={false} />
          <span className="font-cormorant text-lg text-kdyesil hidden sm:inline">
            İpek Yolu Şifacısı
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 font-roboto text-sm text-ikincil">
          {navLinks.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-kdyesil transition-colors">
              {n.label}
            </a>
          ))}
        </nav>

        <a
          href="/analiz"
          className="hidden md:inline-block bg-kdyesil text-acikaltin font-roboto text-xs tracking-wider uppercase px-5 py-2.5 hover:bg-landing-altin hover:text-kdyesil transition-colors"
        >
          Analize başla
        </a>

        <button
          className="md:hidden p-2 -mr-2"
          aria-label="Menü"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block w-6 h-px bg-kdyesil mb-1.5" />
          <span className="block w-6 h-px bg-kdyesil mb-1.5" />
          <span className="block w-4 h-px bg-kdyesil" />
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 top-16 bg-landing-krem z-30 flex flex-col">
          <nav className="flex flex-col p-8 gap-6 flex-1">
            {navLinks.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="font-cormorant text-3xl text-kdyesil"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="p-6 border-t border-landing-altin/20">
            <a
              href="/analiz"
              className="block bg-kdyesil text-acikaltin font-roboto text-sm tracking-wider uppercase px-5 py-4 text-center"
              onClick={() => setOpen(false)}
            >
              Analize başla
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
