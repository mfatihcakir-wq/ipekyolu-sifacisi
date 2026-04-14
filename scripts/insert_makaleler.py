"""
makaleler tablosuna 5 makale ekler.
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
MIZAC_ICERIK = """Klasik İslam tıbbının merkezinde bir soru durur: İnsan bedeni neden hastalanır?

Cevap, dört hılt teorisinde aranır. Dem (kan), balgam, sarı safra ve kara safra — bu dört sıvı bedenin temel yapı taşlarıdır. Her birinin kendine özgü mizacı vardır: dem ılık ve nemli, balgam soğuk ve nemli, sarı safra sıcak ve kuru, kara safra soğuk ve kurudur.

Sağlık, bu dört hıltın dengede olmasıdır. Hastalık ise bu dengenin bozulmasıdır.

**Mevsimler ve Hıltlar**

İbn Sînâ el-Kânûn'da mevsim-hılt ilişkisini şöyle kurar: İlkbahar dem hıltının arttığı mevsimdir; bedenin canlandığı, kanın coştuğu dönemdir. Yaz sarı safrayı güçlendirir; ateşli hastalıkların yaz aylarında yoğunlaşması tesadüf değildir. Sonbahar kara safrayı öne çıkarır; melankoli ve eklem ağrıları bu mevsimde artış gösterir. Kış ise balgamın hâkimiyetidir; soğuk algınlıkları, nezle ve balgamlı öksürükler kışın damgasıdır.

**Mizaç Tipleri**

Her insanın doğuştan baskın bir hıltı vardır — buna fıtrî mizaç denir. Demevî mizaç sahipleri genellikle neşeli, sosyal ve kırmızı tenlidir. Balgamî mizaçlılar sakin, ağır ve solgun görünümlüdür. Safrâvî tipler hızlı, sinirli ve ince yapılıdır. Sevdâvî (melankolik) tipler ise düşünceli, hassas ve koyu tenli olma eğilimindedir.

**Klinikteki Yeri**

Hekim, hastayı muayene ederken nabzı, idrar rengini, dil görünümünü ve yüz rengini birlikte değerlendirir. Bu üç kanal — nabız, idrar, dil/yüz — aynı hıltı işaret ediyorsa teşhis güvenilirdir. Çelişki varsa İbn Nefîs'in kuralı geçerlidir: Gözleminle kitabın çatışırsa gözlemine güven.

Tedavi, fazlalık varsa fazlalığı gidermek, eksiklik varsa eksikliği tamamlamak üzerine kuruludur. Er-Râzî şunu der: Tedaviye gıdadan başla, ilaçla bitir."""


# ── 2. Nabız Sıfatları ──────────────────────────────────────
NABIZ_ICERIK = """İbn Sînâ, nabzı dokuz sıfatla tarif eder. Bu dokuz sıfat, modern tıbbın laboratuvar testlerinin yerini tutan klinik bir haritadır.

**Nabzın Dokuz Sıfatı**

Büyüklük (boy, en, derinlik): Büyük nabız güçlü hayvanî ruhu gösterir. Küçük nabız zayıflık veya tıkanıklık işaretidir.

Kuvvet: Güçlü nabız beden ısısının yüksekliğine, kalbin gücüne işaret eder. Zayıf nabız yorgunluk, kanamanın ardından veya kronik hastalıkta görülür.

Hız: Hızlı nabız ateş veya heyecan belirtisidir. Yavaş nabız soğukluk veya derin depresyon işaretini taşır.

Dolgunluk: Dolu nabız hılt fazlalığına, boş nabız hılt eksikliğine işaret eder.

Sertlik: Sert nabız kara safra baskınlığını; yumuşak nabız balgam fazlalığını gösterir.

Isı: Sıcak nabız yangı ve ateşle; soğuk nabız beden ısısının düşüşüyle ilişkilidir.

Ritim (intizamlılık): Düzensiz nabız kalp veya sinir kökenli sorunları işaret eder.

Eşitlik: Nabız vuruşlarının birbirine eşitliği genel sağlığın göstergesidir.

Süreklilik: Kesik kesik nabız ağır hastalığa işaret eder.

**Üç Kanal Prensibi**

İbn Nefîs el-Şâmil'de şu prensibi koyar: Nabız tek başına yanıltabilir. Doğru teşhis için üç kanalın — nabız, idrar, dil/yüz — aynı hıltı göstermesi gerekir. Kanallar çelişiyorsa gözleme güvenilir, kitaba değil.

Nabız ölçümü sabah, tok karnına ve istirahatte yapılır. Koşu, öfke veya tok mide nabzı yanıltır."""


# ── 3. Besin-Mizaç ──────────────────────────────────────────
BESIN_ICERIK = """Er-Râzî, el-Hâvî'nin beslenme bölümlerinde şu prensibi tekrarlar: Tedaviye gıdadan başla.

Besin, en güvenilir ilaçtır. Çünkü bedeni yavaş ve kalıcı değiştirir; ani tepki vermez, yan etki üretmez. Hekimin elindeki en büyük silah mutfaktadır.

**Dört Hılt, Dört Sofra**

Dem hıltı baskınsa (demevî mizaç): Soğutucu ve kurutucu gıdalar tercih edilir. Nar, ayva, limon, kekik, reyhan uygundur. Kırmızı et, şeker ve sıcak baharatlardan kaçınılır.

Balgam hıltı fazlaysa (balgamî mizaç): Isıtıcı ve kurutucu gıdalar seçilir. Zencefil, tarçın, karabiber, hardal balgamı keser. Soğuk ve ağır gıdalar — süt, kavun, yoğurt — sakıncalıdır.

Sarı safra baskınsa (safrâvî mizaç): Soğutucu ve nemlendirici gıdalar gerekir. Hindistan cevizi, papatya çayı, salatalık, semizotu dengeleyicidir. Kızartma, kırmızı et ve ekşi gıdalar tehlikelidir.

Kara safra fazlaysa (sevdâvî mizaç): Isıtıcı ve nemlendirici gıdalar seçilir. Bal, incir, üzüm, bademli süt uygundur. Kuru baklagiller ve tuzlu gıdalar sakıncalıdır.

**Mevsimsel Beslenme**

Tahbîzü'l-Mathûn'da Tokatlı Mustafa Efendi el-Kânûn'u şöyle aktarır: Her mevsimde baskın hıltın karşıtı beslenilir. İlkbahar dem mevsimiyse kan temizleyici gıdalar alınır. Yaz safra mevsimiyse soğutucu gıdalar tercih edilir.

Az yemek esastır. Er-Râzî: "Mide bütün hastalıkların evidir. Perhiz ise ilâçların başıdır.\""""


# ── 4. Kalp Hastalıkları ────────────────────────────────────
KALP_ICERIK = """İmam Gazzâlî, İhyâu Ulûmi'd-Dîn'in Kalp Hastalıkları bölümünde şunu yazar: Beden illetleri ruhun illetlerinin yansımasıdır. Hekim bedeni iyileştirir; ama ruh hasta kaldıkça beden bir süre sonra yeniden hastalanır.

**Kalbin Dört Düşmanı**

Kibir (ucb ve kibr): Kendini yüksek görme hastalığıdır. Bedende kronik gerginlik, uyku bozuklukları ve baş ağrısı olarak tezahür eder. Kalp sürekli tetikte kalır; bu uyanıklık bedeni yorar.

Hased: Başkasının nimetine duyulan kızgınlıktır. Karaciğer ve safra sistemi üzerine binen yüktür. Gazzâlî der ki: Haset eden, önce kendini yer.

Dünya sevgisi (hubb-ı dünya): Geçiciye aşırı bağlanmadır. Kalbi sürekli meşgul eder, uykuyu kaçırır, sinir sistemini yıpratır. Modern tıbbın 'kronik stres' dediği tablonun tam karşılığıdır.

Öfke (gadab): Kontrolsüz öfke, kalp ve damar sistemi üzerindeki baskıyı artırır. Er-Râzî, kızgınlık anında nabzın sertleştiğini ve ısındığını kaydeder.

**Tedavi: Nefs Muhasebesi**

Gazzâlî, ruhsal hastalıkların tedavisinde üç yol önerir: Muhasebe (öz hesaplaşma), riyâzet (nefsi dizginleme) ve sohbet (iyi insanlarla birliktelik).

Klasik İslam tıbbında beden ve ruh ayrı tedavi edilmez. Hekim nabzı ölçerken hastanın ruh hâlini de sorar. Sızlanma, içe kapanma, neşesizlik — bunlar hılt dengesizliğinin işaretleri kadar ruhsal yükün de göstergesidir.

İbn Sînâ el-Kânûn'da melankoliyi (vehim) müstakil bir bölümde inceler ve tedavisinde müziği, güzel manzarayı, sevdiği insanlarla görüşmeyi önerir."""


# ── 5. Zehrâvî Cerrahi ──────────────────────────────────────
CERRAHI_ICERIK = """Ez-Zehravî, et-Tasrîf'in otuzuncu makalesinde tarihin ilk sistematik cerrahi atlasını sunar. Yüz seksen cerrahi aleti çizer, tarif eder ve her birinin hangi operasyonda nasıl kullanılacağını açıklar.

Bu çizimler yüzyıllar boyunca Avrupa cerrahi okullarının ders materyali oldu.

**Öncü Operasyonlar**

Katarakt ameliyatı: Ez-Zehravî, lens yerinden oynatma yöntemini (reclinatio) ayrıntılı tarif eder. Kullanılan iğnenin biçimi ve ameliyat sonrası bakım protokolü modern prosedürleri hatırlatır.

Tiroit ameliyatı: Boyun bölgesindeki kitlerin cerrahi çıkarılması, damarların bağlanma yöntemi ve yara bakımı et-Tasrîf'te yer alır.

Taş kırma (litotripsi): İdrar yolu taşlarının kırılarak çıkarılması operasyonu ilk kez bu eserde sistematik biçimde tarif edilmiştir.

Diş çekimi ve diş eti ameliyatları: Diş hekimliğini cerrahi bir disiplin olarak ele alan ilk eserdir et-Tasrîf.

Doğum komplikasyonları: Ters gelen bebek için kullanılan aletler ve el yöntemleri tarif edilir.

**Avrupa'ya Etkisi**

et-Tasrîf XII. yüzyılda Latince'ye çevrildi. Fransa'da cerrahinin babası sayılan Guy de Chauliac (1363), eserinde Ez-Zehravî'nin adını iki yüzden fazla zikreder. XV. ve XVI. yüzyıllarda Venedik ve Strazburg'da defalarca basıldı.

William Harvey de 1628 tarihli De Motu Cordis eserinde Ez-Zehravî'den alıntı yapar.

Cerrahiyi bir sanat olmaktan çıkarıp bilim hâline getiren bu eser, İslam tıbbının Batı tıbbına bıraktığı en somut mirastır."""


MAKALELER = [
    {
        "slug":          "mizac-teorisi",
        "baslik":        "Mizaç Teorisi: Dört Hılt, Dört Mevsim, Dört İnsan",
        "baslik_ar":     "نظرية الأمزجة والأخلاط",
        "kategori":      "temel-kavramlar",
        "ozet":          "İbn Sînâ'nın el-Kânûn'unda sistemleştirdiği hümoral tıbbın temelleri.",
        "yayinda":       True,
        "icerik":        MIZAC_ICERIK,
        "kaynak_kodlar": ["SRC-007", "SRC-010", "SRC-012"],
    },
    {
        "slug":          "nabiz-sifatlari",
        "baslik":        "Nabız Dokuz Sıfatı: İbn Sînâ'nın Teşhis Anahtarı",
        "baslik_ar":     "علم النبض عند ابن سينا",
        "kategori":      "nabiz-ilmi",
        "ozet":          "Büyüklük, kuvvet, hız, dolgunluk ve 5 sıfatla teşhis yöntemi.",
        "yayinda":       True,
        "icerik":        NABIZ_ICERIK,
        "kaynak_kodlar": ["SRC-006", "SRC-007"],
    },
    {
        "slug":          "besin-mizac",
        "baslik":        "Mizaca Göre Beslenme: El-Hâvî'nin Sofra Rehberi",
        "baslik_ar":     "الأغذية والأدوية المفردة",
        "kategori":      "besin-ilmi",
        "ozet":          "Er-Râzî'nin besin maddeleri ve mevsimsel beslenme önerileri.",
        "yayinda":       True,
        "icerik":        BESIN_ICERIK,
        "kaynak_kodlar": ["SRC-010", "SRC-007", "SRC-012"],
    },
    {
        "slug":          "kalp-hastaliklari",
        "baslik":        "Kalp Hastalıkları: Gazzâlî'nin Nefs Muhasebesi",
        "baslik_ar":     "طب الأرواح والنفس",
        "kategori":      "ruhsal-saglik",
        "ozet":          "Kibir, hased ve dünya sevgisinin bedene yansımaları.",
        "yayinda":       True,
        "icerik":        KALP_ICERIK,
        "kaynak_kodlar": ["SRC-007", "SRC-012"],
    },
    {
        "slug":          "zehravi-cerrahi",
        "baslik":        "Ez-Zehravî'nin Cerrahi Aletleri: 200 Operasyon",
        "baslik_ar":     "الجراحة والعمليات",
        "kategori":      "cerrahi",
        "ozet":          "Et-Tasrîf'teki cerrahi aletler ve modern karşılıkları.",
        "yayinda":       True,
        "icerik":        CERRAHI_ICERIK,
        "kaynak_kodlar": ["TSR", "ZHC", "SRC-014"],
    },
]


def main():
    basarili = 0
    hata     = 0

    for m in MAKALELER:
        print(f"\n── {m['slug']}")
        print(f"   baslik: {m['baslik'][:60]}")
        print(f"   icerik: {len(m['icerik'])} karakter")

        try:
            resp = sb.table("makaleler").insert(m).execute()
            if resp.data:
                basarili += 1
                print(f"   ✓ Eklendi (id: {resp.data[0].get('id', '?')})")
        except Exception as e:
            hata += 1
            print(f"   [!] HATA: {e}")

    print(f"\n{'=' * 50}")
    print(f"Başarılı : {basarili}")
    print(f"Hata     : {hata}")
    print(f"Toplam   : {len(MAKALELER)}")


if __name__ == "__main__":
    main()
