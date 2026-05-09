import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { HekimGrid } from "@/components/landing/HazineSection";
import type { Hekim } from "@/lib/landing/types";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Klasik Tıbbın Hekimleri | İpek Yolu Şifacısı",
  description:
    "Klasik İslam tıp külliyatına yön veren hekimler; her birinin sayfasında biyografisi, eserleri ve yöntemi.",
};

async function fetchHekimler(): Promise<Hekim[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("hekim_biyografileri")
    .select("slug, isim, isim_ar, dogum_olum, biyografi, eserler, sira")
    .eq("aktif", true)
    .order("sira", { ascending: true });

  if (error) {
    console.error("[hekimler] fetch error", error);
    return [];
  }

  return (data ?? []).map(
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
}

export default async function HekimlerPage() {
  const hekimler = await fetchHekimler();

  return (
    <div className="bg-landing-krem min-h-screen">
      <LandingHeader />

      <main>
        <section className="bg-landing-krem py-20 md:py-28 border-b border-landing-altin/10">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="font-roboto text-sm tracking-[0.2em] uppercase text-landing-altin mb-4">
              Hekimler
            </p>
            <h1 className="font-cormorant text-4xl md:text-5xl text-kdyesil leading-tight mb-6">
              Klasik Tıbbın Hekimleri
            </h1>
            <p className="font-roboto text-lg text-ikincil leading-relaxed">
              Klasik İslam tıp külliyatına yön veren beş hekim; her birinin
              sayfasında biyografisi, eserleri ve yöntemi.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <HekimGrid hekimler={hekimler} />
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
