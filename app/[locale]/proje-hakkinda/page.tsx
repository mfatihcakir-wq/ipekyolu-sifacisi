/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proje Hakkında | İpek Yolu Şifacısı",
  description:
    "İpek Yolu Şifacısı: klasik İslam ve Osmanlı tıp külliyatını yapay zekâ ile çağdaş okura erişilebilir kılan bir araştırma ve yayım girişimi.",
};

export default function ProjeHakkindaPage() {
  return (
    <main className="bg-landing-krem text-anametin">
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24 font-roboto">
        <header className="mb-12 md:mb-16">
          <h1 className="font-cormorant text-4xl md:text-5xl text-kdyesil leading-tight">
            Proje Hakkında
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ikincil">
            İpek Yolu Şifacısı, klasik İslam ve Osmanlı tıp külliyatını yapay
            zekâ ile çağdaş okura erişilebilir kılan bir araştırma ve yayım
            girişimidir.
          </p>
        </header>

        <p className="text-base leading-loose mb-8">
          Tahbîzü'l-Mathûn'dan Râzî'nin Men lâ Yahduruhü't-Tabîb'ine, Hekim
          Hayâtî'nin Şeceretü't-Tıb'ından İbn Sînâ'nın el-Kânûn'una uzanan
          binyıllık bir geleneği; modern bir arama, okuma ve farkındalık
          katmanına dönüştürüyoruz.
        </p>

        <section className="mt-12 mb-12">
          <h2 className="font-cormorant text-3xl text-kdyesil mb-4">
            Ne yapıyoruz
          </h2>
          <p className="text-base leading-loose">
            Bu sayfa şu an itibariyle yüz farklı klasik kaynaktan elli altı
            binin üzerinde metin parçası, bin beş yüze yakın bitki kaydı, dokuz
            hekim biyografisi ve yayımlanmış beş özgün makaleyi barındırıyor.
            Külliyat genişliyor; her hafta yeni metin eklenir, mevcut metinler
            iyileştirilir. Tüm içerik ücretsiz ve üyeliksiz erişime açıktır.
          </p>
        </section>

        <section className="mt-12 mb-12">
          <h2 className="font-cormorant text-3xl text-kdyesil mb-4">Neden</h2>
          <p className="text-base leading-loose mb-4">
            Klasik İslam tıbbı, son iki yüzyılda akademik bir çalışma alanı
            olarak korundu; fakat halkla bağı koptu. Tahbîzü'l-Mathûn gibi temel
            eserler, Türkçeye yalnızca uzmanlar için ulaşılabilir kaldı.
            Şeceretü't-Tıb gibi metinler hâlâ yazma halinde, bir tek
            kütüphanede. Râzî'nin pratik tıp metinleri Türkçeye hiç çevrilmedi.
          </p>
          <p className="text-base leading-loose">
            Bu boşluğu doldurmanın iki yolu var: birincisi, geleneksel akademik
            tercüme ve neşir; ikincisi, dijital külliyat ve yapay zekâ destekli
            arayüzler. Biz ikisini birden yürütüyoruz. Akademik tercüme
            projeleri (Râzî külliyatı, Bahrü'l-Cevâhir, Tahbîzü'l-Mathûn) basılı
            eserlere dönüşürken; aynı metinler ipekyolusifacisi.com üzerinden
            anlık aranabilir, bağlamlandırılabilir, alıntılanabilir hale
            geliyor.
          </p>
        </section>

        <section className="mt-12 mb-12">
          <h2 className="font-cormorant text-3xl text-kdyesil mb-4">Nasıl</h2>
          <p className="text-base leading-loose mb-4">
            Külliyatın her parçası, kaynak kodu (örneğin SRC-007 Tahbîz
            Osmanlıca, SRC-024 Râzî Men lâ Yahduruhü't-Tabîb), cilt ve sayfa
            bilgisiyle etiketlenir. Yapay zekâ aramaları doğrudan bu etiketler
            üzerinden çalışır; her sonuç, geldiği klasik kaynağa kadar
            izlenebilir. Modelin uydurma yapması teknik olarak engellenmiştir:
            cevap yalnızca veritabanındaki gerçek metinden üretilir, kaynağı
            gösterilir, doğrulanabilir.
          </p>
          <p className="text-base leading-loose">
            Site bir tıbbî teşhis ya da tedavi aracı değildir. Klasik metinleri
            okumak, geleneği tanımak ve mizaç farkındalığı kazanmak için
            tasarlanmıştır. Sağlık sorunlarında her zaman hekime
            başvurulmalıdır.
          </p>
        </section>

        <section className="mt-12 mb-12">
          <h2 className="font-cormorant text-3xl text-kdyesil mb-4">
            Yürütücü
          </h2>
          <p className="text-base leading-loose mb-4">
            Mehmet Fatih Çakır; klasik İslam tıbbı tarihi alanında doktora
            adayıdır (FSM Vakıf Üniversitesi, Fuat Sezgin İslam Bilim Tarihi
            Enstitüsü; danışman Prof. Dr. Mustafa Kaçar). Yüksek lisans tezi,
            Hekim Ahmet el-Hayâtî'nin Şeceretü't-Tıb adlı eseri (Topkapı III.
            Ahmed 2045) üzerinedir; bu eserin akademik dünyada ilk bilimsel
            çalışmasıdır.
          </p>
          <p className="text-base leading-loose mb-4">
            Yayımlanmış on dörde yakın kitabı, yedi tercümesi ve elliyi aşkın
            seminer katılımı bulunmaktadır. 2013-2019 arasında Frankfurt,
            Bologna, Kahire ve Beyrut kitap fuarlarında editör ve yayın
            koordinatörü olarak görev almıştır. Klasik Arapça, Farsça ve
            Osmanlı Türkçesi ileri seviyede; İngilizce orta seviyede.
          </p>
          <p className="text-base leading-loose">
            Proje şu an tek kişilik bir araştırma ve yayım girişimi olarak
            yürütülmektedir. Belirli iş paketleri için (akademik editörlük, dil
            kontrolü, görsel tasarım) dışarıdan profesyonellerle çalışılır.
          </p>
        </section>

        <section className="mt-12 mb-12">
          <h2 className="font-cormorant text-3xl text-kdyesil mb-4">
            Finansman
          </h2>
          <p className="text-base leading-loose mb-4">
            Proje şu an itibariyle bağımsız olarak yürütülmektedir. Doğrudan dış
            sponsor, devlet hibesi veya kurumsal yatırım yoktur; site ve
            veritabanı altyapısı kişisel kaynaklarla finanse edilir. Akademik
            tercüme projelerinin basımı için Barakat Trust, FSM BAP ve Gerda
            Henkel Stiftung gibi kuruluşlara fon başvuruları yapılmıştır; bu
            başvurular yalnızca ilgili tercüme eserlerin matbu yayımına
            yöneliktir, web sitesinin işletmesini kapsamaz.
          </p>
          <p className="text-base leading-loose">
            İçerik ücretsizdir, reklam gösterilmez, kullanıcı verisi satılmaz.
            İleride MİZAN mobil uygulamasının belirli özellikleri ücretli
            olabilir; web sitesindeki klasik metin arşivi her zaman açık ve
            ücretsiz kalacaktır.
          </p>
        </section>

        <section className="mt-12 mb-12">
          <h2 className="font-cormorant text-3xl text-kdyesil mb-4">
            Veri ve Gizlilik
          </h2>
          <p className="text-base leading-loose mb-4">
            Site ziyaretçilerinden kişisel veri toplanmaz. Üyelik gerektirmez;
            mizaç tahmin testi anonim çalışır, sonuçlar tarayıcıda kalır,
            sunucuya kalıcı olarak yazılmaz. Yapay zekâ aramalarında girilen
            sorgular hizmetin işleyişi için geçici olarak işlenir; kalıcı
            kullanıcı profili oluşturulmaz.
          </p>
          <p className="text-base leading-loose">
            İleride üyelik açılırsa (özellikle MİZAN mobil uygulaması
            bağlamında), KVKK ve GDPR uyumlu açık rıza süreciyle
            yürütülecektir; ayrı bir gizlilik metni yayımlanacaktır.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-cormorant text-3xl text-kdyesil mb-4">
            İletişim
          </h2>
          <p className="text-base leading-loose mb-4">
            Akademik işbirliği, basın talebi, içerik düzeltmesi ya da kaynak
            önerisi için:
          </p>
          <ul className="text-base leading-loose space-y-2 list-none pl-0">
            <li>
              WhatsApp:{" "}
              <a
                href="https://wa.me/447418600856"
                target="_blank"
                rel="noopener noreferrer"
                className="text-landing-altin hover:underline"
              >
                +44 7418 600856
              </a>
            </li>
            <li>
              E-posta:{" "}
              <a
                href="mailto:m.fatih.cakir@gmail.com"
                className="text-landing-altin hover:underline"
              >
                m.fatih.cakir@gmail.com
              </a>
            </li>
            <li>
              Instagram:{" "}
              <a
                href="https://instagram.com/ipekyolusicfacisi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-landing-altin hover:underline"
              >
                @ipekyolusicfacisi
              </a>
            </li>
          </ul>
          <p className="text-base leading-loose mt-4">
            Doğrudan WhatsApp veya e-posta tercih edilir.
          </p>
        </section>
      </article>
    </main>
  );
}
