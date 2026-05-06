import { getSupabaseServer } from '@/lib/supabase/server';
import type { Hekim, Makale, LandingStats, EserKart } from './types';

const FALLBACK_STATS: LandingStats = {
  kaynak: 100,
  chunk: 71900,
  bitki: 1588,
  makale: 5,
};

const ESER_VITRINI: EserKart[] = [
  {
    kaynak_kodu: 'SRC-001',
    baslik: 'el-Kânûn fi\u2019t-Tıbb',
    yazar: 'İbn Sînâ',
    aciklama:
      'Klasik tıbbın anayasası; Ortaçağ Avrupa tıp eğitiminin altı yüzyıllık ders kitabı.',
  },
  {
    kaynak_kodu: 'SRC-007',
    baslik: 'Tahbîzü\u2019l-Mathûn',
    yazar: 'Tokatlı Mustafa Efendi',
    aciklama:
      'el-Kânûn\u2019un en geniş Osmanlıca şerhi; beş cilt, sahanın referans metni.',
  },
  {
    kaynak_kodu: 'SRC-010',
    baslik: 'el-Hâvî',
    yazar: 'Râzî',
    aciklama:
      'Vaka kayıtlarının ansiklopedisi; klinik gözlem geleneğinin temel eseri.',
  },
  {
    kaynak_kodu: 'SRC-021',
    baslik: 'el-Külliyyât',
    yazar: 'İbn Rüşd',
    aciklama:
      'Tıbbın felsefi temelleri; teori ve pratiğin birleştiği derli toplu eser.',
  },
  {
    kaynak_kodu: 'SRC-024',
    baslik: 'Men lâ Yahduruhü\u2019t-Tabîb',
    yazar: 'Râzî',
    aciklama:
      'Hekimi olmayanlar için kılavuz; halk tıbbının sistematik el kitabı.',
  },
  {
    kaynak_kodu: 'SRC-025',
    baslik: 'Menâfi\u2019u\u2019l-Ağziye',
    yazar: 'Râzî',
    aciklama:
      'Gıda ve sağlık; yiyeceklerin mizaç üzerindeki etkisinin sistematik dökümü.',
  },
];

export async function fetchLandingData() {
  const supabase = getSupabaseServer();

  const [chunkRes, karakterRes, bitkiRes, makaleRes, hekimRes] = await Promise.all([
    supabase.from('klasik_kaynaklar').select('*', { count: 'exact', head: true }),
    supabase.from('karakter_kaynaklar').select('*', { count: 'exact', head: true }),
    supabase.from('bitkiler').select('*', { count: 'exact', head: true }),
    supabase
      .from('makaleler')
      .select('slug, baslik, ozet, kategori, olusturulma')
      .eq('yayinda', true)
      .order('olusturulma', { ascending: false })
      .limit(4),
    supabase
      .from('hekim_biyografileri')
      .select('slug, isim, isim_ar, dogum_olum, biyografi, eserler, sira')
      .eq('aktif', true)
      .order('sira', { ascending: true })
      .limit(5),
  ]);

  const chunkSayisi =
    (chunkRes.count ?? 0) + (karakterRes.count ?? 0) || FALLBACK_STATS.chunk;

  // Distinct kaynak_kodu count'u landing_stats view'ından gelmiyorsa hardcoded fallback
  let kaynakSayisi = FALLBACK_STATS.kaynak;
  try {
    const { data: viewData } = await supabase
      .from('landing_stats')
      .select('kaynak_sayisi')
      .single<{ kaynak_sayisi: number }>();
    if (viewData && typeof viewData.kaynak_sayisi === 'number') {
      kaynakSayisi = viewData.kaynak_sayisi;
    }
  } catch {
    // view kurulmamışsa fallback'e düş
  }

  const stats: LandingStats = {
    kaynak: kaynakSayisi,
    chunk: chunkSayisi,
    bitki: bitkiRes.count ?? FALLBACK_STATS.bitki,
    makale: makaleRes.data?.length ?? 0,
  };

  const hekimler: Hekim[] = (hekimRes.data ?? []).map(
    (h: {
      slug: string;
      isim: string;
      isim_ar: string | null;
      dogum_olum: string | null;
      biyografi: string | null;
      eserler: string[] | null;
    }) => ({
      slug: h.slug,
      isim: h.isim,
      isim_ar: h.isim_ar,
      dogum_olum: h.dogum_olum,
      biyografi: h.biyografi,
      eserler: h.eserler,
    })
  );

  const makaleler: Makale[] = (makaleRes.data ?? []).map(
    (m: {
      slug: string;
      baslik: string;
      ozet: string | null;
      kategori: string | null;
    }) => ({
      slug: m.slug,
      baslik: m.baslik,
      ozet: m.ozet,
      kategori: m.kategori,
    })
  );

  return {
    stats,
    hekimler,
    makaleler,
    eserler: ESER_VITRINI,
  };
}
