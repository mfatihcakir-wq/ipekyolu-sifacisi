-- ════════════════════════════════════════════════════
-- KARAKTER ANALİZİ TABLOLARI
-- İpek Yolu Şifacısı — Ayrı schema, tıbbi veriye dokunmaz
-- ════════════════════════════════════════════════════

-- 1. KAYNAK TABLOSU (klasik_kaynaklar'dan BAĞIMSIZ)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.karakter_kaynaklar (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kaynak_kodu  TEXT NOT NULL,
  kitap_adi    TEXT NOT NULL,
  yazar        TEXT,
  bolum        TEXT,
  icerik_tr    TEXT NOT NULL,
  oncelik      INTEGER DEFAULT 7,
  kategori     TEXT DEFAULT 'karakter',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_karakter_kaynaklar_kod ON karakter_kaynaklar(kaynak_kodu);
CREATE INDEX idx_karakter_kaynaklar_fts
  ON karakter_kaynaklar
  USING gin(to_tsvector('simple', icerik_tr));

ALTER TABLE public.karakter_kaynaklar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "karakter_kaynaklar_public_read"
  ON public.karakter_kaynaklar FOR SELECT USING (true);


-- 2. CEPHE VE ASKER TABLOSU (yapılandırılmış)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.karakter_cepheler (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cephe_id     TEXT NOT NULL,        -- 'heva', 'nefs', 'dunya', 'seytan', 'akil', 'hilm', 'zuhd', 'zikr'
  cephe_ad     TEXT NOT NULL,
  cephe_ad_ar  TEXT,
  tip          TEXT NOT NULL,        -- 'dusman' veya 'erdem'
  konum        TEXT,                 -- 'sag', 'sol', 'onde', 'ensede'
  mukabili_id  TEXT,                 -- karşıt cephe
  aciklama     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.karakter_askerler (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cephe_id     TEXT NOT NULL,
  sira         INTEGER NOT NULL,
  ad           TEXT NOT NULL,
  ad_ar        TEXT,
  tanim        TEXT NOT NULL,
  tanim_sade   TEXT,                 -- kullanıcıya gösterilecek sade versiyon
  kategori     TEXT,                 -- 'kibir', 'hile', 'tembellik' vb.
  form_soru    TEXT,                 -- beyansal formda sorulacak soru
  agirlik      INTEGER DEFAULT 1,    -- skor hesaplamada ağırlık
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.karakter_cepheler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karakter_askerler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cepheler_public_read" ON public.karakter_cepheler FOR SELECT USING (true);
CREATE POLICY "askerler_public_read" ON public.karakter_askerler FOR SELECT USING (true);


-- 3. FORM TABLOSU
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.karakter_forms (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id),
  kayit_no          TEXT,                     -- KAR-YYMMDD-HHMM
  hasta_adi         TEXT,
  hasta_email       TEXT,
  hasta_telefon     TEXT,

  -- Fiziksel mizaç (mevcut sistemden köprü)
  fiziksel_mizac    TEXT,                     -- 'Demevî', 'Safravî', 'Balgamî', 'Sevdavî'
  fiziksel_analiz_id UUID,                    -- basic_forms tablosuna referans (opsiyonel)

  -- Karakter formu cevapları (JSON)
  form_cevaplari    JSONB,                    -- {soru_id: cevap, ...}

  -- Aktif askerler (form sonucu)
  aktif_askerler    TEXT[],                   -- ['hased', 'ucub', 'kesel', ...]

  -- Durum
  status            TEXT DEFAULT 'beklemede',  -- beklemede/analiz_edildi/onaylandi/email_gonderildi
  sonuc_verisi      JSONB,                    -- Claude'dan gelen JSON rapor
  onay_tarihi       TIMESTAMPTZ,
  email_gonderildi_at TIMESTAMPTZ,

  -- Kriz tespiti
  kriz_tespit       BOOLEAN DEFAULT false,

  -- Admin notu
  admin_notu        TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_karakter_forms_user ON karakter_forms(user_id);
CREATE INDEX idx_karakter_forms_status ON karakter_forms(status);
CREATE INDEX idx_karakter_forms_created ON karakter_forms(created_at DESC);

ALTER TABLE public.karakter_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "karakter_forms_user_select"
  ON public.karakter_forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "karakter_forms_user_insert"
  ON public.karakter_forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "karakter_forms_admin_all"
  ON public.karakter_forms FOR ALL
  USING (auth.role() = 'authenticated');


-- ════════════════════════════════════════════════════
-- ÇALIŞTIRMA SIRASI:
-- 1. Bu SQL'i Supabase SQL Editor'da çalıştır
-- 2. karakter_cepheler ve karakter_askerler tablolarına
--    ahlak_sistem_yapilandirilmis.json'dan veri yükle
-- 3. karakter_kaynaklar tablosuna karakter_analizi_TAM_15536.json'dan
--    veri yükle (Claude Code ile batch batch)
-- 4. klasik_kaynaklar tablosuna DOKUNMA
-- ════════════════════════════════════════════════════
