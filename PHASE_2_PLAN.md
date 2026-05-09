# Phase 2: Tailwind Migration Plan

> Bu doküman Phase 2 (Tailwind tam migrasyonu) sırasında Claude Code'un referans alacağı yığın iş planıdır. **AUDIT_REPORT.md ile birlikte okunmalıdır.** AUDIT bağlam (mevcut durum tespiti); bu dosya yığın iş planı (ne, hangi sırayla, hangi kurallarla yapılacak).

> **Süreç modeli:**
> - **Claude Code:** Executor. Bu plan + AUDIT_REPORT'u okur, sıradaki paketi yapar, build + commit + PR açar, plan dosyasının "İlerleme Takibi" bölümünü günceller.
> - **Üstad (Fatih):** Onaycı. PR review + merge + manuel görsel regresyon.
> - **Claude.ai (stratejik gözetmen):** DUR sinyali tetiklendiğinde veya Phase 3 / kapsam dışı kararda devreye girer.

---

## 1. Genel Kurallar

Her paket için geçerli, istisnasız.

1. **Em dash yasak.** `—` karakteri kod yorumlarında, commit mesajlarında, PR body'lerinde, doküman içinde kesinlikle yok. Yerine `;`, `:`, `,`, `.`, `()` kullan.
2. **Anti-hallucination.** Kanıtlanmamış spekülasyonu commit mesajına, yorum satırına, PR body'sine yazma. Şüpheli noktayı `// TODO(phase2): ...` ile işaretle, geçici bırak.
3. **Behavior unchanged sözü.** Phase 2 paketleri **refactor**'dur. Davranış birebir aynı kalmalı: JSX yapısı, `'use client'` direktifi, içerik metni, link href, form submit logic, state, hook çağrıları. Sadece **stil yöntemi** (inline `style={{}}` → Tailwind utility class) değişir. Farklı bir şey değişmesi gerektiğini düşünüyorsan **DUR**.
4. **Renk drift uyarısı.** Hardcode hex renk kullanma. `tailwind.config.ts`'deki mevcut token'ları kullan. Gerekli token tanımlı değilse, **yeni token ekleme**, geçici olarak en yakın Tailwind palette değerini koy ve `// TODO(phase2-token): "#1C3A26" yerine token tanımı gerekli` notu bırak. Token konsolidasyonu Paket 6.8'de yapılacak.
5. **Kapsam dışı işe dokunma.** Refactor sırasında "şu da düzeltilse iyi olur" hissedersen yapma; yeni issue / TODO bırak. Kapsam genişlemesi PR review'u zorlaştırır.
6. **Branch doğrulama her commit öncesi.** `git rev-parse --abbrev-ref HEAD` çıktısını teyit et, `main`'de commit atma.
7. **Build temiz olmadan commit yok.** `npm run build` lokalde geçmeli. TypeScript hatası, ESLint error (warning değil), runtime hata varsa commit atma; **DUR**.
8. **Manuel görsel regresyon (üstad yapar).** Her PR sonrası üstad `npm run dev` ile sayfayı eski hâliyle karşılaştırır. Claude Code bunu otomatik yapamaz; PR body'sinde "manuel görsel kontrol gerekli" notunu mutlaka bırak.
9. **PR-based workflow.** Branch açılır, paket bitince `gh pr create`, üstad onayı sonrası `gh pr merge --squash --delete-branch`. Direkt `main`'e push yok.
10. **Phase 2.1 (commit `98e344b`) pattern referansı.** Önceki turda 12 dosya zaten Tailwind'e taşınmış. Yeni dosyaları taşırken bu commit'in kullandığı class konvansiyonunu (spacing, typography, color) takip et; yenisini icat etme.

---

## 2. DUR Sinyalleri

Claude Code aşağıdaki durumların **herhangi birinde** durmalı, paketi yarıda bırakmamalı, commit/push yapmadan önce üstada (ve gerekirse Claude.ai'a) danışmalı.

| # | Sinyal | Örnek |
|---|--------|-------|
| D1 | Build/typecheck hatası | `npm run build` non-zero exit code |
| D2 | Token yok renk | Inline style'da `tailwind.config.ts`'de karşılığı olmayan hex |
| D3 | Pattern uyumsuz | Inline style'ın Tailwind utility ile birebir karşılığı yok (örn. complex `transform`, `clip-path`) |
| D4 | Davranış değişikliği gerekli görünüyor | Inline style hesaplama gerektiriyor (`style={{ width: dynamicValue }}`) ve Tailwind'e direkt taşımak için JSX değişimi şart |
| D5 | Beklenmeyen yapı | Audit'te listelenmemiş ek inline style bloğu, bilinmeyen import, ölü kod kalıntısı (LandingClient orphan tarzı) |
| D6 | Acceptance criteria şüpheli | Paketin "tamamlandı" sayılması için verilen kriterler somut karşılanmıyor |
| D7 | Yeni kapsam | "Bu da Phase 2'de yapılsa iyi olur" düşüncesi geliyorsa, paketin kapsamı dışında |

**DUR sonrası:**
- Branch'i bırak (revert etme), commit atma
- Plan dosyasının "İlerleme Takibi" bölümüne paket durumunu `BLOKED: <neden>` olarak işaretle
- Üstada özetle: ne sinyali, ne gördün, hangi karar lazım

---

## 3. Paketler (Sıralı)

### Paket 6.2.A: Statik 3'lü

| Detay | Değer |
|-------|-------|
| Hedef dosyalar | `app/[locale]/sss/page.tsx`, `app/[locale]/kvkk/page.tsx`, `app/[locale]/hakkimizda/page.tsx` |
| Toplam inline style | 54 (12 + 12 + 30) |
| Branch | `refactor/phase-2-6-2-static-tailwind` |
| Commit yapısı | 3 commit, dosya başına bir tane |
| Commit mesajları | `refactor(sss): migrate inline styles to Tailwind utilities` / `refactor(kvkk): ...` / `refactor(hakkimizda): ...` |
| Acceptance | (1) `style={{}}` sayısı 3 dosyada 0. (2) `npm run build` temiz. (3) `globals.css` ve `tailwind.config.ts` değişmedi (renk drift yok). (4) Davranış birebir aynı (manuel görsel regresyon üstad yapacak). |
| Risk | Düşük (statik içerik) |
| Sıra | sss → kvkk → hakkimizda (küçükten büyüğe) |

### Paket 6.2.B: Form 2'li

| Detay | Değer |
|-------|-------|
| Hedef dosyalar | `app/[locale]/giris/page.tsx`, `app/[locale]/kayit/page.tsx` |
| Toplam inline style | 69 (27 + 42) |
| Branch | `refactor/phase-2-6-2-forms-tailwind` |
| Commit yapısı | 2 commit |
| Acceptance | (1) `style={{}}` sayısı 2 dosyada 0. (2) Build temiz. (3) Form submit, validation, error state, redirect davranışları aynı. (4) `'use client'` direktifi korundu. (5) Üstad manuel auth flow testi yapacak (giriş, kayıt, hatalı şifre, başarılı kayıt). |
| Risk | Orta (auth UX kritik) |
| Not | Form regresyonu olursa Supabase auth flow'u test edilmeli; kullanıcı kaybetmek istemediğimiz yer burası |

### Paket 6.3: Hasta + Dashboard

| Detay | Değer |
|-------|-------|
| Hedef dosyalar | `app/[locale]/hasta/...`, `app/[locale]/dashboard/...` (alt route'lar dahil) |
| Branch | `refactor/phase-2-6-3-hasta-dashboard-tailwind` |
| Commit yapısı | Route grubu başına bir commit (örn. hasta için tek commit, dashboard için tek commit; çok büyürse alt sayfa bazında parçala) |
| Acceptance | (1) `style={{}}` sayısı hedef alanda 0. (2) Build temiz. (3) Auth-protected route davranışı aynı (middleware bypass yok). (4) Dashboard widget'ları hata vermiyor. |
| Risk | Orta |
| Not | Bu paket başlamadan önce Claude Code önce `find app/\[locale\]/hasta app/\[locale\]/dashboard -name "page.tsx"` ile dosya envanteri çıkarmalı; üstad onaylasın, ondan sonra paket başlasın |

### Paket 6.4: Makale / Hekim Slug

| Detay | Değer |
|-------|-------|
| Hedef dosyalar | `app/[locale]/makale/[slug]/page.tsx`, `app/[locale]/hekim/[slug]/page.tsx` (ve varsa client component'leri) |
| Branch | `refactor/phase-2-6-4-slug-pages-tailwind` |
| Commit yapısı | 2 commit (makale slug, hekim slug) |
| Acceptance | (1) `style={{}}` sayısı 0. (2) Build temiz. (3) Slug routing çalışıyor (üstad birkaç random slug açıp test edecek). (4) JSON-LD / metadata değişmedi. |
| Risk | Orta-yüksek (SEO görünür sayfa) |
| Not | Memory'deki "SEO fix /makale/* /hekim/* MİZAN entegrasyonu sonrasına ertelendi" notu Tailwind taşıması için geçerli değil; SSR/SEO yapısal değişikliği bu paketin kapsamı **dışında**, sadece stil değişiyor. Eğer sayfa CSR ise, CSR olarak kalsın. SSR'a çevirme Phase 3 işi. |

### Paket 6.5: Shared Components

| Detay | Değer |
|-------|-------|
| Hedef dosyalar | `app/[locale]/components/Logo.tsx`, `Header.tsx`, `Footer.tsx`, `MakalelerSection.tsx` (ve audit'te listelenen diğer paylaşılan komponentler) |
| Branch | `refactor/phase-2-6-5-shared-components-tailwind` |
| Commit yapısı | Component başına bir commit (4-5 commit) |
| Acceptance | (1) `style={{}}` 0. (2) Build temiz. (3) Bu component'leri import eden tüm sayfalar build'de hata vermiyor. (4) Logo SVG / favicon davranışı aynı. (5) Header navigation, mobile menu (varsa), Footer link'leri çalışıyor. |
| Risk | **Yüksek** (her sayfa kullanıyor, regresyon her yere yayılır) |
| Not | Component değişikliği global etkili. Üstad bu paket merge'inden sonra **birden fazla sayfayı** manuel ziyaret etmeli (landing, hekim, makale, hasta, dashboard, sss). |

### Paket 6.6: AnalizClient (`<style jsx global>` silme)

| Detay | Değer |
|-------|-------|
| Hedef dosyalar | `app/[locale]/analiz/.../AnalizClient.tsx` (veya bulunduğu yer) |
| Branch | `refactor/phase-2-6-6-analiz-style-jsx-global` |
| Commit yapısı | Tek dosyada işse tek commit; refactor büyükse 2 commit (önce inline style, sonra `<style jsx global>` bloğu silinmesi) |
| Acceptance | (1) `<style jsx global>` bloğu yok. (2) `style={{}}` 0. (3) Build temiz. (4) MİZAN analiz wizard 8 adım davranışı aynı (üstad full wizard testi yapacak). |
| Risk | **En yüksek** |
| **Önemli not:** | Audit'te 6.6 başlığı "LandingClient + AnalizClient" idi. **LandingClient artık yok** (PR #7 ile silindi, repo kontrolü yapıldı). Bu paket **sadece AnalizClient**. |

### Paket 6.7: Bitkiler (sadece Tailwind)

| Detay | Değer |
|-------|-------|
| Hedef dosyalar | `app/[locale]/bitkiler/page.tsx`, `BitkilerClient.tsx` (varsa diğer bitki component'leri) |
| Branch | `refactor/phase-2-6-7-bitkiler-tailwind` |
| Commit yapısı | 2 commit (page + client) |
| Acceptance | (1) `style={{}}` 0. (2) Build temiz. (3) Bitki listesi render ediliyor (kısmi SSR yapısı korundu, render davranışı değişmedi). (4) Filtreleme / arama (varsa) çalışıyor. |
| Risk | Orta |
| Not | **Render davranışı bu pakette değişmiyor.** SSR + slug + ISR Phase 3 işi. Bu paket sadece stil yöntemi. Mevcut "kısmi SSR" yapısı (commit `80e4194`) korunacak. |

### Paket 6.8: Konsolidasyon

| Detay | Değer |
|-------|-------|
| Hedef | (1) `globals.css` küçültme (audit hedefi: 80 satırın altı). (2) Tüm dosyalardaki local `const C = {...}` renk objelerini sil, `tailwind.config.ts` token'larına geçir. (3) Phase 2 boyunca bırakılan `// TODO(phase2-token)` notlarını çöz. |
| Branch | `refactor/phase-2-6-8-consolidation` |
| Commit yapısı | Çok commit (her tür temizlik ayrı): `style: shrink globals.css to <80 lines` / `refactor(theme): centralize color tokens in tailwind.config` / `chore: remove local C objects` |
| Acceptance | (1) `globals.css` < 80 satır. (2) Repo'da `const C = {` deseni 0 sonuç. (3) `// TODO(phase2-token)` 0 sonuç. (4) Build temiz. (5) Tüm sayfalarda görsel regresyon yok (üstad bu paketten sonra **kapsamlı manuel test** yapacak; Phase 2 final). |
| Risk | Orta-yüksek (global CSS değişikliği) |
| Not | Bu paket Phase 2'nin **kapanış paketi**. Bittikten sonra Phase 2 raporu yazılacak (AUDIT_REPORT.md güncellemesi veya `PHASE_2_COMPLETED.md` yeni dosya). |

---

## 4. Phase 3 (Kapsam Dışı, Referans Notu)

Phase 3 hedefi (audit raporundan): Bitkiler için **render** değişikliği — SSR + ISR + `[slug]` detay route + sitemap + JSON-LD.

**Bu plan dosyası Phase 3'ü içermez.** Phase 2.8 tamamlandıktan sonra ayrı bir `PHASE_3_PLAN.md` taslayacağız. Phase 2 sırasında Phase 3 alanına dokunma.

---

## 5. İlerleme Takibi

> Claude Code her paket başlangıcında ve bitiminde bu tabloyu günceller. Tek satır commit yeter (`docs(plan): mark 6.2.A as in-progress`).

| Paket | Branch | PR | Durum | Tamamlanma Tarihi | Notlar |
|-------|--------|-----|-------|-------------------|--------|
| 6.2.A Statik 3'lü | `refactor/phase-2-6-2-static-tailwind` | - | AÇIK | - | İlk paket, "test koşusu" |
| 6.2.B Form 2'li | - | - | BEKLİYOR | - | 6.2.A bitince başlasın |
| 6.3 Hasta + Dashboard | - | - | BEKLİYOR | - | Önce dosya envanteri lazım |
| 6.4 Makale/Hekim Slug | - | - | BEKLİYOR | - | SEO etkisi var, dikkat |
| 6.5 Shared Components | - | - | BEKLİYOR | - | Yüksek risk, çok sayfa etkilenir |
| 6.6 AnalizClient | - | - | BEKLİYOR | - | LandingClient zaten silinmiş, sadece AnalizClient |
| 6.7 Bitkiler Tailwind | - | - | BEKLİYOR | - | Render Phase 3'e ait, dokunma |
| 6.8 Konsolidasyon | - | - | BEKLİYOR | - | Phase 2 kapanış paketi |

**Durum değerleri:** `BEKLİYOR`, `AÇIK`, `IN-PROGRESS`, `IN-REVIEW` (PR açık), `MERGED`, `BLOKED: <neden>`

---

## 6. Öğrenilen / Notlar

> Her paket sonrası Claude Code öğrenilenleri buraya ekler. Bir sonraki paket bu notları okur.

### A: silent 401 guard (önceki tur, Phase 2 öncesi spot-fix)
- `lib/landing/data.ts` Promise.all sonrası error guard'ı eksikti, sessiz boş array döner Vercel log'da iz kalmazdı.
- Düzeltme: 5 satırlık `for (const res of responses) if (res.error) throw ...` bloğu.
- Pattern: Supabase response'unu `data ?? []` ile geçiştirmeden önce `res.error` kontrolü her zaman gerekli.

### Phase 2.1 referansı (commit `98e344b`)
- 12 dosya Tailwind'e taşındı, Phase 2.0 hazırlığından sonra ilk büyük tur.
- Sonraki paketlerde class konvansiyonu için bu commit referans alınacak.

### LandingClient orphan keşfi
- AUDIT_REPORT.md ve README.md hâlâ `LandingClient` referansı içeriyor; dosya PR #7 ile silindiği için ölü referans.
- Phase 2.8 konsolidasyonunda doc temizliği de yapılacak (veya 6.6'da AnalizClient yapılırken yan iş olarak güncellenebilir).

---

## 7. Versiyon

| Sürüm | Tarih | Değişiklik |
|-------|-------|-----------|
| v1.0 | 10 May 2026 | İlk taslak |
