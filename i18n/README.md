# i18n yapılandırması

Şu an tek locale ('tr') ve `localePrefix: 'never'` ile çalışıyor. URL'lerde `/tr/` prefix'i yok; tüm sayfalar kök altında.

`app/[locale]/` klasör yapısı, gelecekte Arapça (veya başka diller) eklenmek istendiğinde altyapının hazır olması için korunuyor:

- `i18n/routing.ts`: locale listesi
- `i18n/request.ts`: server-side message loader
- `i18n/navigation.ts`: navigation helper
- `messages/tr.json`: Türkçe çeviriler
- `app/[locale]/layout.tsx`: `dir={locale === 'ar' ? 'rtl' : 'ltr'}` zaten Arapça için RTL desteği veriyor

## Yeni dil eklemek için

1. `i18n/routing.ts` içinde `locales: ['tr', 'ar']` yap
2. `messages/ar.json` oluştur (tr.json'u baz al)
3. `localePrefix`'i `'as-needed'` veya `'always'` yap (URL'lere `/ar/` eklenecek)
4. Tüm sayfa içeriklerini `useTranslations()` hook'u ile çeviri anahtarı kullanacak şekilde refactor et

## Tamamen kaldırmak için

Eğer Arapça desteği planlanmıyorsa:
- `app/[locale]/` altındaki her şey `app/` altına taşınır
- `next-intl` paketi kaldırılır
- `i18n/` ve `messages/` klasörleri silinir
- `middleware.ts` sadece auth korumasıyla kalır
- `next.config.mjs` içinden `withNextIntl` çıkarılır

Bu refactor 2-3 saatlik iş; Arapça vaadi netleşene kadar erteleniyor.
