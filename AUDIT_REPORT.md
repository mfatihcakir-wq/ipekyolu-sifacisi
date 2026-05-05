# AUDIT_REPORT, Phase 1

Bu rapor "ipekyolu-sifacisi" reposunun mevcut durumunu, üç fazlı yeniden yapılandırma planının ilk adımı olarak özetler. Hiçbir dosya değiştirilmemiştir. Üslup notu, raporda em dash kullanılmaz; ayraç olarak noktalı virgül, iki nokta ve parantez tercih edilir.

## 1. Repo Mimarisi

### 1.1 Çatı

- Framework, Next.js 14.2.35, App Router (`app/` dizini, `[locale]` catch-all segment).
- Pages Router yok; tüm rotalar `app/` içinde.
- TypeScript 5, `strict: true`, `moduleResolution: bundler`, `paths: { "@/*": ["./*"] }`.
- Build script, `next build` (özel flag yok); dev `next dev`, lint `next lint`.
- Node sürümü `package.json`da pin'lenmemiş (Vercel default kullanılıyor).
- `next.config.mjs`, `next-intl/plugin` ile sarılmış; security headers, image remote patterns (`*.supabase.co`), webpack rule (Supabase Edge Functions klasörünü ignore-loader ile dışarıda bırakıyor).

### 1.2 i18n

- `next-intl` v4 kullanılıyor.
- `i18n/routing.ts`, `locales: ['tr']`, `defaultLocale: 'tr'`, `localePrefix: 'never'`. Yani URL'lerde `/tr` prefix yok; bütün public rotalar `/`, `/bitkiler`, `/makale/[slug]`, vb.
- `app/[locale]/layout.tsx`, NextIntlClientProvider sarması yapıyor; `dir` ataması `locale === 'ar'` olduğunda RTL, ama Arapça aktif değil.

### 1.3 Auth ve Middleware

- `middleware.ts`, hem `next-intl` middleware hem de `@supabase/ssr` ile cookie tabanlı auth kontrolü yapıyor.
- Korumalı yollar, `/dashboard`, `/hasta`, `/profil`, `/admin`. `/dashboard/hekim/*` ek olarak `rol === 'hekim'` ister.
- Public tüm sayfalar (Landing, /bitkiler, /makale/[slug], /hekim/[slug], /analiz, /karakter, /hakkimizda, /sss, /kvkk, /gizlilik-politikasi) middleware'de auth gerektirmez.
- Eski `/login` ve `/register` URL'leri 301 ile `/giris` ve `/kayit`'a redirect ediliyor.

### 1.4 Tailwind ve PostCSS

- Tailwind 3.4.1 (devDependency).
- `tailwind.config.ts`; `content` taraması sadece `app/**` ve `components/**` (i18n veya emails klasörü dışarıda; emails tasarımları zaten React Email muadili olarak inline style kullanıyor).
- `theme.extend.colors`, marka palette'i (`primary`, `gold`, `cream`, `dark`, `secondary`, `border`) artı eski isimlendirme uyumluluğu (`koyu`, `orta`, `altin`, `krem`, vb.) artı vurgu (`green`, `whatsapp`).
- `theme.extend.fontSize` ve `fontFamily` Tailwind tarafına genişletilmiş; `font-baslik`, `font-govde`, `font-cormorant`, `font-garamond`, `font-roboto`, `font-arapca` utility'leri tanımlı.
- `theme.extend.maxWidth`, `prose: 720px`, `wide: 1200px`.
- `postcss.config.js`, `tailwindcss` + `autoprefixer`.
- `app/[locale]/globals.css`, `@tailwind base/components/utilities` ile başlıyor; ardından kapsamlı CSS değişkenleri (`--p-*`, `--renk-*`), tipografi base ayarları (`h1/h2/h3/p/blockquote`), media query'ler (`.hero-grid`, `.makale-grid`, `.makale-featured`, `.hero-card-mobile`, `.hero-card-desktop`, `.hero-logo-col`), `.text-balance` utility ve uzun keyframe seti (`gentlePulse`, `orbitDem/Saf/Bal/Sev`, `bgLogoPulse`, `rotS`).

### 1.5 Bağımlılıklar (özet)

- Veri ve auth, `@supabase/ssr ^0.10`, `@supabase/supabase-js ^2.101`.
- 3D, `@react-three/drei`, `@react-three/fiber`, `three` (sadece `components/AnatomyViewer.tsx` kullanıyor).
- AI, `@anthropic-ai/sdk ^0.82` (server route'larda).
- Email, `resend`, react email tasarımları `app/emails/*`.
- Markdown, `react-markdown` + `remark-gfm` (sadece `/makale/[slug]`).
- Analytics, `@vercel/analytics`.
- UI/CSS kütüphanesi yok (CSS modules yok, emotion yok, styled-components yok, vanilla extract yok). Sadece raw `style={{...}}`, sınırlı `className=` ve iki `<style jsx global>` bloğu.

### 1.6 Klasör haritası

- `app/[locale]/`, public ve auth sonrası tüm sayfalar.
- `app/api/`, REST route handler'ları (analiz, cilt, vision, makale, kaynaklar, karakter, yorum, email, hekim/analiz-baslat, vb.).
- `app/auth/callback/route.ts`, Supabase auth redirect handler.
- `app/emails/`, Resend için React Email şablonları.
- `app/sitemap.ts`, dinamik sitemap (Supabase'den hekim ve makale slug'larını çekiyor); `app/robots.ts`, /dashboard ve /api dışlanmış.
- `components/`, ortak bileşenler (AnatomyViewer, Logo, MakalelerSection, MakaleUret).
- `lib/`, `supabase.ts` (browser client), `supabase-server.ts` (server client, cookies()), `supabase-middleware.ts`, `admin.ts`, `constants.ts`, `mizan/`.
- `i18n/`, next-intl konfigürasyonu.
- `messages/`, çeviri JSON'ları (sadece tr aktif).
- `sql/`, kurulum SQL'leri (`setup.sql`, `karakter_tablolar.sql`, `insert_makaleler.sql`).
- `supabase/functions/`, Supabase Edge Functions (webpack ignore-loader ile bundle dışı).
- `scripts/`, Python ETL betikleri (bitki ve hekim verisi enjekte).
- `types/`, paylaşılan TS tipleri.

## 2. CSS Yaklaşımı Envanteri

### 2.1 Genel Görünüm

Repoda hâkim stil yaklaşımı **inline `style={{...}}`** prop'u; `app/[locale]/globals.css` global ortak class'ları (`hero-grid`, `makale-grid`, `hero-card-mobile`, `klasik-metin`, vb.) ve keyframe animasyonlarını tutuyor. İki büyük client component (`LandingClient.tsx` ve `analiz/AnalizClient.tsx`) ek olarak `<style jsx global>` blokları içeriyor (Next.js styled-jsx ile).

CSS Modules, emotion, styled-components, sx prop yok.

Tailwind sadece bazı dashboard, hasta, hekim alt sayfalarında ve birkaç paylaşılan client component'te kullanılıyor (örn. `dashboard/hekim/maliyet/page.tsx`, `dashboard/hekim/gelen-kutu/page.tsx`, `dashboard/hekim/talep/[id]/*.tsx`, `hasta/analizlerim/[id]/page.tsx`, `dashboard/atlas/page.tsx`, `analiz/basarili/page.tsx`, `odeme/page.tsx`).

Aşağıdaki tablo, `app/` ve `components/` altındaki anlamlı dosyaları üç sınıfa ayırır.

- **Tailwind only**, dosyada `style={{}}` yok ya da yalnızca tek `style={{ minHeight }}` gibi düşük bant; tüm görsel hiyerarşi `className` ile.
- **Karma**, hem `style={{}}` hem `className` belirgin oranda.
- **Tailwind dışı**, ağırlıklı olarak `style={{}}` veya `<style jsx>`; `className` yok.

Ölçü için inline `style={{}}` ve `className=` saymaları kullanıldı (yaklaşık).

#### 2.1.1 Tailwind only (kolay, dokunulmayabilir)

| Dosya | style/className | Not |
|---|---|---|
| `app/[locale]/dashboard/atlas/page.tsx` | 0 / 7 | Tamamen Tailwind. |
| `app/[locale]/dashboard/hekim/maliyet/page.tsx` | 0 / 33 | Server component, Tailwind. |
| `app/[locale]/dashboard/hekim/gelen-kutu/page.tsx` | 0 / 31 | Server, Tailwind. |
| `app/[locale]/dashboard/hekim/talep/[id]/page.tsx` | 0 / 19 | Server, Tailwind. |
| `app/[locale]/dashboard/hekim/talep/[id]/TaslakGoruntule.tsx` | 0 / 44 | Tailwind. |
| `app/[locale]/dashboard/hekim/talep/[id]/AnalizBaslatClient.tsx` | 0 / 6 | Tailwind. |
| `app/[locale]/dashboard/hekim/talep/[id]/DurumDegistirForm.tsx` | 0 / 3 | Tailwind. |
| `app/[locale]/hasta/analizlerim/[id]/page.tsx` | 0 / 114 | Server, koyu Tailwind kullanımı. |
| `app/[locale]/analiz/basarili/page.tsx` | 0 / 11 | Tailwind. |
| `app/[locale]/odeme/page.tsx` | 0 / 9 | Tailwind. |
| `app/[locale]/hasta/DurumEtiketi.tsx` | 1 / 0 | Tek tip stil, taşımaya değer ama önemsiz. |

Migrasyon zorluğu, **çoğu zaten hedef durumda**; sadece marjinal dokunuş.

#### 2.1.2 Karma (orta, parça parça refactor)

| Dosya | style/className | Not |
|---|---|---|
| `app/[locale]/components/Header.tsx` | 19 / 3 | `<style>` bloğu (mobil görünürlük) + büyük inline style; renk sabitleri local `C` objesi. |
| `app/[locale]/karakter/page.tsx` | 60 / 11 | İçerik metinleri ve büyük interaktif anketin stilleri inline; bazı yerler className. |
| `components/AnatomyViewer.tsx` | 5 / 34 | 3D Three.js; az inline, çoğu Tailwind. |
| `components/Logo.tsx` | 5 / 9 | SVG ile inline; küçük dosya. |
| `components/MakaleUret.tsx` | 34 / 0 | Admin tool; inline ağırlıklı. |
| `app/[locale]/makale/[slug]/page.tsx` | 25 / 1 | Tüm tipografi inline; ReactMarkdown component override'ları her HTML elemanı için ayrı stil. |
| `components/MakalelerSection.tsx` | 48 / 2 | Home'daki makale ve hekim grid'leri; uzun inline style. |

Migrasyon zorluğu, **orta**; Header ve MakalelerSection homepage'in görünür yüzü olduğu için piksel-perfect koruma gerekir.

#### 2.1.3 Tailwind dışı (zor, ağır migrasyon)

| Dosya | style sayısı | Not |
|---|---|---|
| `app/[locale]/dashboard/page.tsx` | 245 | En büyük dosya (1387 satır), ana dashboard. Tamamen inline. |
| `app/[locale]/analiz/AnalizClient.tsx` | 208 / 23 | 1986 satır, anket akışı; ek olarak `<style jsx global>` bloğu. |
| `app/[locale]/LandingClient.tsx` | 126 / 18 | Ana sayfa hero ve bütün section'lar; `<style jsx global>` ile responsive media query'ler. |
| `app/[locale]/karakter/sonuc/page.tsx` | 99 | Karakter sonuç ekranı. |
| `app/[locale]/dashboard/cilt/[id]/page.tsx` | 83 | Cilt detay (server component, inline). |
| `app/[locale]/bitkiler/BitkilerClient.tsx` | 73 | Bitki atlası grid + filtre + kart. |
| `app/[locale]/dashboard/arsiv/page.tsx` | 68 | Arşiv. |
| `app/[locale]/hasta/page.tsx` | 67 / 2 | Hasta ana. |
| `app/[locale]/profil/page.tsx` | 64 | Profil. |
| `app/[locale]/hasta/takip/page.tsx` | 54 | Takip. |
| `app/[locale]/hasta/cilt/page.tsx` | 53 | Cilt yükleme. |
| `app/[locale]/kayit/page.tsx` | 42 | Kayıt formu. |
| `app/[locale]/dashboard/yorumlar/page.tsx` | 37 | Yorum yönetimi. |
| `app/[locale]/hasta/cilt-analizlerim/[id]/page.tsx` | 36 | Cilt analiz detay. |
| `app/[locale]/hasta/analiz/[id]/page.tsx` | 36 | Analiz detay. |
| `app/[locale]/dashboard/hastalar/page.tsx` | 36 | Hasta listesi. |
| `app/[locale]/yorum-yaz/page.tsx` | 34 | Yorum yaz. |
| `app/[locale]/dashboard/cilt/page.tsx` | 31 | Cilt kuyruğu. |
| `app/[locale]/hasta/ayarlar/page.tsx` | 30 | Ayarlar. |
| `app/[locale]/hakkimizda/page.tsx` | 30 | Hakkımızda. |
| `app/[locale]/hasta/cilt-analizlerim/page.tsx` | 29 | Cilt analizler. |
| `app/[locale]/giris/page.tsx` | 27 | Giriş. |
| `app/[locale]/components/Footer.tsx` | 27 | Footer. |
| `app/[locale]/hasta/profil/page.tsx` | 25 | Hasta profil. |
| `app/[locale]/hekim/[slug]/page.tsx` | 20 | Hekim biyografi. |
| `app/[locale]/sifre-guncelle/page.tsx` | 11 | Şifre güncelle. |
| `app/[locale]/error.tsx` | 12 | Error boundary. |
| `app/[locale]/sss/page.tsx` | 12 | SSS. |
| `app/[locale]/kvkk/page.tsx` | 12 | KVKK. |
| `app/[locale]/not-found.tsx` | 13 | 404. |
| `app/[locale]/admin/page.tsx` | 4 | Admin landing. |

Migrasyon zorluğu, **AnalizClient ve dashboard/page** zor; geri kalan büyük çoğunluk orta. `<style jsx global>` blokları (LandingClient ve AnalizClient) responsive davranış için kullanıldığından, Tailwind sm/md/lg breakpoint'lerine taşınmalı; aksi takdirde silinemezler.

### 2.2 Tailwind dışı yöntemler (özet)

- **Inline `style={{...}}` prop**, baskın yöntem (yaklaşık 1900+ kullanım).
- **`<style jsx global>`**, sadece `LandingClient.tsx:450` ve `analiz/AnalizClient.tsx:1975`. Her iki dosyada da responsive media query'ler ve grid override'ları içeriyor.
- **`globals.css` global class'lar**, `hero-grid`, `hero-card-desktop`, `hero-card-mobile`, `hero-logo-col`, `hero-logo-anim`, `makale-grid`, `makale-featured`, `klasik-metin`, `alinti`, `text-balance`, `orbit-*`, `logo-body`, `logo-horn`, `logo-drop`. Bu class'lar JSX'te `className="hero-grid"` gibi kullanılıyor.
- **CSS değişkenleri**, `:root` altında iki paralel set; yeni `--p-*` ve eski `--renk-*`. Kod tarafında `var(--font-cormorant)`, `var(--font-eb-garamond)`, `var(--font-roboto)` font değişkenleri Tailwind'in `fontFamily.cormorant/garamond/roboto` ile eşleşiyor.
- **Local renk sabitleri**, çoğu büyük dosya `const C = { primary, gold, cream, ... }` gibi local objelerle inline style üretiyor; bu, Tailwind palette'iyle senkron ama tekrarlı.

## 3. Bitkiler Sayfası Özel Analizi

### 3.1 Mevcut render modu

- **Tamamen CSR**. `app/[locale]/bitkiler/page.tsx`, sadece statik `metadata` export edip `<BitkilerClient />` döndürüyor.
- `app/[locale]/bitkiler/layout.tsx`, ekstra metadata title var; başka bir şey yapmıyor.
- `BitkilerClient.tsx` `'use client'` directive'i ile çalışıyor; `useEffect` içinde browser Supabase client'ı ile **iki paralel range fetch** (`range(0, 999)` ve `range(1000, 1999)`) artı `count(*)` ve `auth.getUser()` çağrısı yapıyor (Supabase'in default 1000 satır limitini aşmak için manuel ikiye bölünmüş).
- İlk render'da `loading=true` ve skeleton gösteriliyor; tüm 2000 kayıt belleğe alındıktan sonra arama, mizaç, nem, organ ve kaynak filtreleri client-side `useMemo` ile yapılıyor. Sayfalama (PER_PAGE=20) da client-side dilim.
- "Free limit" mantığı, kullanıcı yoksa ilk 6 kart sonrası `filter: blur(4px)` ile kilitli gösterim; `pointerEvents: 'none'`.
- SEO ve Core Web Vitals açısından sorunlu, içerik HTML'de yok; ilk paint boş; Supabase round-trip ve büyük JSON yükü tarayıcıya iniyor.

### 3.2 /bitkiler/[slug]

- **Yok**. `bitkiler/` altında `[slug]` route'u tanımlı değil; her bitki `expandedId` state'i ile aynı sayfada inline genişliyor. Yani ne kanonik URL ne de paylaşılabilir bitki sayfası mevcut.

### 3.3 Veri kaynağı

- Tablo, `bitkiler` (Supabase Postgres). Şema TS interface'inden çıkarılan alanlar; `id`, `ad_tr`, `ad_ar`, `ad_en`, `ad_lat`, `mizac_sicaklik`, `mizac_nem`, `mizac_derece`, `faydalari`, `organlar` (text[]), `kaynaklar` (text[]), `kaynak_metin`.
- Verinin yüklenmesi, Python ETL betikleri (`scripts/extract_bitkiler_havi.py`, `extract_bitkiler_tahbiz.py`, `extract_bitkiler_bhr_ayn.py`, `extract_bitkiler_samil.py`, `guncelle_mizac.py`).
- Toplam kayıt sayısı, `metadata.description`'da "1.180+", UI'daki `kayitSayisi` "54.200+" (metin kayıtları toplamı, ayrı), `count.exact` ile gerçek sayı çekiliyor (yaklaşık 2000 sınırı patlatıyor; ETL büyüyebilir).
- Client tipi, `lib/supabase.ts` üzerinden `createBrowserClient` (yani anon key ile, RLS public read'e açık olmalı; ayrı bir kontrol).

### 3.4 Metadata, head, OG

- `app/[locale]/bitkiler/page.tsx`, statik `metadata` veriyor; `title: 'Bitki Atlası, 1.180+ Klasik Tıbbî Bitki'`, `description`, `openGraph.title`, `openGraph.description`, `openGraph.type = 'website'`. OG image yok.
- `app/[locale]/bitkiler/layout.tsx`, ek `title: 'Bitkisel Kaynaklar, İpek Yolu Şifacısı'` (page metadata ile çakışıyor; Next.js page metadata öncelikli, layout başlığı template ile birleşiyor).
- Twitter card özel ayarı yok; root layout'taki "summary_large_image" miras alınıyor.
- Hreflang yok (zaten tek locale).
- Bitki başına metadata yok (slug sayfası olmadığı için).

### 3.5 URL, pagination, filtreleme

- URL, `/bitkiler` (locale prefix'siz; routing 'never').
- Filtreler ve arama URL search param'a yansımıyor; sayfa yenilenince state kaybolur, paylaşılabilir filtre URL'i yok.
- Pagination, sadece görsel; URL `?sayfa=...` taşımıyor.
- Skeleton sırasında "Toplam X bitki" gibi metrikler boş.

### 3.6 Bitkiler için dokunulacak dosyalar (Phase 3)

- `app/[locale]/bitkiler/page.tsx`, server component'a çevir; Supabase server client veya direkt service-role olmayan REST fetch ile tüm liste veya sayfalanmış listeyi getir, `revalidate` veya ISR / Cache Components stratejisi seç.
- `app/[locale]/bitkiler/BitkilerClient.tsx`, props ile initial veri al; client tarafında sadece arama, filtre ve auth flag'i tut. Mevcut `bitkiler_ssr.patch` taslağı bu yönde başlangıç noktası sunuyor (devam ettirilebilir, koşullu).
- `app/[locale]/bitkiler/layout.tsx`, başlık çakışmasını gider veya silinecek.
- `app/[locale]/bitkiler/[slug]/page.tsx` (yeni), bitki detay sayfası; server component, `generateMetadata` ile başlık, OG, JSON-LD (MedicalEntity veya Drug schema değil, `Thing` veya custom). `generateStaticParams` ile build-time prerendering düşünülebilir (1180 sayfa, makul).
- `app/sitemap.ts`, bitki slug'larını da sitemap'e ekle.
- `lib/supabase-server.ts`, server tarafında `bitkiler` query helper ekle (cookie kullanmadan, anon key ile public read).
- Filtre ve pagination URL serileştirmesi; `searchParams` üzerinden parse.
- Skeleton, server-side render edildiği için kaldırılabilir veya `Suspense` boundary'sine dönüştürülebilir.

## 4. /makale/* ve /hekim/* Kısa Analizi

### 4.1 /makale/[slug]/page.tsx

- Render, **SSR (async server component)**; `revalidate` belirtilmemiş, default davranış (App Router server component, dinamik fetch yoksa statik). Burada Supabase fetch, dynamic API olmadığı için Next 14 default olarak full route cache yapar; ama `revalidate=0` veya tag yok, yani build sonrası yayınlanan makaleler güncel görünmeyebilir.
- Veri kaynağı, `makaleler` tablosu, `select('*').eq('slug', slug).eq('yayinda', true).single()`. `@supabase/supabase-js` ile **modül seviyesinde** instantiate (cookies kullanmıyor; anon key public read).
- Metadata, `generateMetadata` async; başlık, açıklama (özet veya icerik kırpması), OG `type: 'article'`. `images` yok. Twitter card yok.
- Markdown render, `react-markdown` + `remark-gfm`; her HTML elementi (h2, h3, p, blockquote, table, code, vb.) ayrı `style={{}}` override ile.
- URL, `/makale/[slug]` (locale prefix yok). Listeleme sayfası yok; sadece home'daki MakalelerSection ile son 5 makale görünüyor (client fetch).
- Pagination yok; arama yok.

### 4.2 /hekim/[slug]/page.tsx

- Render, **SSR (async server component)**; `export const revalidate = 0` ile her istekte yeniden çekiliyor (force-dynamic'e yakın davranış).
- Veri kaynağı, `hekim_biyografileri` ve `makaleler` tabloları (`contains('kaynak_kodlar', [hekim.kaynak_kodu])` ile ilişkili makaleler).
- Metadata, `generateMetadata` ile başlık, açıklama, OG `type: 'profile'`. Twitter card yok, image yok.
- URL, `/hekim/[slug]`. Listeleme sayfası yok; home'daki MakalelerSection altındaki "Sistemin Mimarları" gridinde 9 hekim placeholder ile başlıyor, sonra Supabase'den `hekim_biyografileri` çekiyor.

### 4.3 Ortak gözlemler

- Hem `/makale/*` hem `/hekim/*`, server component olduğu için Phase 3 SSR rewrite'ında **ana iş, Bitkiler tarafında**. Bu iki yol için yapılacak ufak iyileştirmeler, Phase 2 sonrasında ele alınabilir; dokunma sırası: metadata.images, JSON-LD, Twitter card, ISR (revalidate=3600 gibi), opsiyonel listeleme sayfası (`/makale`, `/hekim`).

## 5. Migration Risk Listesi

### 5.1 Tailwind migration sırasında bozulabilecek noktalar

- **Hero animasyonları**, `globals.css` içindeki `gentlePulse`, `orbitDem/Saf/Bal/Sev`, `bgLogoPulse` keyframe'leri; sınıflar `hero-logo-anim`, `orbit-dem`, `logo-body` JSX'te kullanılıyor. Tailwind'e taşırken `tailwind.config.ts` `theme.extend.keyframes` ve `animation`'a tanımlanmazsa logo etkisi kaybolur.
- **Responsive grid override'ları**, iki yer; `globals.css` (`.hero-grid`, `.makale-grid`) ve `<style jsx global>` (`LandingClient`, `AnalizClient`). Tailwind sm/md/lg/`@media`'ya taşıdıktan sonra eski global selector'ları silinmezse stiller çakışır; silinirse 768px ve 960px breakpoint'lerinde layout patlayabilir.
- **Inline style + className karması**, Header ve büyük client component'lerde aynı node hem `style={{...}}` hem `className`. Migrasyonda kıvrımlı kazanç-kayıp; örneğin Header `style.fontFamily = cinzel.style.fontFamily` next/font ile dinamik üretildiği için Tailwind'e doğrudan utility ile değil, `style` veya CSS değişkeni üzerinden bağlanmalı.
- **Renk sabitleri çakışması**, dosya başlarında local `const C = { primary: '#1C3A26', ... }` objeleri var; tailwind.config'teki renk tokenleri ile aynı değerler ama refactor edilmedikçe iki kaynak güncel kalmalı; aksi halde palette drift olur.
- **`!important`'lı global CSS**, `globals.css` içindeki responsive override'lar `!important` kullanıyor; Tailwind utility'leri ile çakıştığında sürpriz spesifite sıralaması verir.
- **Arapça yön**, `dir='rtl'` segmentleri (`b.ad_ar` chip'i, hekim Arapça başlık) inline style ile sağa hizalı; Tailwind'e geçerken `dir`-aware utility'ler (`rtl:`, `ltr:`) gerekecek.
- **Inline `clamp()` font-size**, Tailwind'te native değil; custom theme veya arbitrary value (`text-[clamp(32px,4.5vw,50px)]`) ile taşımak gerek.
- **`<style jsx global>` blokları**, kaldırılırken global selector'ların yeni Tailwind class'ları ile bire-bir karşılığı gözden geçirilmeli; aksi halde mobilde grid tek kolon yerine çoklu kalır.
- **`react-markdown` component override'ları**, `/makale/[slug]` sayfasındaki h2/p/code/blockquote stilleri inline; Tailwind'e taşımak için `prose` (typography plugin yok, kurulması gerek) veya class-based override'a geçiş şart.
- **Form alanları**, `globals.css`'te `input/select/textarea { font-size: 16px !important }`; iOS Safari zoom hilesi için kritik. Tailwind utility ile değiştirilirken kaybolmamalı.

### 5.2 Bitkiler SSR'a çevirirken Supabase tarafı

- **RLS**, mevcut sayfa anon key ile browser'dan okuyor; demek ki `bitkiler` tablosu için public read RLS politikası açık. Server tarafa geçince aynı anon key kullanılabilir; cookie'lı server client'a gerek yok ama kullanırsa session cookie'leri server fetch'i kişiselleştirir (sayfa cache'lenemez hâle gelir). Ayrı bir **anonymous server fetch helper** kullanmak güvenli (`createClient(url, anon)` modül-seviyesi, makale ve hekim sayfalarında zaten aynı pattern var).
- **Env var kullanımı**, server tarafta `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` zaten tanımlı; service role asla server component'a sızdırılmamalı.
- **1000 satır limiti**, mevcut client iki range çağrısıyla aşıyor; server tarafa taşırken aynı pattern korunabilir veya `count` + paged select tercih edilir. Veri büyüdükçe (örn. 5000+) full prefetch sürdürülemez; sayfa parametreli SSR + filtre paramlarla server-side filtreleme öneri.
- **Cache stratejisi**, Next 14.2 `revalidate` veya 16'ya geçilirse Cache Components, `'use cache'`, `cacheTag('bitkiler')`. Bitki ekleme/güncelleme akışı yoksa `revalidate = 3600` makul.
- **`generateStaticParams`**, slug detay sayfaları için kullanılabilir; ama 1180 sayfa build süresini uzatır, ISR ile tembel üretim alternatif.
- **i18n**, locales tek olduğu için riski düşük, ama `[locale]` segmenti kalktığında URL `/bitkiler` zaten doğru.
- **Search ve filtre URL state'i**, server-side filtre `searchParams` ile yapılırsa SEO için yeni kanonik URL kombinasyonları oluşur; `robots.ts` veya `metadata.alternates.canonical` ile flag ayarı gerek.

### 5.3 Vercel deploy ve cache

- **`@vercel/analytics`** zaten root layout'ta; runtime sorunsuz.
- **`force-dynamic` etkisi**, `dashboard/hekim/*`, `hekim/[slug]/page.tsx` gibi dosyalarda `dynamic = 'force-dynamic'` veya `revalidate = 0`. Bitkiler sayfası bunu **kullanmamalı**, aksi halde edge cache devre dışı kalır.
- **Image remotePatterns**, sadece supabase.co domainleri var; OG image üretimi için yeni domain eklenirse `next.config.mjs` güncellenmeli.
- **Security headers**, `next.config.mjs` `Permissions-Policy: camera=(self)` cilt yükleme akışına izin veriyor; ileri taşımalarda muhafaza edilmeli.
- **Webpack ignore-loader**, Supabase Edge Functions kodu bundle dışı; gelecekte taşınırsa rule güncellenmeli.
- **Sitemap dinamik**, deploy sırasında runtime fetch; Supabase erişilemezse statik fallback'e düşüyor (mevcut try/catch). Bitki slug'ları eklendiğinde aynı try/catch koruması yeterli.
- **Middleware boyutu**, `@supabase/ssr` middleware'de çalışıyor; matcher tüm public yolları kapsadığı için her istek bir Supabase anon-cookie kontrolünden geçiyor. Auth gerekmeyen rotalarda middleware sadece `intlMiddleware` çalıştırıyor (zaten optimize). Phase 2 ve Phase 3 sonrası boyut artışı izlenmeli; şu an Vercel default function (Fluid Compute / Node) ile 1MB altında.
- **Env var yönetimi**, `.env.example`'da Supabase URL hard-code ile gözüküyor (örnek olarak); Vercel project env'de `NEXT_PUBLIC_*` ve `SUPABASE_SERVICE_ROLE_KEY` doğru ortamlarda olduğundan emin olunmalı (Phase 2/3 deploylarında).
- **Build cache**, Tailwind class'larının dinamik string concat ile üretildiği yerler (örn. `border-${C.color}`) varsa Tailwind JIT içerik taraması bunları yakalayamaz; safelist veya statik class gerek.

## 6. Önerilen Phase 2 Sırası

Phase 2'nin amacı, mevcut inline-style ağırlıklı kodu Tailwind'e taşımak; aynı zamanda `globals.css` ve `<style jsx global>` ile dağılmış global kuralları konsolide etmektir. Sıralama, **bağımlılık ve risk** üzerine kuruludur; en stabil parçalardan başla, en görünür ve karmaşık sayfaları en sona bırak.

### 6.0 Hazırlık adımı (kod değişikliği yok ama Phase 2'nin ilk eylemi)

- `tailwind.config.ts`'e `theme.extend.keyframes` ve `animation` ekleyerek `globals.css`'teki keyframe'leri duplicate etmeden Tailwind utility'leri olarak çıkar.
- Eksik Tailwind plugin değerlendirmesi; `@tailwindcss/typography` (makale Markdown render override'larını sadeleştirmek için) ve `tailwindcss-rtl` veya manuel `rtl:` kullanım kararı.
- Renk token'larını `tailwind.config.ts`'te otoriter kabul et; tüm dosyalardaki local `const C = {}` blokları silinmeden migrasyon yapılmamalı (palette drift riski).

**Gerekçe**, geri kalan tüm migrasyonlar bu konfigürasyona yaslanır; sonradan değiştirilirse ikinci tur refactor gerekir.

### 6.1 Önce, Tailwind'e zaten yakın olanlar (sadece temizlik)

- `app/[locale]/dashboard/atlas/page.tsx`
- `app/[locale]/analiz/basarili/page.tsx`
- `app/[locale]/odeme/page.tsx`
- `app/[locale]/dashboard/hekim/maliyet/page.tsx`
- `app/[locale]/dashboard/hekim/gelen-kutu/page.tsx`
- `app/[locale]/dashboard/hekim/talep/[id]/{page,DurumDegistirForm,AnalizBaslatClient,TaslakGoruntule}.tsx`
- `app/[locale]/hasta/analizlerim/[id]/page.tsx`
- `app/[locale]/hasta/DurumEtiketi.tsx`
- `app/[locale]/hasta/analizlerim/page.tsx`

**Gerekçe**, bunlar büyük oranda Tailwind kullanıyor; küçük dokunuşlarla ısınma turu olur, Tailwind config token'ları test edilir, paletten kaynaklı renk kayması erkenden yakalanır.

### 6.2 Sonra, görece izole orta zorlukta sayfalar

- `app/[locale]/giris/page.tsx`
- `app/[locale]/kayit/page.tsx`
- `app/[locale]/sifre-guncelle/page.tsx`
- `app/[locale]/sifremi-unuttum/page.tsx`
- `app/[locale]/sss/page.tsx`
- `app/[locale]/kvkk/page.tsx`
- `app/[locale]/gizlilik-politikasi/page.tsx`
- `app/[locale]/hakkimizda/page.tsx`
- `app/[locale]/not-found.tsx`
- `app/[locale]/error.tsx`
- `app/[locale]/dashboard/error.tsx`
- `app/[locale]/admin/page.tsx`
- `app/[locale]/yorum-yaz/page.tsx`

**Gerekçe**, görsel açıdan basit (form, statik metin); test maliyeti düşük; her biri tek başına ayağa kalkar. Auth ve form input zoom'unu (16px font-size) Tailwind utility ile sabitlemenin doğrulaması burada yapılır.

### 6.3 Hasta ve Dashboard alt yolları

- `app/[locale]/hasta/page.tsx`
- `app/[locale]/hasta/profil/page.tsx`
- `app/[locale]/hasta/ayarlar/page.tsx`
- `app/[locale]/hasta/takip/page.tsx`
- `app/[locale]/hasta/cilt/page.tsx`
- `app/[locale]/hasta/cilt-analizlerim/page.tsx`
- `app/[locale]/hasta/cilt-analizlerim/[id]/page.tsx`
- `app/[locale]/hasta/analiz/[id]/page.tsx`
- `app/[locale]/profil/page.tsx`
- `app/[locale]/dashboard/hastalar/page.tsx`
- `app/[locale]/dashboard/yorumlar/page.tsx`
- `app/[locale]/dashboard/cilt/page.tsx`
- `app/[locale]/dashboard/arsiv/page.tsx`
- `app/[locale]/dashboard/cilt/[id]/page.tsx`
- `app/[locale]/dashboard/page.tsx` (en sona)

**Gerekçe**, hasta ve dashboard yolları auth arkasında; SEO etkisi yok, regresyon riski sadece UX. Dashboard 1387 satır, alt sayfalar bittikten sonra ortak kart, badge ve durum etiketi pattern'leri çıkar; bu pattern'leri shared component olarak çıkarmak yerine **inline kalsın** (görev kapsamı dışı), sadece className'e çevir.

### 6.4 `/makale/[slug]` ve `/hekim/[slug]`

- `app/[locale]/makale/[slug]/page.tsx`
- `app/[locale]/hekim/[slug]/page.tsx`

**Gerekçe**, server component'lar; `react-markdown` override'ları için `@tailwindcss/typography` `prose` class'ı veya açık className override'ı tek seferde gözden geçirilmeli. SEO görünür, ama trafik sınırlı; Phase 3 öncesi temizlemek mantıklı.

### 6.5 Components

- `components/Logo.tsx` (küçük, ısınma)
- `components/AnatomyViewer.tsx` (zaten Tailwind ağırlıklı)
- `components/MakaleUret.tsx` (admin tool, görsel yüksek standart gerekmez)
- `components/MakalelerSection.tsx` (homepage'de görünür, dikkatli)
- `app/[locale]/components/Footer.tsx`
- `app/[locale]/components/Header.tsx`

**Gerekçe**, header ve footer her sayfada görünüyor; başta migrate edilirse bütün regresyonu tek seferde ölçmek zor olur. Daha küçük dosyalardan başlanıp en sonda Header bittirilir; mobil hamburger menü ve aktif bağlantı stilleri Tailwind'in `[data-active]:` veya conditional className pattern'i ile gözden geçirilir.

### 6.6 Hero'lar ve büyük client component'lar (en son)

- `app/[locale]/karakter/page.tsx`
- `app/[locale]/karakter/sonuc/page.tsx`
- `app/[locale]/LandingClient.tsx` (artı `<style jsx global>` bloğunu silme)
- `app/[locale]/analiz/AnalizClient.tsx` (artı `<style jsx global>` bloğunu silme)

**Gerekçe**, en yüksek görünürlük; Landing ve Analiz sayfası, ürünün satış yüzeyleri. `clamp()` font-size ve `rgba()` alpha değerleri özen ister. `<style jsx global>` blokları silinmeden önce karşılıkları Tailwind responsive prefix'leri ile yazılmalı; karşılıklar QA ile doğrulandıktan sonra global blok silinir.

### 6.7 Bitkiler (sadece Tailwind kısmı, render değişikliği yok)

- `app/[locale]/bitkiler/BitkilerClient.tsx`

**Gerekçe**, Phase 3'te SSR'a geçeceği için; Phase 2'de Tailwind'e taşınması, Phase 3 patch'iyle tekrar dokunulacak alanı azaltır. Ayrıca repoda hâlihazırda `bitkiler_ssr.patch` taslağı bulunduğundan, Tailwind taşıması o patch'le iç içe yapılmamalı; **önce Tailwind, sonra render**.

### 6.8 Konsolidasyon ve temizlik

- `app/[locale]/globals.css` içindeki `.hero-grid`, `.makale-grid`, `.hero-card-mobile`, `.hero-card-desktop`, `.hero-logo-col`, `.makale-featured` gibi tek-amaçlı global class'ları sil.
- Local `const C = {...}` palette objelerini sil; tüm referanslar Tailwind utility'lerine ya da `colors.*` token'larına çevrilmiş olmalı.
- `globals.css`, sadece `@tailwind` direktifleri, `:root` font değişkenleri, base tipografi (`body`, `h1, h2, h3`, `p`, `blockquote`), `::selection`, ve `@layer utilities { .text-balance }` ile kalsın.
- Eski `--renk-*` değişkenleri grep'lenip kullanılmıyorsa silinsin (Phase 2 temizliği).

**Phase 2 sonu çıktı kontrol**, repoda `style={{` greplemesi tek haneli kalmalı (sadece SVG inline animasyon stilleri veya dinamik `var(--...)` enjeksiyonları); `<style jsx>` ve `<style>` blokları kalmamalı; `globals.css` 80 satır altına insin.

---

Bu rapor Phase 1 kapsamında üretilmiştir. Phase 2 başlamadan önce bu sıra üzerinde uzlaşma sağlanmalı; özellikle 6.0 (token konsolidasyonu) atlandığında Phase 2 boyunca ikili palette taşıma maliyeti her dosyada tekrarlanır.
