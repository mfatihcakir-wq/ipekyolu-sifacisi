'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Sonuc = {
  id: string
  talep_id: string
  ham_cikti: Record<string, unknown> | null
  onayli_cikti: Record<string, unknown> | null
  hekim_notlari: string | null
  input_token_sayisi: number | null
  output_token_sayisi: number | null
  tahmini_maliyet_usd: number | null
  model_versiyonu: string | null
}

export function TaslakGoruntule({
  talepId,
  sonuc,
  talepDurumu,
}: {
  talepId: string
  sonuc: Sonuc
  talepDurumu: string
}) {
  const supabase = createClient()
  const router = useRouter()
  type Cikti = Record<string, unknown> & {
    ozet?: string
    akut_kronik?: string
    etkilenen_sistem?: string
    fitri_hali?: Record<string, unknown>
    mizac?: Record<string, unknown>
    hiltlar?: Record<string, { oran?: number; durum?: string; aciklama?: string }>
    sebep_analizi?: { badi_sebep?: string; muid_sebepler?: string[]; kok_mudahale?: string }
    uygulama_formlari?: Array<{ isim?: string; tip?: string } & Record<string, unknown>>
    bitki_recetesi?: unknown[]
    terkib_recetesi?: unknown[]
    klinik_gozlemler?: unknown[]
    uyarilar?: unknown[]
    kontrol_takvimi?: unknown[]
    ilac_etkilesimleri?: unknown[]
  }
  const baslangic = (sonuc.onayli_cikti || sonuc.ham_cikti || {}) as Cikti
  const [cikti, setCikti] = useState<Cikti>(baslangic)
  const [notlar, setNotlar] = useState<string>(sonuc.hekim_notlari || '')
  const [kaydediyor, setKaydediyor] = useState(false)
  const [mesaj, setMesaj] = useState<string>('')
  const onayli = talepDurumu === 'onayli'

  async function kaydet(onaylaMi: boolean) {
    setKaydediyor(true)
    setMesaj('')
    try {
      const sonucGuncelle: Record<string, unknown> = {
        onayli_cikti: cikti,
        hekim_notlari: notlar,
      }
      if (onaylaMi) sonucGuncelle.onaylandi_at = new Date().toISOString()

      const { error: e1 } = await supabase
        .from('analiz_sonuclari')
        .update(sonucGuncelle)
        .eq('id', sonuc.id)
      if (e1) throw new Error('Sonuç güncellemedi: ' + e1.message)

      if (onaylaMi) {
        const { error: e2 } = await supabase
          .from('analiz_talepleri')
          .update({ durum: 'onayli', onaylandi_at: new Date().toISOString() })
          .eq('id', talepId)
        if (e2) throw new Error('Talep güncellenmedi: ' + e2.message)
      }
      setMesaj(onaylaMi ? '✓ Onaylandı ve danışana iletilmeye hazır.' : '✓ Kaydedildi.')
      router.refresh()
    } catch (err) {
      setMesaj('Hata: ' + (err instanceof Error ? err.message : 'bilinmeyen'))
    } finally {
      setKaydediyor(false)
    }
  }

  function alanGuncelle(yol: string[], deger: unknown) {
    const yeni = JSON.parse(JSON.stringify(cikti))
    let kursor = yeni
    for (let i = 0; i < yol.length - 1; i++) {
      if (!kursor[yol[i]]) kursor[yol[i]] = {}
      kursor = kursor[yol[i]]
    }
    kursor[yol[yol.length - 1]] = deger
    setCikti(yeni)
  }

  return (
    <>
      {cikti._parse_hatasi ? (
        <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="font-medium text-red-900 mb-1">⚠ JSON Parse Hatası</div>
          <div className="text-sm text-red-800">
            Claude çıktısı geçerli JSON olarak ayrıştırılamadı.
            {cikti._kesik_json_kurtarildi ? ' Kısmi kurtarma başarılı — alanları kontrol edin.' : ' Ham metin "_ham_metin" alanında — "Tam JSON olarak düzenle" bölümünden inceleyin.'}
          </div>
        </div>
      ) : null}
      <section className="border border-stone-200 rounded-lg overflow-hidden">
      <header className="bg-stone-50 px-4 py-3 border-b border-stone-200">
        <h2 className="font-medium text-stone-800">{onayli ? 'Onaylı Analiz' : 'Taslak Analiz'}</h2>
        <div className="text-xs text-stone-500 mt-1">
          {sonuc.model_versiyonu} · {sonuc.input_token_sayisi}+{sonuc.output_token_sayisi} token · ~$
          {sonuc.tahmini_maliyet_usd?.toFixed(3)}
        </div>
      </header>

      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        <BolumEdit
          baslik="Özet"
          deger={cikti.ozet}
          onChange={(v) => alanGuncelle(['ozet'], v)}
          multiline
          disabled={onayli}
        />

        <fieldset className="border border-stone-200 rounded p-4 space-y-2">
          <legend className="text-sm font-medium text-stone-700 px-2">Fıtrî-Hâlî</legend>
          <BolumEdit
            baslik="Fıtrî Mizaç"
            deger={cikti.fitri_hali?.fitri_mizac}
            onChange={(v) => alanGuncelle(['fitri_hali', 'fitri_mizac'], v)}
            disabled={onayli}
          />
          <BolumEdit
            baslik="Hâlî Mizaç"
            deger={cikti.fitri_hali?.hali_mizac}
            onChange={(v) => alanGuncelle(['fitri_hali', 'hali_mizac'], v)}
            disabled={onayli}
          />
          <BolumEdit
            baslik="Sapma"
            deger={cikti.fitri_hali?.sapma}
            onChange={(v) => alanGuncelle(['fitri_hali', 'sapma'], v)}
            multiline
            disabled={onayli}
          />
          <BolumEdit
            baslik="Tedavi Hedefi"
            deger={cikti.fitri_hali?.tedavi_hedefi}
            onChange={(v) => alanGuncelle(['fitri_hali', 'tedavi_hedefi'], v)}
            multiline
            disabled={onayli}
          />
        </fieldset>

        <fieldset className="border border-stone-200 rounded p-4 space-y-2">
          <legend className="text-sm font-medium text-stone-700 px-2">Mizaç</legend>
          <BolumEdit
            baslik="Tip"
            deger={cikti.mizac?.tip}
            onChange={(v) => alanGuncelle(['mizac', 'tip'], v)}
            disabled={onayli}
          />
          <BolumEdit
            baslik="Tam Tanım"
            deger={cikti.mizac?.tam_tanim}
            onChange={(v) => alanGuncelle(['mizac', 'tam_tanim'], v)}
            disabled={onayli}
          />
          <BolumEdit
            baslik="Akut/Kronik"
            deger={cikti.akut_kronik}
            onChange={(v) => alanGuncelle(['akut_kronik'], v)}
            disabled={onayli}
          />
          <BolumEdit
            baslik="Etkilenen Sistem"
            deger={cikti.etkilenen_sistem}
            onChange={(v) => alanGuncelle(['etkilenen_sistem'], v)}
            disabled={onayli}
          />
        </fieldset>

        <details className="border border-stone-200 rounded">
          <summary className="px-4 py-2 bg-stone-50 cursor-pointer text-sm text-stone-700">
            Tam JSON olarak düzenle (gelişmiş)
          </summary>
          <textarea
            className="w-full p-3 font-mono text-xs border-t border-stone-200 focus:outline-none"
            rows={20}
            value={JSON.stringify(cikti, null, 2)}
            onChange={(e) => {
              try {
                setCikti(JSON.parse(e.target.value))
              } catch {
                // ignore invalid JSON while typing
              }
            }}
            disabled={onayli}
          />
        </details>

        {/* Hılt Oranları */}
        <fieldset className="border border-stone-200 rounded p-4 space-y-2">
          <legend className="text-sm font-medium text-stone-700 px-2">Hılt Oranları</legend>
          {(['dem', 'balgam', 'sari_safra', 'kara_safra'] as const).map((h) => (
            <div key={h} className="grid grid-cols-[120px_60px_1fr] gap-2 items-center">
              <div className="text-xs text-stone-500 capitalize">{h.replace('_', ' ')}</div>
              <input
                type="number"
                min={0}
                max={100}
                value={cikti.hiltlar?.[h]?.oran ?? 0}
                onChange={(e) => alanGuncelle(['hiltlar', h, 'oran'], parseInt(e.target.value) || 0)}
                disabled={onayli}
                className="p-1 border border-stone-200 rounded text-sm disabled:bg-stone-50"
              />
              <input
                type="text"
                value={cikti.hiltlar?.[h]?.aciklama ?? ''}
                onChange={(e) => alanGuncelle(['hiltlar', h, 'aciklama'], e.target.value)}
                disabled={onayli}
                placeholder="durum + açıklama"
                className="p-1 border border-stone-200 rounded text-sm disabled:bg-stone-50"
              />
            </div>
          ))}
          <div className="text-xs text-stone-500 pt-2">
            Toplam: {(['dem', 'balgam', 'sari_safra', 'kara_safra'] as const).reduce((s, h) => s + (cikti.hiltlar?.[h]?.oran ?? 0), 0)} (100 olmalı)
          </div>
        </fieldset>

        {/* Sebep Analizi */}
        <fieldset className="border border-stone-200 rounded p-4 space-y-2">
          <legend className="text-sm font-medium text-stone-700 px-2">Sebep Analizi</legend>
          <BolumEdit
            baslik="Yakın Sebep (Bâdî)"
            deger={cikti.sebep_analizi?.badi_sebep}
            onChange={(v) => alanGuncelle(['sebep_analizi', 'badi_sebep'], v)}
            multiline
            disabled={onayli}
          />
          <BolumEdit
            baslik="Kök Müdahale"
            deger={cikti.sebep_analizi?.kok_mudahale}
            onChange={(v) => alanGuncelle(['sebep_analizi', 'kok_mudahale'], v)}
            multiline
            disabled={onayli}
          />
          <div className="text-xs text-stone-500 pt-2">
            Uzak sebepler ({cikti.sebep_analizi?.muid_sebepler?.length ?? 0} adet) — detaylı düzenleme için &quot;Tam JSON&quot; bölümünü kullan
          </div>
        </fieldset>

        {/* Uygulama Formları özet */}
        <fieldset className="border border-stone-200 rounded p-4">
          <legend className="text-sm font-medium text-stone-700 px-2">Uygulama Formları</legend>
          <div className="text-sm text-stone-700">
            {cikti.uygulama_formlari && cikti.uygulama_formlari.length > 0
              ? `${cikti.uygulama_formlari.length} form önerilmiş: ${cikti.uygulama_formlari.map((u: any) => u.isim || u.tip).join(', ')}`
              : 'Uygulama formu önerilmemiş'}
          </div>
          <div className="text-xs text-stone-500 mt-2">
            Detaylı düzenleme için &quot;Tam JSON&quot; bölümünü kullan
          </div>
        </fieldset>

        {/* Kontrol Özeti */}
        <fieldset className="border border-stone-200 rounded p-4">
          <legend className="text-sm font-medium text-stone-700 px-2">İçerik Sayaçları</legend>
          <div className="text-xs text-stone-600 space-y-1">
            <div>Bitki reçetesi: {cikti.bitki_recetesi?.length ?? 0} bitki</div>
            <div>Terkîb reçetesi: {cikti.terkib_recetesi?.length ?? 0} formül</div>
            <div>Uygulama formları: {cikti.uygulama_formlari?.length ?? 0}</div>
            <div>Klinik gözlemler: {cikti.klinik_gozlemler?.length ?? 0}</div>
            <div>Uyarılar: {cikti.uyarilar?.length ?? 0}</div>
            <div>Kontrol takvimi: {cikti.kontrol_takvimi?.length ?? 0} madde</div>
            <div>İlaç etkileşimleri: {cikti.ilac_etkilesimleri?.length ?? 0}</div>
          </div>
        </fieldset>

        <fieldset className="border border-amber-200 bg-amber-50 rounded p-4">
          <legend className="text-sm font-medium text-amber-900 px-2">
            Hekim İç Notları (danışana gösterilmez)
          </legend>
          <textarea
            className="w-full mt-2 p-2 bg-white border border-amber-200 rounded text-sm"
            rows={3}
            value={notlar}
            onChange={(e) => setNotlar(e.target.value)}
            disabled={onayli}
          />
        </fieldset>
      </div>

      {!onayli && (
        <footer className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div className="text-sm text-stone-600">{mesaj}</div>
          <div className="flex gap-2">
            <button
              onClick={() => kaydet(false)}
              disabled={kaydediyor}
              className="px-4 py-2 border border-stone-300 text-stone-700 text-sm rounded hover:bg-white disabled:opacity-50"
            >
              Taslağı Kaydet
            </button>
            <button
              onClick={() => kaydet(true)}
              disabled={kaydediyor}
              className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded hover:bg-emerald-800 disabled:opacity-50"
            >
              {kaydediyor ? 'Kaydediliyor...' : 'Onayla ve Danışana İlet'}
            </button>
          </div>
        </footer>
      )}
      </section>
    </>
  )
}

function BolumEdit({
  baslik,
  deger,
  onChange,
  multiline = false,
  disabled = false,
}: {
  baslik: string
  deger: unknown
  onChange: (v: string) => void
  multiline?: boolean
  disabled?: boolean
}) {
  const value = deger == null ? '' : String(deger)
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-start">
      <div className="text-xs text-stone-500 pt-2">{baslik}</div>
      {multiline ? (
        <textarea
          className="w-full p-2 border border-stone-200 rounded text-sm disabled:bg-stone-50 disabled:text-stone-600"
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <input
          type="text"
          className="w-full p-2 border border-stone-200 rounded text-sm disabled:bg-stone-50 disabled:text-stone-600"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </div>
  )
}
