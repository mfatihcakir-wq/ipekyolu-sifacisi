-- ================================================
-- İpek Yolu Şifacısı — Veritabanı Kurulumu
-- Wellum Klinik Yönetim Sistemi
-- ================================================
-- Supabase SQL Editor'da çalıştırın:
-- https://supabase.com/dashboard/project/smlcdldxtxwajzefxfrz/sql/new
--
-- NOT: Mevcut patients tablosuna dokunulmaz.
-- ================================================


-- ================================================
-- 1. PATIENTS (mevcut tablo — dokunma, sadece koru)
-- ================================================
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_soyad TEXT NOT NULL,
  dogum_tarihi DATE,
  cinsiyet TEXT,
  telefon TEXT,
  sikayet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'hasta_policy' AND tablename = 'patients'
  ) THEN
    CREATE POLICY "hasta_policy" ON public.patients
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;


-- ================================================
-- 2. PAYMENTS (ödemeler — önce oluştur, detailed_forms referans verecek)
-- ================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  tutar INTEGER NOT NULL,
  iyzico_payment_id TEXT,
  durum TEXT NOT NULL DEFAULT 'bekliyor'
    CHECK (durum IN ('bekliyor', 'basarili', 'basarisiz')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'payments_policy' AND tablename = 'payments'
  ) THEN
    CREATE POLICY "payments_policy" ON public.payments
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;


-- ================================================
-- 3. SUBSCRIPTIONS (abonelikler)
-- ================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL
    CHECK (plan IN ('aylik', 'yillik', 'tek_seferlik', 'uc_analiz')),
  fiyat INTEGER NOT NULL,
  baslangic TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  bitis TIMESTAMP WITH TIME ZONE,
  durum TEXT NOT NULL DEFAULT 'aktif'
    CHECK (durum IN ('aktif', 'iptal', 'bitti')),
  iyzico_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'subscriptions_policy' AND tablename = 'subscriptions'
  ) THEN
    CREATE POLICY "subscriptions_policy" ON public.subscriptions
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;


-- ================================================
-- 4. BASIC_FORMS (temel form — üye olmadan da doldurulabilir)
-- ================================================
CREATE TABLE IF NOT EXISTS public.basic_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  yas_grubu TEXT,
  cinsiyet TEXT,
  mevsim TEXT,
  kronik TEXT,
  sikayet TEXT,
  uyku TEXT,
  stres TEXT,
  tahmin_mizac TEXT,
  kvkk_onay BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.basic_forms ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi formlarını görebilir + user_id NULL olanlar herkese açık (anonim formlar)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'basic_forms_select' AND tablename = 'basic_forms'
  ) THEN
    CREATE POLICY "basic_forms_select" ON public.basic_forms
      FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'basic_forms_insert' AND tablename = 'basic_forms'
  ) THEN
    CREATE POLICY "basic_forms_insert" ON public.basic_forms
      FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'basic_forms_update' AND tablename = 'basic_forms'
  ) THEN
    CREATE POLICY "basic_forms_update" ON public.basic_forms
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'basic_forms_delete' AND tablename = 'basic_forms'
  ) THEN
    CREATE POLICY "basic_forms_delete" ON public.basic_forms
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;


-- ================================================
-- 5. DETAILED_FORMS (detaylı form — üyelik gerektirir)
-- ================================================
CREATE TABLE IF NOT EXISTS public.detailed_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  basic_form_id UUID REFERENCES public.basic_forms(id) ON DELETE SET NULL,
  telefon TEXT NOT NULL,
  tam_ad TEXT NOT NULL,
  tum_form_verisi JSONB,
  odeme_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  durum TEXT NOT NULL DEFAULT 'bekliyor'
    CHECK (durum IN ('bekliyor', 'inceleniyor', 'tamamlandi')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.detailed_forms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'detailed_forms_policy' AND tablename = 'detailed_forms'
  ) THEN
    CREATE POLICY "detailed_forms_policy" ON public.detailed_forms
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;


-- ================================================
-- 6. ANALYSES (AI analiz sonuçları — sadece doktor erişir)
-- ================================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  detailed_form_id UUID REFERENCES public.detailed_forms(id) ON DELETE CASCADE NOT NULL,
  sonuc_verisi JSONB,
  mizac_tipi TEXT,
  baskin_hilt TEXT,
  recete JSONB,
  doktor_notu TEXT,
  wa_gonderildi BOOLEAN NOT NULL DEFAULT FALSE,
  wa_tarih TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Doktor erişimi: Supabase Dashboard'dan doktor kullanıcısının UUID'sini buraya yazın
-- Örnek: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
-- Şimdilik auth.uid() bazlı — doktor UUID belirlendikten sonra güncellenecek
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'analyses_doktor_select' AND tablename = 'analyses'
  ) THEN
    CREATE POLICY "analyses_doktor_select" ON public.analyses
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.detailed_forms df
          WHERE df.id = detailed_form_id AND df.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'analyses_doktor_insert' AND tablename = 'analyses'
  ) THEN
    CREATE POLICY "analyses_doktor_insert" ON public.analyses
      FOR INSERT WITH CHECK (TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'analyses_doktor_update' AND tablename = 'analyses'
  ) THEN
    CREATE POLICY "analyses_doktor_update" ON public.analyses
      FOR UPDATE USING (TRUE);
  END IF;
END
$$;


-- ================================================
-- İNDEKSLER (performans)
-- ================================================
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_durum ON public.subscriptions(durum);
CREATE INDEX IF NOT EXISTS idx_basic_forms_user_id ON public.basic_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_forms_user_id ON public.detailed_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_forms_durum ON public.detailed_forms(durum);
CREATE INDEX IF NOT EXISTS idx_analyses_detailed_form_id ON public.analyses(detailed_form_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
