export type Hekim = {
  slug: string;
  isim: string;
  isim_ar: string | null;
  dogum_olum: string | null;
  biyografi: string | null;
  eserler: string[] | null;
};

export type Makale = {
  slug: string;
  baslik: string;
  ozet: string | null;
  kategori: string | null;
};

export type EserKart = {
  kaynak_kodu: string;
  baslik: string;
  yazar: string;
  aciklama: string;
  chunk_count?: number;
};

export type LandingStats = {
  kaynak: number;
  chunk: number;
  bitki: number;
  makale: number;
};

export type Mizac = 'demevî' | 'safravî' | 'sevdavî' | 'balgamî';
