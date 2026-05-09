import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { MakaleGrid } from "@/components/landing/HazineSection";
import type { Makale } from "@/lib/landing/types";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Makaleler | İpek Yolu Şifacısı",
  description:
    "Klasik tıp külliyatından bugüne; makaleler, kısa yorumlar, alıntılar.",
};

async function fetchMakaleler(): Promise<Makale[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("makaleler")
    .select("slug, baslik, ozet, kategori, olusturulma")
    .eq("yayinda", true)
    .order("olusturulma", { ascending: false });

  if (error) {
    console.error("[makaleler] fetch error", error);
    return [];
  }

  return (data ?? []).map(
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
}

export default async function MakalelerPage() {
  const makaleler = await fetchMakaleler();

  return (
    <div className="bg-landing-krem min-h-screen">
      <LandingHeader />

      <main>
        <section className="bg-landing-krem py-20 md:py-28 border-b border-landing-altin/10">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="font-roboto text-sm tracking-[0.2em] uppercase text-landing-altin mb-4">
              Makaleler
            </p>
            <h1 className="font-cormorant text-4xl md:text-5xl text-kdyesil leading-tight mb-6">
              Klasik Tıbbın Makaleleri
            </h1>
            <p className="font-roboto text-lg text-ikincil leading-relaxed">
              Klasik tıp külliyatından bugüne; makaleler, kısa yorumlar,
              alıntılar.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <MakaleGrid makaleler={makaleler} />
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
