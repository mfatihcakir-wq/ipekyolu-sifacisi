-- Landing sayfası için istatistik view'ı.
-- klasik_kaynaklar tablosundan distinct kaynak_kodu sayısını hesaplar; her sayfa
-- yüklemesinde 56K satır taramaktan kaçınmak için view kullanıyoruz.
--
-- Kullanım: select * from public.landing_stats;
--
-- Eğer kaynak_kodu sayısı çok seyrek değişiyorsa view yerine materialized view
-- de tercih edilebilir (refresh manuel veya cron ile).

create or replace view public.landing_stats as
select
  (select count(distinct kaynak_kodu)
     from public.klasik_kaynaklar
     where kaynak_kodu is not null) as kaynak_sayisi,
  (select count(*) from public.klasik_kaynaklar) +
  (select count(*) from public.karakter_kaynaklar) as toplam_chunk,
  (select count(*) from public.bitkiler) as bitki_sayisi,
  (select count(*) from public.makaleler where yayinda = true) as yayindaki_makale,
  (select count(*) from public.hekim_biyografileri where aktif = true) as aktif_hekim;

-- Anonymous kullanıcılar landing'de bu view'i okuyabilsin diye RLS yerine
-- doğrudan grant; view'in altındaki tablolar zaten RLS ile korunuyor ama
-- count operasyonu için service role kullanıyoruz (server side fetch).
-- İstersen anon role'a da select yetkisi açabilirsin:
-- grant select on public.landing_stats to anon;
grant select on public.landing_stats to authenticated, service_role;

comment on view public.landing_stats is
  'Landing sayfası için sayısal istatistikler. Saatte bir ISR ile cache lenir.';
