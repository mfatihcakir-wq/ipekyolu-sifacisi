/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const HILT_ETIKET: Record<string, string> = {
  dem: 'Dem (Kan)',
  balgam: 'Balgam',
  sari_safra: 'Safrâ (Sarı Safra)',
  kara_safra: 'Sevdâ (Kara Safra)',
};

const HILT_RENK: Record<string, string> = {
  dem: 'bg-red-50 border-red-200 text-red-900',
  balgam: 'bg-blue-50 border-blue-200 text-blue-900',
  sari_safra: 'bg-amber-50 border-amber-200 text-amber-900',
  kara_safra: 'bg-stone-100 border-stone-300 text-stone-900',
};

const UYGULAMA_ETIKET: Record<string, string> = {
  mufredat: 'Tek Bitki (Müfredât)',
  macun: 'Macun (Maʿcûn)',
  serbet: 'Şerbet / Şurup',
  leuk: 'Leʿûk (Yalanan Şurup)',
  hab: 'Hap (Habb)',
  cuvarisn: 'Hazım Macunu (Cüvârişn)',
  duhn: 'Yağ (Duhn)',
  zimad: 'Yakı (Zımâd)',
  tila: 'Sürme (Tılâʾ)',
  buhur: 'Tütsü (Buhûr)',
  saut: 'Burun Damlası (Saʿût)',
  kuhl: 'Göz Merhemi (Kuhl)',
  gargara: 'Gargara',
  huknet: 'Lavman (Huknet)',
  fetile: 'Fitil (Fetîle)',
  agdiye_hassa: 'Şifa Yemeği (Ağdiye-i Hassa)',
};

export default async function AnalizDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/giris');

  const { data: talep } = await supabase
    .from('analiz_talepleri')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('durum', 'onayli')
    .single();
  if (!talep) notFound();

  const { data: sonuc } = await supabase
    .from('analiz_sonuclari')
    .select('onayli_cikti, onaylandi_at')
    .eq('talep_id', id)
    .single();
  if (!sonuc?.onayli_cikti) notFound();

  const c = sonuc.onayli_cikti;

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/hasta" className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-block">
        ← Analizlerim
      </Link>

      <header className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Analiz Raporu</h1>
        <div className="text-sm text-stone-500 mt-1">
          Onaylandı: {sonuc.onaylandi_at ? new Date(sonuc.onaylandi_at).toLocaleDateString('tr-TR') : '—'}
        </div>
      </header>

      {c.ozet && (
        <section className="mb-8 bg-emerald-50 border border-emerald-200 rounded-lg p-5">
          <h2 className="font-medium text-emerald-900 mb-2">Özet</h2>
          <p className="text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">{c.ozet}</p>
        </section>
      )}

      {(c.fitri_hali || c.mizac) && (
        <Bolum baslik="Mizaç Değerlendirmesi">
          {c.mizac?.tip && <Alan etiket="Mizaç Tipi" deger={`${c.mizac.tip}${c.mizac.tip_ar ? ` (${c.mizac.tip_ar})` : ''}`} />}
          {c.mizac?.tam_tanim && <Alan etiket="Tanım" deger={c.mizac.tam_tanim} />}
          {c.mizac?.ana_element && <Alan etiket="Ana Element" deger={c.mizac.ana_element} />}
          {c.fitri_hali?.hali_mizac && <Alan etiket="Hâlî Mizaç" deger={c.fitri_hali.hali_mizac} longText />}
          {c.fitri_hali?.fitri_mizac && <Alan etiket="Fıtrî Mizaç" deger={c.fitri_hali.fitri_mizac} />}
          {c.fitri_hali?.sapma && <Alan etiket="Mevcut Durum" deger={c.fitri_hali.sapma} longText />}
          {c.fitri_hali?.tedavi_hedefi && <Alan etiket="Tedavi Hedefi" deger={c.fitri_hali.tedavi_hedefi} longText />}
          {c.akut_kronik && <Alan etiket="Akut/Kronik" deger={c.akut_kronik} />}
          {c.etkilenen_sistem && <Alan etiket="Etkilenen Sistem" deger={c.etkilenen_sistem} />}
        </Bolum>
      )}

      {c.hiltlar && (
        <section className="border border-stone-200 rounded-lg p-5 mb-6">
          <h2 className="font-medium text-stone-800 mb-4">Hılt Dağılımı</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(c.hiltlar).map(([k, v]: [string, any]) => (
              <div key={k} className={`border rounded p-3 ${HILT_RENK[k] || 'bg-stone-50 border-stone-200'}`}>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="font-medium text-sm">{HILT_ETIKET[k] || k}</div>
                  <div className="text-lg font-serif">%{v?.oran ?? '–'}</div>
                </div>
                {v?.durum && <div className="text-xs uppercase tracking-wide opacity-75 mb-1">{v.durum}</div>}
                {v?.aciklama && <div className="text-xs leading-relaxed">{v.aciklama}</div>}
              </div>
            ))}
          </div>
          {c.baskin_hilt && (
            <div className="mt-4 text-sm text-stone-700">
              <strong>Baskın Hılt:</strong> {HILT_ETIKET[c.baskin_hilt] || c.baskin_hilt}
            </div>
          )}
        </section>
      )}

      {c.sebep_analizi && (c.sebep_analizi.badi_sebep || c.sebep_analizi.muid_sebepler?.length > 0) && (
        <Bolum baslik="Sebep Analizi">
          {c.sebep_analizi.badi_sebep && <Alan etiket="Yakın Sebep (Bâdî)" deger={c.sebep_analizi.badi_sebep} longText />}
          {c.sebep_analizi.muid_sebepler?.length > 0 && (
            <div>
              <div className="text-xs text-stone-500 mb-1">Uzak Sebepler (Mûid)</div>
              <ul className="text-sm text-stone-800 space-y-1 pl-4 list-disc">
                {c.sebep_analizi.muid_sebepler.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {c.sebep_analizi.kok_mudahale && <Alan etiket="Kök Müdahale" deger={c.sebep_analizi.kok_mudahale} longText />}
        </Bolum>
      )}

      {c.klinik_gozlemler?.length > 0 && (
        <Bolum baslik="Klinik Gözlemler">
          <ul className="text-sm text-stone-800 space-y-2">
            {c.klinik_gozlemler.map((g: string, i: number) => (
              <li key={i} className="pl-4 border-l-2 border-emerald-200 italic">{g}</li>
            ))}
          </ul>
        </Bolum>
      )}

      {c.beslenme_recetesi && (
        <Bolum baslik="Beslenme Önerisi">
          {c.beslenme_recetesi.ilke && <p className="text-sm text-stone-700 mb-3">{c.beslenme_recetesi.ilke}</p>}
          {c.beslenme_recetesi.ogun_duzeni && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded">
              <div className="text-xs font-medium text-emerald-900 mb-1">Öğün Düzeni</div>
              <div className="text-sm text-emerald-900">{c.beslenme_recetesi.ogun_duzeni}</div>
            </div>
          )}
          {c.beslenme_recetesi.onerililer?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-stone-500 mb-1">Önerilenler</div>
              <div className="flex flex-wrap gap-2">
                {c.beslenme_recetesi.onerililer.map((g: string, i: number) =>
                  <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-800 text-xs rounded">{g}</span>
                )}
              </div>
            </div>
          )}
          {c.beslenme_recetesi.kacinilacaklar?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-stone-500 mb-1">Kaçınılacaklar</div>
              <div className="flex flex-wrap gap-2">
                {c.beslenme_recetesi.kacinilacaklar.map((g: string, i: number) =>
                  <span key={i} className="px-2 py-1 bg-red-50 text-red-800 text-xs rounded">{g}</span>
                )}
              </div>
            </div>
          )}
          {c.beslenme_recetesi.agdiye_i_hassa?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-stone-500 mb-1">Şifa Yemekleri</div>
              <ul className="text-sm text-stone-700 space-y-1 pl-4 list-disc">
                {c.beslenme_recetesi.agdiye_i_hassa.map((y: any, i: number) => (
                  <li key={i}>
                    {typeof y === 'string' ? y : (
                      <>
                        <strong>{y.isim}</strong>
                        {y.aciklama && <> — {y.aciklama}</>}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {c.beslenme_recetesi.pisirme_yontemi && <Alan etiket="Pişirme" deger={c.beslenme_recetesi.pisirme_yontemi} longText />}
          {c.beslenme_recetesi.ozel_tavsiyeler && <Alan etiket="Özel Tavsiyeler" deger={c.beslenme_recetesi.ozel_tavsiyeler} longText />}
        </Bolum>
      )}

      {c.uygulama_formlari?.length > 0 && (
        <Bolum baslik="Klasik Uygulama Formları">
          <div className="space-y-3">
            {c.uygulama_formlari.map((u: any, i: number) => (
              <div key={i} className="border border-stone-200 rounded p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-stone-900">
                      {u.isim} {u.ar && <span className="text-stone-500 font-normal">({u.ar})</span>}
                    </div>
                    <div className="text-xs text-emerald-700 mt-0.5">{UYGULAMA_ETIKET[u.tip] || u.tip}</div>
                  </div>
                </div>
                {u.bilesenler?.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-stone-500 mb-1">Bileşenler</div>
                    <ul className="text-sm text-stone-700 space-y-0.5">
                      {u.bilesenler.map((b: any, j: number) => (
                        <li key={j}>• {b.ad} {b.ar && `(${b.ar})`} — {b.miktar} {b.fonksiyon && `· ${b.fonksiyon}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {u.hazirlanis?.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-stone-500 mb-1">Hazırlama</div>
                    <ol className="text-sm text-stone-700 space-y-0.5 pl-4 list-decimal">
                      {u.hazirlanis.map((h: string, j: number) => <li key={j}>{h}</li>)}
                    </ol>
                  </div>
                )}
                {u.kullanim && <div className="text-sm text-stone-700 mt-2"><strong>Kullanım:</strong> {u.kullanim}</div>}
                {u.doz && <div className="text-sm text-stone-700"><strong>Doz:</strong> {u.doz}</div>}
                {u.sure && <div className="text-sm text-stone-700"><strong>Süre:</strong> {u.sure}</div>}
                {u.endikasyon && <div className="text-sm text-stone-600 mt-1 italic">{u.endikasyon}</div>}
                {u.kontrendikasyon && <div className="text-xs text-red-700 mt-1">⚠ {u.kontrendikasyon}</div>}
                {u.kaynak && <div className="text-xs text-stone-400 mt-2">Kaynak: {u.kaynak}</div>}
              </div>
            ))}
          </div>
        </Bolum>
      )}

      {c.bitki_recetesi?.length > 0 && (
        <Bolum baslik="Bitki Önerileri">
          <div className="space-y-3">
            {c.bitki_recetesi.map((b: any, i: number) => (
              <div key={i} className="border border-stone-200 rounded p-3">
                <div className="font-medium text-stone-900">
                  {b.bitki} {b.ar && <span className="text-stone-500 font-normal">({b.ar})</span>}
                  {b.latince && <span className="text-stone-500 font-normal italic text-xs ml-2">{b.latince}</span>}
                </div>
                {b.doz && <div className="text-sm text-stone-700 mt-1">Doz: {b.doz}</div>}
                {b.hazirlanis && <div className="text-sm text-stone-700 mt-1">Hazırlama: {b.hazirlanis}</div>}
                {b.sure && <div className="text-sm text-stone-700">Süre: {b.sure}</div>}
                {b.zaman && <div className="text-sm text-stone-700">Zaman: {b.zaman}</div>}
                {b.endikasyon && <div className="text-sm text-stone-600 mt-1 italic">{b.endikasyon}</div>}
                {b.kontrendikasyon && <div className="text-xs text-red-700 mt-1">⚠ {b.kontrendikasyon}</div>}
                {b.kaynak && <div className="text-xs text-stone-400 mt-2">Kaynak: {b.kaynak}</div>}
              </div>
            ))}
          </div>
        </Bolum>
      )}

      {c.terkib_recetesi?.length > 0 && (
        <Bolum baslik="Bileşik Formüller (Terkîb)">
          <div className="space-y-3">
            {c.terkib_recetesi.map((t: any, i: number) => (
              <div key={i} className="border border-stone-200 rounded p-4">
                <div className="font-medium text-stone-900 mb-2">
                  {t.isim} {t.ar && <span className="text-stone-500 font-normal">({t.ar})</span>}
                  {t.tur && <span className="text-xs text-emerald-700 ml-2">[{t.tur}]</span>}
                </div>
                {t.bilesenler?.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-stone-500 mb-1">Bileşenler</div>
                    <ul className="text-sm text-stone-700 space-y-0.5">
                      {t.bilesenler.map((b: any, j: number) => (
                        <li key={j}>• {b.ad} {b.ar && `(${b.ar})`} — {b.miktar} {b.fonksiyon && `· ${b.fonksiyon}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {t.hazirlanis?.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-stone-500 mb-1">Hazırlama</div>
                    <ol className="text-sm text-stone-700 space-y-0.5 pl-4 list-decimal">
                      {t.hazirlanis.map((h: string, j: number) => <li key={j}>{h}</li>)}
                    </ol>
                  </div>
                )}
                {t.uygulama && <div className="text-sm text-stone-700"><strong>Uygulama:</strong> {t.uygulama}</div>}
                {t.doz && <div className="text-sm text-stone-700"><strong>Doz:</strong> {t.doz}</div>}
                {t.sure && <div className="text-sm text-stone-700"><strong>Süre:</strong> {t.sure}</div>}
                {t.saklama && <div className="text-sm text-stone-600"><strong>Saklama:</strong> {t.saklama}</div>}
                {t.kontrendikasyon && <div className="text-xs text-red-700 mt-1">⚠ {t.kontrendikasyon}</div>}
                {t.kaynak && <div className="text-xs text-stone-400 mt-2">Kaynak: {t.kaynak}</div>}
              </div>
            ))}
          </div>
        </Bolum>
      )}

      {c.ilac_etkilesimleri?.length > 0 && (
        <section className="border border-red-200 bg-red-50 rounded-lg p-5 mb-6">
          <h2 className="font-medium text-red-900 mb-2">⚠ İlaç Etkileşimleri</h2>
          <ul className="text-sm text-red-900 space-y-1">
            {c.ilac_etkilesimleri.map((e: any, i: number) => (
              <li key={i}>• {typeof e === 'string' ? e : `${e.bitki} + ${e.ilac} → ${e.risk}`}</li>
            ))}
          </ul>
        </section>
      )}

      {c.alternatif_bitkiler?.length > 0 && (
        <Bolum baslik="Alternatif Bitkiler (el-Ebdâl)">
          <ul className="text-sm text-stone-700 space-y-1 pl-4 list-disc">
            {c.alternatif_bitkiler.map((a: any, i: number) => (
              <li key={i}>{typeof a === 'string' ? a : `${a.asil} yerine → ${a.alternatif}`}</li>
            ))}
          </ul>
        </Bolum>
      )}

      {c.egzersiz_recetesi && (
        <Bolum baslik="Egzersiz Önerisi">
          {c.egzersiz_recetesi.tur && <Alan etiket="Tür" deger={c.egzersiz_recetesi.tur} />}
          {c.egzersiz_recetesi.sure && <Alan etiket="Süre" deger={c.egzersiz_recetesi.sure} />}
          {c.egzersiz_recetesi.zaman && <Alan etiket="Zaman" deger={c.egzersiz_recetesi.zaman} />}
          {c.egzersiz_recetesi.siddet && <Alan etiket="Şiddet" deger={c.egzersiz_recetesi.siddet} />}
          {c.egzersiz_recetesi.ozel && <Alan etiket="Açıklama" deger={c.egzersiz_recetesi.ozel} longText />}
          {c.egzersiz_recetesi.kacinilacaklar && <Alan etiket="Kaçınılacaklar" deger={c.egzersiz_recetesi.kacinilacaklar} />}
          {c.egzersiz_recetesi.kaynak && <div className="text-xs text-stone-400 mt-2">Kaynak: {c.egzersiz_recetesi.kaynak}</div>}
        </Bolum>
      )}

      {c.gunluk_rutin && (
        <Bolum baslik="Günlük Rutin">
          {(['sabah', 'oglen', 'aksam'] as const).map((zd) => (
            c.gunluk_rutin[zd]?.length > 0 && (
              <div key={zd} className="mb-3">
                <div className="text-xs font-medium text-stone-500 mb-1 capitalize">{zd}</div>
                <ul className="text-sm text-stone-700 space-y-1">
                  {c.gunluk_rutin[zd].map((e: string, i: number) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            )
          ))}
        </Bolum>
      )}

      {(c.kontrol_takvimi?.length > 0 || c.sonraki_kontrol?.sure) && (
        <Bolum baslik="Kontrol ve Takip">
          {c.kontrol_takvimi?.length > 0 && (
            <ul className="text-sm text-stone-700 space-y-1 pl-4 list-disc mb-3">
              {c.kontrol_takvimi.map((k: string, i: number) => <li key={i}>{k}</li>)}
            </ul>
          )}
          {c.sonraki_kontrol?.sure && (
            <div className="mt-2 p-3 bg-stone-50 border border-stone-200 rounded text-sm">
              <div><strong>Sonraki Kontrol:</strong> {c.sonraki_kontrol.sure}</div>
              {c.sonraki_kontrol.amac && <div className="text-stone-600 mt-1">{c.sonraki_kontrol.amac}</div>}
              {c.sonraki_kontrol.odak_parametreler?.length > 0 && (
                <div className="text-xs text-stone-500 mt-2">
                  Odak: {c.sonraki_kontrol.odak_parametreler.join(', ')}
                </div>
              )}
            </div>
          )}
        </Bolum>
      )}

      {c.hasta_yasina_gore_not && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h2 className="font-medium text-amber-900 mb-1 text-sm">Yaşa Özel Not</h2>
          <div className="text-sm text-amber-900">{c.hasta_yasina_gore_not}</div>
        </section>
      )}

      {c.uyarilar?.length > 0 && (
        <section className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
          <h2 className="font-medium text-red-900 mb-2">⚠ Uyarılar</h2>
          <ul className="text-sm text-red-900 space-y-1">
            {c.uyarilar.map((u: string, i: number) => <li key={i}>• {u}</li>)}
          </ul>
        </section>
      )}

      {c.hikmetli_soz && (c.hikmetli_soz.metin_tr || c.hikmetli_soz.metin_ar) && (
        <section className="bg-stone-50 border border-stone-200 rounded-lg p-5 mb-6 text-center">
          {c.hikmetli_soz.metin_ar && (
            <div className="text-lg text-stone-700 font-serif mb-2" dir="rtl">{c.hikmetli_soz.metin_ar}</div>
          )}
          {c.hikmetli_soz.metin_tr && (
            <div className="text-sm text-stone-600 italic mb-2">{c.hikmetli_soz.metin_tr}</div>
          )}
          {c.hikmetli_soz.kaynak && (
            <div className="text-xs text-stone-400">— {c.hikmetli_soz.kaynak}</div>
          )}
        </section>
      )}

      <div className="mt-12 bg-stone-50 border border-stone-200 rounded-lg p-5 text-sm text-stone-600">
        <strong className="text-stone-800">Önemli:</strong> Bu rapor klasik İslam tıbbı geleneğinin bir uyarlamasıdır ve tıbbi tanı veya tedavi değildir. Ciddi sağlık sorunlarınız için mutlaka bir hekime başvurun.
      </div>
    </main>
  );
}

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section className="border border-stone-200 rounded-lg p-5 mb-6">
      <h2 className="font-medium text-stone-800 mb-4">{baslik}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Alan({ etiket, deger, longText = false }: { etiket: string; deger: any; longText?: boolean }) {
  if (!deger) return null;
  return (
    <div className={longText ? 'space-y-1' : 'grid grid-cols-[160px_1fr] gap-3'}>
      <div className="text-xs text-stone-500">{etiket}</div>
      <div className={`text-sm text-stone-900 ${longText ? 'whitespace-pre-wrap' : ''}`}>{String(deger)}</div>
    </div>
  );
}
