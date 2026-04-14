"""
makaleler tablosundaki 5 makalenin icerik alanini gunceller.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import httpx
from supabase import create_client

load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

sb = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)
sb.postgrest.session = httpx.Client(
    base_url=f"{os.environ['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1",
    headers=sb.postgrest.session.headers,
    http2=False,
    timeout=httpx.Timeout(60.0),
)


# ── 1. Mizaç Teorisi ────────────────────────────────────────
MIZAC_ICERIK = """Klasik İslam tıbbının merkezinde tek bir soru durur: İnsan bedeni neden hastalanır?

Cevap, dört hılt teorisinde gizlidir. Dem (kan), balgam, sarı safra ve kara safra — bu dört sıvı bedenin temel yapı taşlarıdır. Galenos'tan İbn Sînâ'ya uzanan çizgide her büyük hekim bu teoriye yaslanmış, onu genişletmiş, pratiğe uyarlamıştır.

Her hıltın kendine özgü bir mizacı vardır: Dem ılık ve nemlidir; ilkbaharın ruhunu taşır. Balgam soğuk ve nemlidir; kışın ağırlığını yansıtır. Sarı safra sıcak ve kurudur; yazın yakıcılığını bünyesinde barındırır. Kara safra soğuk ve kurudur; sonbaharın hüznüyle özdeşleşir.

Sağlık bu dört hıltın dengesidir. Hastalık ise dengenin bozulmasıdır.

İbn Sînâ el-Kânûn'un birinci kitabında mizaç teorisini şu ilkeye bağlar: Her insanın doğuştan baskın bir hıltı vardır ve bu fıtrî mizaç hayat boyunca sabit kalır. Hekimin görevi, hastanın fıtrî mizacını tespit etmek, şu anki hâlî mizacıyla kıyaslamak ve tedaviyi bu sapmanın kapandığı noktaya yönlendirmektir. Tedavi semptomu bastırmaz; bedeni kendi özüne döndürür.

Mevsimler bu teorinin doğal sınavıdır. İlkbahar dem hıltının arttığı mevsimdir; kanın coştuğu, neşenin yükseldiği, alerjilerin ve deri döküntülerinin ortaya çıktığı dönemdir. Yaz sarı safrayı güçlendirir; ateşli hastalıklar, bağırsak yangıları ve öfke bu mevsimde yoğunlaşır. Sonbahar kara safrayı öne çıkarır; eklem ağrıları, melankoli ve hazım bozuklukları sonbaharın mührünü taşır. Kış balgamın hâkimiyetidir; soğuk algınlıkları, nezle ve balgamlı öksürükler kışın kaçınılmaz armağanıdır.

Tahbîzü'l-Mathûn'da Tokatlı Mustafa Efendi bu mevsimsel ilişkiyi şöyle özetler: Hâlî mizaç mevsimin doğal akışıyla örtüşüyorsa hastalık şiddetlenir; karşı yönde ise mevsim bir denge unsuru işlevi görür.

Klinik pratikte mizaç tespiti üç kanaldan yapılır: nabız, idrar ve dil/yüz muayenesi. İbn Nefîs el-Şâmil'de bu prensibi şöyle koyar: Tek belirti yanıltır; üç kanalın aynı hıltı işaret etmesi teşhisi güvenilir kılar. Gözlemin kitapla çelişmesi hâlinde gözleme güvenilir.

Tedavide sıra şöyledir: Önce beslenmeyle denge kurulmaya çalışılır. Gıda yetmezse tek bitkiyle destek sağlanır. Birden fazla belirti varsa ancak o zaman bileşik formüle başvurulur. Er-Râzî el-Hâvî'de bu ilkeyi şöyle dile getirir: Tedaviye gıdadan başla, basit bitkiyle sürdür, terkibe en son başvur — çünkü bileşik formül belirsiz etki doğurur."""


# ── 2. Nabız Sıfatları ──────────────────────────────────────
NABIZ_ICERIK = """İbn Sînâ nabzı bir pencere olarak görür: Bedenin iç dünyasını dışarıdan okumanın en güvenilir yolu.

El-Kânûn'un üçüncü kitabında nabız ilmine ait en kapsamlı bölümlerden birini kaleme alır. Nabzın dokuz sıfatını tanımlar; her sıfatın hangi hılt durumuna, hangi organ işlevine, hangi hastalığa işaret ettiğini ayrıntılı biçimde açıklar.

Büyüklük nabzın üç boyutunu kapsar: boy (uzunluk), en (genişlik) ve derinlik. Büyük nabız bedenin ısısını ve hayvanî ruhun gücünü yansıtır. Küçük nabız zayıflığa ya da tıkanıklığa işaret eder.

Kuvvet, kalbin kasılma gücünü ölçer. Güçlü nabız sağlıklı bir kalbi ve dengeli bir ısıyı gösterir. Zayıf nabız yorgunlukta, büyük kanamanın ardından ya da kronik hastalığın ileri döneminde görülür.

Hız nabzın vuruş sayısını belirtir. Hızlı nabız ateş ya da şiddetli heyecanın habercisidir. Çok yavaş nabız derin melankoli veya bedensel soğumaya işaret edebilir.

Dolgunluk hılt miktarının göstergesidir. Dolu nabız sıvı fazlalığını, boş nabız ise hılt eksikliğini müjdeler.

Sertlik damar duvarının gerilimini yansıtır. Sert nabız kara safra baskınlığında görülür. Yumuşak nabız balgam fazlalığına işaret eder.

Isı deriye temas eden nabzın sıcaklığını ölçer. Sıcak nabız yangıda ve ateşte belirginleşir. Soğuk nabız beden ısısının tehlikeli biçimde düşmesiyle ortaya çıkar.

Ritim nabzın vuruşlar arasındaki düzenini tanımlar. Düzensiz nabız kalp kökenli sorunları ya da sinir sisteminin yorgunluğunu işaret eder.

Eşitlik art arda gelen her vuruşun birbirine yakınlığını ölçer. Eşit nabız genel sağlık ve dengenin göstergesidir.

Süreklilik nabzın kesintisiz akışını değerlendirir. Kesik kesik gelen nabız ağır hastalığın belirtisi olabilir.

İbn Nefîs el-Şâmil'de bu dokuz sıfatı klinik bir tabloya dönüştürür. Nabız tek başına yorumlanmaz; idrar rengi ve kıvamı, dil rengi ve kaplaması, yüz teni ve göz altının görünümüyle birlikte değerlendirilir. Bu üç kanalın aynı hıltı işaret etmesi teşhisi güvenilir kılar. Kanallarda çelişki varsa hekim gözlemine güvenir; el-Kânûn'un yazdığı ikinci planda kalır.

Nabız muayenesi istirahatte, sabah vakti ve mümkünse tok karnında yapılır. Koşu, öfke ve ağır yemek nabzı yanıltır. Hekim sol eliyle hastanın sağ bileğini tutar; parmak uçlarıyla üç ayrı noktadan — yüzeysel, orta ve derin — basınç uygular."""


# ── 3. Besin-Mizaç ──────────────────────────────────────────
BESIN_ICERIK = """Er-Râzî el-Hâvî'de şu cümleyi tekrarlar: Tedaviye gıdadan başla.

Bu ilke, klasik İslam tıbbının beslenmeye bakışını özetler. Gıda en güvenilir ilaçtır; bedeni yavaş ve kalıcı biçimde değiştirir, ani tepki vermez, yan etki üretmez. Hekimin elindeki en büyük araç mutfaktadır.

Beslenme önerisi her zaman hastanın hılt dengesine göre şekillenir. Fazla olan hıltın karşıtı özellikteki gıdalar tercih edilir; eksik olan desteklenir.

Dem hıltı baskınsa, yani kan fazlalığı varsa: Soğutucu ve hafif kurutucu gıdalar seçilir. Nar, ayva, koruk, limon, taze sebzeler ve otlar uygundur. Kırmızı et, şeker, sıcak baharatlar ve içki zararlıdır. Tahbîzü'l-Mathûn bu dönemde meyve ağırlıklı beslenmeyi, özellikle ilkbaharda kan temizleyici otları önerir.

Balgam hıltı fazlaysa: Isıtıcı ve kurutucu gıdalar seçilir. Zencefil, tarçın, karabiber, hardal ve kekik balgamı keser ve harekete geçirir. Soğuk ve ağır gıdalar — süt, kavun, karpuz, fazla yoğurt — balgamı artırır ve sakıncalıdır. Bu mizaçta özellikle sabah gıdaların ısıtılmış ya da baharatlı tüketilmesi tavsiye edilir.

Sarı safra baskınsa: Soğutucu ve nemlendirici gıdalar gerekir. Hindistan cevizi, papatya çayı, salatalık, marul, semizotu ve nane dengeleyicidir. Kızartma, kırmızı et, ekşi gıdalar ve keskin baharatlar tehlikelidir. Bu mizaç için yaz aylarında özellikle dikkatli olunmalıdır; mevsim zaten sarı safrayı artırır.

Kara safra fazlaysa: Isıtıcı ve nemlendirici gıdalar seçilir. Bal, taze incir, üzüm, bademli ılık süt ve tavuk suyu uygundur. Kuru baklagiller, tuzlu gıdalar ve ağır etler sakıncalıdır. Sonbahar bu mizaç için en riskli mevsimdir.

Er-Râzî mide ve sindirim sağlığına ayrı bir önem verir. El-Hâvî'nin beslenme bölümlerinde şu ilkeyi sık tekrarlar: Mide bütün hastalıkların evidir; perhiz ise ilaçların başıdır. Tokluk iken yemek, hazım tamamlanmadan üstüne yemek ve öfkeli hâlde yemek mideni yıkar.

İbn Sînâ az yemenin erdemine özel bir bölüm ayırır. El-Kânûn'da şöyle yazar: İki öğün yeterlidir; her ikisi arasında tam bir sindirimin geçmesi şarttır. Gece geç yemek ağır bir uyku getirir, hazım bozulur, kara safra artar."""


# ── 4. Kalp Hastalıkları ────────────────────────────────────
KALP_ICERIK = """İmam Gazzâlî İhyâu Ulûmi'd-Dîn'in Kalbi Mahveden Şeyler bölümünde şöyle yazar: Beden illetleri çoğu zaman ruhun illetlerinin yansımasıdır. Hekim bedeni tedavi eder; fakat ruh hasta kaldıkça beden bir süre sonra yeniden hastalanır.

Klasik İslam tıbbı bu ikiliği hiçbir zaman keskin çizmez. Nabzı ölçen hekim aynı zamanda hastanın ruh hâlini sorar. Çökkünlük, aşırı korku, kronik öfke, uyku bozuklukları — bunlar hılt dengesizliğinin göstergeleri olduğu kadar ruhsal yükün de işaretleridir.

Gazzâlî kalp hastalıklarını dörde ayırır.

Kibir ve ucb (kendini beğenmişlik): Nefsin sürekli tetikte olmasına yol açar. Bu uyanıklık bedensel gerginliğe, uyku bozukluğuna ve kronik baş ağrısına dönüşür. Modern tıbbın tanımladığı süregelen stres hâlinin tam karşılığıdır; sempatik sinir sistemi dinlenmez, kortizol düzeyi düşmez.

Hased: Başkasının nimetine kızgınlıktır. Gazzâlî şöyle der: Haset eden önce kendini yer. Karaciğer ve safra sistemi üzerine binen bu yük, sarı safrayı artırır; sarılık eğilimi, hazım bozuklukları ve deri sorunlarına zemin hazırlar.

Dünya sevgisi (hubb-ı dünya): Geçici olana aşırı bağlanma, kalbi sürekli meşgul eder ve uykuyu kaçırır. Sinir sistemi için süregelen bir yüktür. Uyku düzensizleşince balgam artar; balgam artınca zihinsel bulanıklık, yorgunluk ve bağışıklık zayıflığı peşinden gelir.

Öfke (gadab): Er-Râzî el-Hâvî'de öfke anında nabzın sertleştiğini ve ısındığını kaydeder. Kontrolsüz öfke kalp ve damar sistemi üzerindeki baskıyı artırır; tekrarlandıkça bu baskı kronik bir tablo hâline gelir.

Gazzâlî bu hastalıkların tedavisinde üç yol önerir. Muhasebe: Kişinin kendi nefsini hesaba çekmesi, hangi duygunun içini ne zaman kapladığını fark etmesidir. Riyâzet: Nefsi dizginlemek, alışkanlıkları kırmak, şükür ve kanaati egzersiz hâline getirmektir. Sohbet: İyi insanlarla birliktelik, kalbi yumuşatır ve yalnızlığın doğurduğu kara safrayı azaltır.

İbn Sînâ el-Kânûn'da melankoliyi müstakil bir bölümde inceler. Tedavisinde ilaçların yanı sıra müziği, güzel manzarayı ve sevilen insanlarla görüşmeyi açıkça önerir. Bu öneri modern psikolojinin çevre terapisi kavramını sekiz yüz yıl önceden karşılar."""


# ── 5. Zehrâvî Cerrahi ──────────────────────────────────────
CERRAHI_ICERIK = """Ez-Zehravî, et-Tasrîf li-men Aceze ani't-Te'lîf adlı eserinin otuzuncu makalesinde tarihin ilk sistematik cerrahi atlasını ortaya koyar. Yüz seksen cerrahi aleti çizer, tarif eder ve her birinin hangi operasyonda, nasıl kullanılacağını adım adım açıklar. Bu çizimler yüzyıllar boyunca Avrupa cerrah okullarının temel ders materyali oldu.

Ez-Zehravî'nin Kurtuba'da geçirdiği yaklaşık elli yıllık klinik pratik bu eserin arkasındadır. Kitap öğrenilmiş bilginin değil, yaşanmış deneyimin ürünüdür.

Katarakt ameliyatında lens yerinden oynatma (reclinatio) yöntemini ayrıntılı biçimde tarif eder. Kullanılan iğnenin biçimi, hastanın pozisyonu ve ameliyat sonrası bakım protokolü et-Tasrîf'te yer alır. Bu yöntem Avrupa'da yaklaşık beş yüz yıl boyunca standart katarakt prosedürü olarak uygulandı.

Tiroit bölgesindeki kitlerin cerrahi çıkarılması, damarların bağlanma teknikleri ve yara bakımı da bu eserde tarif edilmiştir. Boyun cerrahisine dair sistematik ilk kaynaktır.

İdrar yolu taşlarının kırılarak ve parçalanarak çıkarılması operasyonu — bugün litotripsi denen müdahale — et-Tasrîf'te ilk kez sistematik biçimde anlatılmıştır. Kullanılan aletlerin çizimleri günümüze ulaşmıştır.

Diş hekimliğini cerrahi bir disiplin olarak ele alan ilk eserdir et-Tasrîf. Diş çekimi teknikleri, diş eti operasyonları ve ağız içi kistlerin giderilmesi bu kitapta yer alır.

Zor doğum durumlarında kullanılan obstetrik aletler ve el yöntemleri de ayrıntılı biçimde tarif edilir; ters gelen bebek için kullanılan müdahale yöntemi bugünkü doğum hekimliğinin öncüllerindendir.

et-Tasrîf XII. yüzyılda Gerard of Cremona tarafından Latince'ye çevrildi. Bu çeviri Batı Avrupa cerrahi geleneğinin temel kaynağı hâline geldi. Fransa'da cerrahinin babası sayılan Guy de Chauliac, 1363 tarihli Chirurgia Magna adlı eserinde Ez-Zehravî'nin adını iki yüzden fazla zikreder. Venedik ve Strazburg'da XV. ve XVI. yüzyıllarda defalarca basıldı.

William Harvey de 1628 tarihli De Motu Cordis'te Ez-Zehravî'den alıntı yapar. Cerrahiyi zanaattan bilime dönüştüren bu eser, İslam tıbbının Batı tıbbına bıraktığı en somut ve en ölçülebilir mirastır."""


GUNCELLEMELER = [
    ("mizac-teorisi",    MIZAC_ICERIK),
    ("nabiz-sifatlari",  NABIZ_ICERIK),
    ("besin-mizac",      BESIN_ICERIK),
    ("kalp-hastaliklari", KALP_ICERIK),
    ("zehravi-cerrahi",  CERRAHI_ICERIK),
]


def main():
    basarili = 0
    eksik    = 0
    hata     = 0

    for slug, icerik in GUNCELLEMELER:
        print(f"\n── {slug}")
        print(f"   icerik: {len(icerik)} karakter")

        try:
            resp = sb.table("makaleler") \
                     .update({"icerik": icerik}) \
                     .eq("slug", slug) \
                     .execute()
            if resp.data:
                basarili += 1
                print(f"   ✓ Güncellendi")
            else:
                eksik += 1
                print(f"   [!] Tabloda bulunamadı (slug='{slug}')")
        except Exception as e:
            hata += 1
            print(f"   [!] HATA: {e}")

    print(f"\n{'=' * 50}")
    print(f"Başarılı     : {basarili}")
    print(f"Bulunamadı   : {eksik}")
    print(f"Hata         : {hata}")
    print(f"Toplam istek : {len(GUNCELLEMELER)}")


if __name__ == "__main__":
    main()
