const KESIFLER = [
  {
    yuzyil: 'IX. yüzyıl',
    klasik_terim: 'سرطان',
    klasik_tr: 'seretan',
    modern_karsilik: 'kanser',
    baslik: 'Yengeç ile gelen ad.',
    metin:
      'Klasik metinler kanseri \u201cseretan\u201d, yani yengeç olarak adlandırdı. İsim tesadüf değil; tedavide kullanılan başlıca madde de yengeçten elde ediliyordu. Bin yıl sonra tıp aynı kelimeyi (cancer) yine yengeç anlamıyla kullanıyor.',
    kaynak: 'Râzî, el-Hâvî · Cilt 4',
  },
  {
    yuzyil: 'XIII. yüzyıl',
    klasik_terim: 'الدورة الصغرى',
    klasik_tr: 'ed-devretu\u2019s-suğrâ',
    modern_karsilik: 'küçük kan dolaşımı',
    baslik: 'Harvey\u2019den üç yüz yıl önce.',
    metin:
      'İbn Nefîs 1242\u2019de, kanın akciğer üzerinden dolaştığını ayrıntısıyla yazdı. William Harvey aynı keşfi 1628\u2019de yapacaktı; aradaki üç yüz seksen altı yılda metin Şam\u2019da, Kahire\u2019de okunmaya devam ediyordu.',
    kaynak: 'İbn Nefîs, Şerhu Teşrîhi\u2019l-Kânûn',
  },
  {
    yuzyil: 'XI. yüzyıl',
    klasik_terim: 'بلادة',
    klasik_tr: 'belâdet',
    modern_karsilik: 'brain fog',
    baslik: 'Beyin yorgunluğunun klasik adı.',
    metin:
      'Modern tıbbın \u201cbrain fog\u201d olarak adlandırdığı tablo, klasik metinlerde balgamın beyne çıkması olarak tarif edilir. Tahbîzü\u2019l-Mathûn buna karşı \u201ckafa açıcı\u201d (mufettih) bitkilerin sıralandığı bir protokol verir; semptom listesi günümüz açıklamalarıyla neredeyse birebir örtüşür.',
    kaynak: 'Tahbîzü\u2019l-Mathûn · Cilt 2',
  },
];

export default function IddiaIspat() {
  return (
    <section className="bg-acikaltin py-24 md:py-32 border-t border-landing-altin/10">
      <div className="max-w-6xl mx-auto px-6">
        <header className="max-w-3xl mb-16">
          <p className="font-roboto text-sm tracking-[0.2em] uppercase text-landing-altin mb-4">
            Neden bu site
          </p>
          <h2 className="font-cormorant text-4xl md:text-5xl text-kdyesil leading-tight mb-6">
            Bu birikim kaybolmadı, sadece okunmaz oldu.
          </h2>
          <p className="font-roboto text-lg text-anametin leading-relaxed">
            Klasik tıp, sadece eski bir tıp değil; bugünkü tıbbı yıllarca,
            bazen yüzyıllarca öncelemiş bir tıp. Üç küçük örnek, binyıllık
            birikimin nasıl bir miras olduğunu gösteriyor.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {KESIFLER.map((k, i) => (
            <article
              key={i}
              className="bg-white border border-landing-altin/15 p-7 flex flex-col"
            >
              <p className="font-roboto text-[11px] uppercase tracking-[0.15em] text-landing-altin mb-4">
                {k.yuzyil}
              </p>

              <div className="mb-5 pb-5 border-b border-landing-altin/15">
                <p className="font-arapca text-2xl text-kdyesil leading-none mb-1">
                  {k.klasik_terim}
                </p>
                <p className="font-cormorant italic text-sm text-ikincil">
                  {k.klasik_tr} <span className="text-landing-altin">·</span>{' '}
                  {k.modern_karsilik}
                </p>
              </div>

              <h3 className="font-cormorant text-xl text-kdyesil leading-snug mb-3">
                {k.baslik}
              </h3>

              <p className="font-roboto text-[14px] leading-relaxed text-anametin flex-1">
                {k.metin}
              </p>

              <p className="font-roboto text-xs text-landing-altin/80 mt-5 pt-4 border-t border-landing-altin/15 italic">
                {k.kaynak}
              </p>
            </article>
          ))}
        </div>

        <p className="font-cormorant italic text-center text-lg text-ikincil mt-16 max-w-2xl mx-auto">
          Bu üç örnek bir deniz değil; denizden üç damla. Külliyat 71.928 metin
          parçası içeriyor; her analiz kendi damlasını çıkarıyor.
        </p>
      </div>
    </section>
  );
}
