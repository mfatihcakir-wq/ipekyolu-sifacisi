# İpek Yolu Şifacısı

Klasik İslam ve Osmanlı tıbbının bin yıllık birikimine dayanan, kişiye özel mizaç analizi ve danışmanlık sunan dijital platform. WELLUM/MİZAN ürün ailesinin web cephesi.

Üretim adresi: <https://www.ipekyolusifacisi.com>

## Ne yapıyor?

Kullanıcının nabız (9 sıfat), dil ve yüz muayenesi, idrar/dışkı gözlemi, laboratuvar bulguları ve fıtrî mizaç sorularını alıp; 98 klasik kaynak ve 54.000'i aşkın chunk'tan oluşan veritabanına FTS sorgusu atar; eşleşen metinleri Claude API'ye sistem promptu olarak verip kişiye özel mizaç teşhisi, hılt analizi ve bitki/terkib protokolü üretir.

Tüm öneriler kaynak gösterimlidir; danışman onayı olmadan rapor kullanıcıya iletilmez.

## Mimari

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Stil:** Tailwind CSS (kademeli geçiş; mevcut dosyaların bir kısmı inline style kullanıyor)
- **Auth + DB:** Supabase (Postgres, Auth, RLS)
- **AI:** Anthropic Claude (analiz üretimi)
- **E-posta:** Resend
- **i18n:** next-intl (şu an sadece Türkçe; mimari Arapça için hazır)
- **Hosting:** Vercel
- **Analytics:** Vercel Analytics

## Klasör yapısı

```
app/
  [locale]/        # Lokal-prefix mimarisi (tek locale: tr)
    page.tsx       # Ana sayfa wrapper
    LandingClient.tsx
    analiz/        # Mizaç analiz formu (8 adımlı)
    bitkiler/      # 1.180+ bitki atlası
    karakter/      # Kalp Şehri (Ahlâk-ı Hamîde)
    hekim/[slug]/  # Hekim biyografileri (server component)
    makale/[slug]/ # Klasik tıp makaleleri (server component)
    hasta/         # Danışan paneli
    dashboard/     # Hekim paneli
    hakkimizda/, sss/, kvkk/, gizlilik-politikasi/
    components/    # Header, Footer
  api/             # Server route'lar
    analiz/, cilt/, karakter/, makale/, vision/, ...
  emails/          # Resend HTML şablonları
  sitemap.ts, robots.ts
components/        # Paylaşılan client component'ler
lib/
  mizan/           # Sistem promptu, kaynak çekme
  supabase.ts, supabase-server.ts, supabase-middleware.ts
i18n/              # next-intl routing
messages/tr.json   # Çeviriler
sql/setup.sql      # İlk kurulum SQL'i
scripts/           # Veri yükleme Python scriptleri
public/            # Statik varlıklar
```

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

`http://localhost:3000` üzerinden açılır.

## Gerekli ortam değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # admin route'lar için
ANTHROPIC_API_KEY=                   # Claude analiz üretimi
RESEND_API_KEY=                      # E-posta gönderimi
ADMIN_EMAILS=                        # Virgülle ayrılmış admin e-posta listesi
NEXT_PUBLIC_WHATSAPP_NUMBER=         # 905331687226 formatında
```

## Build ve deploy

```bash
npm run build   # Production build (Vercel otomatik yapıyor)
npm run start   # Lokalde production sunucusu
npm run lint    # ESLint kontrol
```

Vercel'e push ile deploy. `main` branch otomatik prod'a çıkar.

## Veritabanı

Supabase project ID: `smlcdldxtxwajzefxfrz`

Ana tablolar:
- `klasik_kaynaklar` (54.200+ chunk, 98 kaynak; FTS: `icerik_tr_tsv` GIN index)
- `karakter_kaynaklar` (15.536 chunk, ahlâk metinleri)
- `bitkiler` (1.180+ tıbbi bitki)
- `hekim_biyografileri` (9 hekim, slug ile)
- `makaleler` (yayınlanmış makaleler)
- `karakter_cepheler`, `karakter_askerler`, `karakter_forms` (Kalp Şehri)
- `patients`, `analyses`, `subscriptions`, `payments`, `basic_forms`, `detailed_forms`

PostgREST FTS notu: OR sorguları için `wfts.` operatörü (websearch_to_tsquery) kullanılır; `fts.` (to_tsquery) `|` syntax'ıyla kırılır.

## Tasarım kuralları

- **Em dash yasak.** Hiçbir kod, içerik veya prompt em dash içermez. Yerine `;`, `:`, `,`, `()` kullanılır.
- **Akademik atıf zorunlu.** Sayfa numarası, cilt, manuscript referansı uydurulmaz; emin olunmayan yerde genel referans verilir.
- **Kaynak gösterimsiz çıktı yasak.** AI üretimi her ifade `[SRC-XXX]` ile etiketlenir.
- **Türkçe diakritikler korunur.** ASCII'ye düşürülmez (ş, ğ, ı, ç, ö, ü, İ).

## Lisans

Kapalı kaynak. Tüm hakları saklıdır.

## İletişim

Mehmet Fatih Çakır (m.fatih.cakir@gmail.com)
WhatsApp: +90 533 168 72 26
