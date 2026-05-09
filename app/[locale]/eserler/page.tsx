import type { Metadata } from "next";
import { ESER_VITRINI } from "@/lib/landing/data";
import { EserGrid } from "@/components/landing/HazineSection";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Klasik Tıbbın Eserleri | İpek Yolu Şifacısı",
  description:
    "Klasik İslam tıp külliyatından doksan sekiz eser; her biri kendi metinleriyle aranabilir, alıntılanabilir.",
};

export default function EserlerPage() {
  const eserler = ESER_VITRINI;

  return (
    <div className="bg-landing-krem min-h-screen">
      <LandingHeader />

      <main>
        <section className="bg-landing-krem py-20 md:py-28 border-b border-landing-altin/10">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="font-roboto text-sm tracking-[0.2em] uppercase text-landing-altin mb-4">
              Eserler
            </p>
            <h1 className="font-cormorant text-4xl md:text-5xl text-kdyesil leading-tight mb-6">
              Klasik Tıbbın Eserleri
            </h1>
            <p className="font-roboto text-lg text-ikincil leading-relaxed">
              Klasik İslam tıp külliyatından doksan sekiz eser; her biri kendi
              metinleriyle aranabilir, alıntılanabilir.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <EserGrid eserler={eserler} />

            <div className="mt-12 max-w-3xl mx-auto border-l-2 border-landing-altin pl-5 py-3 bg-acikaltin/30">
              <p className="font-roboto text-sm text-ikincil leading-relaxed">
                Tüm 98 kaynağın listesi ve her birinin tam metni yakında bu
                sayfada yayınlanacaktır.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
