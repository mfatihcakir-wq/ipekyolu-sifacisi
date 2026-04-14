"""
hekim_biyografileri tablosundaki biyografi ve eserler alanlarini gunceller.
Supabase SERVICE_ROLE_KEY ile UPDATE yapar.
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


# ── 1. İbn Sînâ ────────────────────────────────────────────
IBN_SINA_BIO = """Merhaba. Ben Ebû Alî el-Hüseyn ibn Abdullâh ibn Sînâ'yım. Batı'da beni Avicenna olarak tanırlar.

980 yılında Buhara yakınlarındaki Efşene köyünde dünyaya geldim. Babam Abdullah, Sâmânî sarayında kâtiplik yapan, ilme düşkün bir insandı. Çocukluğum felsefe, geometri ve Hint matematiğinin konuşulduğu bir evde geçti. On yaşında Kur'ân'ı ezberledim; on altı yaşında tıba yöneldim. On sekiz yaşında hasta tedavi eder hâle gelmiştim. Dönemin Sâmânî hükümdarını tedavi edince bana saray kütüphanesinin kapıları açıldı — o kütüphane benim için bir hazineydi.

Siyasi çalkantılar beni şehir şehir gezdirdi: Buhara, Rey, Kazvin, Hemedan, İsfahan... Bir defasında hapsedildim. Zindan günlerimde bile yazmayı bırakmadım. el-Hidâye'yi hapishanede kaleme aldım. Hemedan veziri olarak devlet işleri yürüttüm; gece yönetiyor, gece yarısı öğrenci yetiştiriyor, sabaha karşı yazıyordum.

En büyük tıp eserim el-Kânûn fi't-Tıb'dır — beş ciltten oluşan bu kitap tıbbın bütününü sistemleştirdi. Montpellier ve Louvain'de 1650'ye kadar ders kitabı olarak okutuldu. Hastalıkların su ve toprak yoluyla yayılabileceğini, karantina uygulanması gerektiğini yazdım; bu fikir yüzyıllar sonra doğrulandı.

Tıp dışında felsefede de derin izler bıraktım. Kitâbü'ş-Şifâ, el-İşârât ve't-Tenbîhât, el-Hidâye gibi eserlerimle İslam felsefesinin zirvesini temsil ettim. Varlık, ruh ve bilgi üzerine yazdıklarım Batı skolastisizmini de derinden etkiledi.

57 yaşında, Hemedan'a yapılan bir seferde hastalandım. Kendimi kadere bıraktım. Ölüm yatağında mallarımı yoksullara bağışladım, kölelerimi azat ettim.

El-Kânûn hâlâ işliyor. Ben bin yıl önce öldüm; ama bilgim yaşıyor."""

IBN_SINA_ESERLER = [
    "el-Kânûn fi't-Tıb (5 cilt)",
    "Kitâbü'ş-Şifâ (18 cilt)",
    "el-İşârât ve't-Tenbîhât",
    "el-Hidâye",
    "el-Mebde' ve'l-Meâd",
    "Ercûzet fi't-Tıb",
    "el-Edviyetü'l-Kalbiyye",
    "Risâle fi'n-Nebz",
    "Risâle fi'l-Firâse",
    "Risâle fi'l-Kûlenc",
    "Dânişnâme-i Alâî (Farsça)",
]


# ── 2. er-Râzî ─────────────────────────────────────────────
RAZI_BIO = """Ben Ebû Bekr Muhammed ibn Zekeriyyâ er-Râzî'yim. Rey şehrinde 865 yılında doğdum. Batı'da beni Rhazes olarak tanırlar.

Gençliğimde müzisyendim; ud çalıyor, şiir yazıyordum. Otuzlu yaşlarımda tıba yöneldim — bu geç başlangıç beni durdurmadı. Bağdat'ta tıp tahsil ettim, kısa zamanda çağımın en büyük hekimi unvanını aldım. Bağdat Bîmâristânı'nı yönettim; ardından Rey Bîmâristânı'nın baştabipliğine atandım.

Tıbda benim asıl katkım klinik gözlemdir. Hasta başında not aldım, vakaları karşılaştırdım, sonuçları kayıt altına aldım. Çiçek hastalığı ile kızamığı ilk kez birbirinden ayırt eden bendim — bu ayrım modern tıbbın temel taşlarından biridir. el-Hâvî'de yüzyılların klinik birikimini derledim.

Felsefeye de merak saldım. Galenos'a, hatta İbn Sînâ'nın otoritesine meydan okudum. 'Kimsenin sözü sorgulanmadan kabul edilmemeli' dedim — bu tavır pek çok düşmanımın olmasına yol açtı.

Son yıllarımda gözlerim hastalandı, görüşüm zayıfladı. Ameliyat önerildi; reddettim. 'Bu yaştan sonra karanlık aynı karanlıktır' dedim. 925 yılında Rey'de vefat ettim.

Bıraktığım el-Hâvî — Kapsayan Kitap — iki yüz ciltten fazla not ve vakanın derlemesidir. Ölümümden sonra tamamlanan bu eser, tıp tarihinin en büyük klinik arşividir."""

RAZI_ESERLER = [
    "el-Hâvî fi't-Tıb (20+ cilt)",
    "el-Mansûrî fi't-Tıb",
    "el-Cüderî ve'l-Hasbe (Çiçek ve Kızamık)",
    "Men lâ Yahduruhu't-Tabîb",
    "el-Medhal ilâ Sınâati't-Tıb",
    "Takâsîmü'l-İlel",
    "el-Ebdâl",
    "Menâfiu'l-Ağdiye",
    "el-Mülûkî",
    "Kitâbü'l-Kûlenc",
    "Şekûk alâ Câlînûs",
    "Kitâbü'l-Mürşid",
]


# ── 3. ez-Zehrâvî ──────────────────────────────────────────
ZEHRAVI_BIO = """Ben Ebü'l-Kâsım Halef ibn Abbâs ez-Zehravî'yim. Kurtuba yakınlarındaki ez-Zehrâ şehrinde, 936 yılında doğdum. Batı'da beni Abulcasis olarak tanırlar.

Endülüs'ün altın çağında yaşadım. Kurtuba o dönemde dünyanın en büyük ve en aydın şehriydi — kütüphaneler, hastaneler, medreseler soluk kesiyordu. Ben bu şehrin bahçesinde yetiştim.

Yarım asırlık klinik pratiğimin ürünü olan et-Tasrîf li-men Aceze ani't-Te'lîf'i kaleme aldım. Otuz bölümden oluşan bu tıp ansiklopedisi cerrahiyi, farmakolojisi, diş hekimliğini, ebeliği kapsar. Yüzü aşkın cerrahi alet çizdim ve tanımladım — bu aletlerin büyük bölümü çağdaş cerrahinin öncüleridir. Kataraktı iğneyle yerinden oynatma yöntemi, idrar sondası, forseps — bunları ben geliştirdim ya da ilk kez tarif ettim.

Fistül, kist, tümör cerrahisi üzerine yazdıklarım Avrupa'da yüzyıllarca okundu. Fransa'da cerrahinin babası sayılan Guy de Chauliac, 1363 tarihli eserinde benim adımı iki yüzden fazla zikreder.

1013 yılında, büyük olasılıkla yetmişli yaşlarımda vefat ettim. Ardımda bıraktığım et-Tasrîf, Latince'ye çevrilerek XV. ve XVI. yüzyıllarda Avrupa'da defalarca basıldı. Cerrahinin bir bilim dalı olarak tanınmasında bu kitabın payı büyüktür."""

ZEHRAVI_ESERLER = [
    "et-Tasrîf li-men Aceze ani't-Te'lîf (30 cilt)",
    "el-Cerrâha (et-Tasrîf'in 30. Makalesi)",
    "Müfredat kitapları (et-Tasrîf'in diğer bölümleri)",
]


# ── 4. İbn Beytâr ──────────────────────────────────────────
IBN_BEYTAR_BIO = """Ben Ziyâeddin Ebû Muhammed Abdullâh ibn Ahmed el-Mâlekî ibn Beytâr'ım. 1197 yılında, Endülüs'ün Mâleka şehrinde doğdum.

Gençliğimi bitkileri ve drogları toplayarak geçirdim. Hocam Ebû'l-Abbâs en-Nebâtî bana gözlemenin ne demek olduğunu öğretti. Endülüs'ten başlayarak kuzey Afrika kıyılarını, Mısır'ı, Suriye'yi, Anadolu'yu dolaştım; gördüğüm her bitkiyi kayıt altına aldım. Meyyâfârikîn'den (Silvan) Erzincan'a uzanan bu yolculukta binlerce bitki numunesi topladım.

Kahire'de Eyyûbî sultanı el-Kâmil beni saray botanikçisi olarak görevlendirdi. Dımaşk'ta yetiştirdiğim öğrenciler bu bilgiyi sürdürdü.

el-Câmi' li-Müfredâti'l-Edviye ve'l-Ağziye adlı eserim İslam dünyasının en kapsamlı tıbbi botanik sözlüğüdür. Beş yüz elli kadar yeni bitki ve maddeyi tıp literatürüne ilk kez ben kazandırdım. Eser Arapça, Rumca, Berberice, Farsça ve İspanyolca adlarıyla bin beş yüz maddeden fazlasını içerir.

1248 yılında Dımaşk'ta vefat ettim."""

IBN_BEYTAR_ESERLER = [
    "el-Câmi' li-Müfredâti'l-Edviye ve'l-Ağziye (4 cilt)",
    "el-Muğnî fi'l-Edviye'l-Müfrede",
    "Mîzânü't-Tabîb",
]


# ── 5. İbnü'n-Nefîs ────────────────────────────────────────
IBN_NEFIS_BIO = """Ben Alâeddin Ebü'l-Hazm Ali ibn Ebî'l-Hazm el-Kareşî, İbnü'n-Nefîs adıyla tanınırım. 1213 yılında, Dımaşk yakınlarında doğdum.

Tıbbı, Nûreddin Mahmûd Zengî'nin kurduğu Nûrî Bîmâristânı'nda öğrendim. Hocam Mühezzebüddin ed-Dahvâr bana gözlemin ve şüphenin erdemini aşıladı. Otuzlu yaşlarımda Kahire'ye geçtim; Nâsırî Bîmâristânı'nda çalıştım, ders verdim, yazdım.

En büyük keşfim küçük kan dolaşımıdır. İbn Sînâ'nın kalp ventriküllerinin arasında gözenek bulunduğu iddiasını reddettim; kanın sağ kalpten akciğerlere, oradan sol kalbe geçtiğini açıkladım. Bu keşfi William Harvey'in 'büyükkesfi'nden üç yüz yıl önce yaptım. Şerhu Teşrîhi'l-Kânûn adlı eserimde bu tespiti açıkça kaleme aldım.

el-Şâmil fi's-Sınâati't-Tıbbiyye benim en büyük eserimdir — üç yüz ciltten oluşmasını tasarladım, seksen cildi tamamlayabildim. Ölümümden önce tüm eserlerimi Kalavun Hastanesi'ne bağışladım.

Şâfiî fıkhında da derin bilgim vardı; Kahire'de hukuk dersleri verdim. Risâletü'l-Kâmiliyye adlı kurgusal eserimde ıssız bir adada büyüyen çocuğun aklıyla evreni kavrama serüvenini anlattım — bu eser dünya edebiyatının ilk bilimkurgu romanı sayılır.

1288 yılında Kahire'de vefat ettim."""

IBN_NEFIS_ESERLER = [
    "el-Şâmil fi's-Sınâati't-Tıbbiyye (80 cilt tamamlandı, 300 cilt tasarlandı)",
    "el-Mûcez fi't-Tıb",
    "Şerhu Teşrîhi'l-Kânûn (Küçük kan dolaşımı keşfi)",
    "Şerhu Müşkilâti'l-Kânûn",
    "Şerhu Füsûli İbukrât",
    "el-Muhtâr mine'l-Ağziye",
    "Risâletü'l-Kâmiliyye fi's-Sîreti'n-Nebeviyye (Theologus Autodidactus)",
]


# ── 6. el-Antâkî ───────────────────────────────────────────
ANTAKI_BIO = """Ben Dâvûd ibn Ömer el-Antâkî'yim. 1543 yılında Antakya'da doğdum; bütün ömrüm körlükle geçti. Gözlerim görmedi ama zihnimden hiçbir şey kaçmadı.

Körlük beni kitaplara bağladı. Hocalarımdan dinleyerek, okutturarak öğrendim. Arapça, Farsça, matematik, tıp, astronomi, fıkıh... Her ilimde derinleştim. İstanbul'a gittim, Mısır'ı dolaştım, Hicaz'ı gezdim. Her şehirde alimlerle buluşup bilgi aldım; her bilgiyi aklımda sakladım.

Tezkîretü Üli'l-Elbâb ve'l-Câmiü li'l-Aceb el-Ucâb — bu benim en büyük eserimdir. Tıbbi bitkiler, madenler, hayvansal ürünler, hastalıklar ve tedavileri... Bu hacimli ansiklopedi Osmanlı ve Arap tıp pratiğinde yüzyıllarca başvuru kaynağı oldu.

Nüzhetü'l-Ezhân fi Islâhi'l-Ebdân adlı eserimde gündelik hayatın sağlık kurallarını işledim. Selâse Resâil'de ise çeşitli tıbbi meselelere dair risalelerimi bir araya getirdim.

1599 yılında Mekke'ye giderken Mısır'da vefat ettim. Gözlerimi hiç açamadım ama ilmi geniş açtım."""

ANTAKI_ESERLER = [
    "Tezkîretü Üli'l-Elbâb ve'l-Câmiü li'l-Aceb el-Ucâb (Tezkiretü'l-Antâkî)",
    "Nüzhetü'l-Ezhân fi Islâhi'l-Ebdân",
    "Selâse Resâil",
    "Buğyetü'l-Muhtâc fi'l-Mücerreb mine'l-İlâc",
    "Alkatü'ş-Şeytan (Şeytan Aldatması Üzerine)",
    "er-Risâletü'l-Antâkiyye fi Ahkâmi'l-Mûsîkâ",
]


# ── 7. el-Herevî ───────────────────────────────────────────
HEREVI_BIO = """Ben Muhammed ibn Yûsuf el-Herevî'yim. Herat şehrinde, onaltıncı yüzyılın başlarında yaşadım.

Asıl mesleğim eczacılık ve tıbbi sözlükçülüktü. Hayatımın büyük bölümünü bitkisel ve tıbbi maddelerin adlarını, özelliklerini, kullanım biçimlerini derlemeye adadım. 1518'de tamamladığım Bahrü'l-Cevâhir fi't-Tıb — Tıbbın İnciler Denizi — bu emek ve tutkun ürünüdür.

Bu eser bir sözlük olduğu kadar bir tıp ansiklopedisidir. İlaç ve tıbbi madde adlarını Arapça, Farsça ve Türkçe karşılıklarıyla verdim. Her madde için mizaç bilgisini, faydasını, dozunu ve yan etkilerini kayıt altına aldım. Klasik kaynaklardan derlediğim bilgileri kendi gözlemlerimle zenginleştirdim.

O dönemde Osmanlı coğrafyasında ve İran'da pek çok bitkinin adı karışıklık yaratıyordu. Eserim bu karışıklığı gidermeye yönelik de bir rehberdi. Osmanlı tıp pratiğinde yüzyıllar boyunca başvuru kaynağı olarak kaldı.

Kitabım, tıbbın dili ile eczacılığın pratiği arasındaki köprüdür. Bilgi aktarılmazsa yok olur; ben aktarmayı meslek edindim."""

HEREVI_ESERLER = [
    "Bahrü'l-Cevâhir fi't-Tıb",
    "Aynü'l-Hayât (Risâle-i Atrılâl ile birlikte)",
]


# ── 8. Tokatlı (sadece eserler) ────────────────────────────
TOKATLI_ESERLER = [
    "Tahbîzü'l-Mathûn min Kânûni İbn Sînâ (6 cilt)",
    "Risâle fi'n-Nebz",
    "Risâle fi'l-Humma",
]


# ── 9. el-Hayâtî ───────────────────────────────────────────
HAYATI_BIO = """Ben Hekim Ahmet el-Hayâtî'yim. On beşinci yüzyılda, Osmanlı coğrafyasında yaşadım. Hayatım hakkında çok az bilgi kalmış günümüze; adımdan ve eserimden biliniyorum.

Şeceretü't-Tıb — Tıbbın Ağacı — klasik İslam tıbbının bilgisini özgün bir düzene koyan eserimdir. Tıp bilgisini bir ağaç metaforuyla organize ettim: kök teorik temellerdir, gövde hastalıkların sınıflandırmasıdır, dallar tedavi yöntemleridir, yapraklar ise ilaçlar ve bitkilerdir. Bu hiyerarşik yapı, okuyucunun büyük resmi görmesine yardımcı olur.

El-Kânûn'un devasa hacmi karşısında daha özlü ve kullanışlı bir rehber arayışının ürünüdür Şeceretü't-Tıb. Osmanlı medreselerinde ve darüşşifâlarında tıp öğrencileri bu eseri başvuru metni olarak kullandı.

Topkapı Sarayı Kütüphanesi'nde III. Ahmed koleksiyonunda 2045 numarayla kayıtlı olan yazmam bugüne ulaşmıştır. Bu yazma, üzerine kapsamlı ilk akademik çalışmanın yapılmasını bekledi — uzun bekleyiş artık sona ermiştir.

Ağaç büyüdükçe köklerini gizler. Ben o kökleri görünür kılmak istedim."""

HAYATI_ESERLER = [
    "Şeceretü't-Tıb (Tıbbın Ağacı) — Topkapı Sarayı, III. Ahmed, nr. 2045",
]


# ── Güncellenecek kayıtlar ─────────────────────────────────
GUNCELLEMELER = [
    ("ibn-sina",   {"biyografi": IBN_SINA_BIO,   "eserler": IBN_SINA_ESERLER}),
    ("er-razi",    {"biyografi": RAZI_BIO,       "eserler": RAZI_ESERLER}),
    ("ez-zehravi", {"biyografi": ZEHRAVI_BIO,    "eserler": ZEHRAVI_ESERLER}),
    ("ibn-beytar", {"biyografi": IBN_BEYTAR_BIO, "eserler": IBN_BEYTAR_ESERLER}),
    ("ibn-nefis",  {"biyografi": IBN_NEFIS_BIO,  "eserler": IBN_NEFIS_ESERLER}),
    ("el-antaki",  {"biyografi": ANTAKI_BIO,     "eserler": ANTAKI_ESERLER}),
    ("el-herevi",  {"biyografi": HEREVI_BIO,     "eserler": HEREVI_ESERLER}),
    ("tokatli",    {"eserler": TOKATLI_ESERLER}),
    ("el-hayati",  {"biyografi": HAYATI_BIO,     "eserler": HAYATI_ESERLER}),
]


def main():
    basarili = 0
    eksik    = 0
    hata     = 0

    for slug, payload in GUNCELLEMELER:
        print(f"\n── {slug}")
        for k, v in payload.items():
            n = len(v) if isinstance(v, list) else len(v)
            print(f"   {k}: {'list('+str(n)+')' if isinstance(v, list) else str(n)+' karakter'}")

        try:
            resp = sb.table("hekim_biyografileri") \
                     .update(payload) \
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
    print(f"Başarılı      : {basarili}")
    print(f"Bulunamadı    : {eksik}")
    print(f"Hata          : {hata}")
    print(f"Toplam istek  : {len(GUNCELLEMELER)}")


if __name__ == "__main__":
    main()
