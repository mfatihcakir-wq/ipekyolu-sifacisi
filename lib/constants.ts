/**
 * Tek kaynak: site genelinde kullanılan istatistikler, terminoloji ve sabit değerler.
 * Yeni rakamlar veya isim varyantları geldiğinde buradan güncellenir.
 *
 * Em dash yasağı: bu dosyadaki hiçbir string em dash içermemelidir.
 */

// İstatistikler (Supabase canlı verisinden alınmıştır; periyodik güncellenir)
export const STATS = {
  klasikKaynakSayisi: 98,
  klasikKayitSayisi: 54200,           // klasik_kaynaklar tablosu
  karakterKayitSayisi: 15536,          // karakter_kaynaklar tablosu
  toplamKayitSayisi: 69736,            // klasik + karakter
  bitkiSayisi: 1180,
  hekimBiyografiSayisi: 9,
  nabizSifati: 9,
} as const

// Görüntüleme formatları (Türkçe locale)
export const STATS_DISPLAY = {
  klasikKaynak: '98 KLASİK KAYNAK',
  kayit: '54.200+ METİN KAYDI',
  bitki: '1.180+ BİTKİ',
  ucluCizgi: '98 KLASİK KAYNAK · 54.200+ METİN KAYDI · 1.180+ BİTKİ',
} as const

// Hekim/eser kanonik isimleri (transliterasyon standardı)
// Aynı kişi/eserin tek doğru yazımı; varyantlar sözlük olarak tutulur.
export const KANONIK_ISIMLER = {
  // Hekimler
  ibnSina: 'İbn Sînâ',
  erRazi: 'er-Râzî',
  ibnNefis: 'İbn Nefîs',
  ibnRusd: 'İbn Rüşd',
  ezZehrâvî: 'ez-Zehrâvî',
  elMecusi: 'el-Mecûsî',
  ibnBeytar: 'İbn Beytâr',          // not: İbn Beytâr DEĞİL
  ibnZuhr: 'İbn Zühr',
  elHerevi: 'el-Herevî',
  tokatli: 'Tokatlı Mustafa Efendi', // not: Tokadî/Tokadi DEĞİL (canlı sayfa standardı)
  galenos: 'Galenos',
  huneyn: 'Huneyn b. İshâk',
  belhi: 'Ebû Zeyd el-Belhî',
  elAntaki: 'Dâvûd el-Antâkî',
  sabitBKurre: 'Sâbit b. Kurre',
  ibnCezle: 'İbn Cezle',
  curcani: 'Seyyid İsmâil Cürcânî',
  hayati: 'Hekim Ahmet el-Hayâtî',

  // Eserler
  elKanun: "el-Kânûn fi't-Tıb",
  elHavi: "el-Hâvî fi't-Tıb",
  elSamil: "el-Şâmil fi's-Sınâati't-Tıbbiyye",
  elMansuri: "el-Mansûrî fi't-Tıb",
  takasim: "Takâsîmü'l-İlel",
  etTasrif: 'et-Tasrîf',
  elCami: "el-Câmi' li-Müfredâti'l-Edviye",
  elKulliyyat: "el-Külliyyât fi't-Tıb",
  elMucez: "el-Mûcez fi't-Tıb",
  etTeysir: 'et-Teysîr',
  kamilSinaa: "Kâmilü's-Sınâati't-Tıbbiyye",
  tahbiz: "Tahbîzü'l-Mathûn",
  bahrCevahir: "Bahrü'l-Cevâhir fi't-Tıb",
  seceretTib: "Şeceretü't-Tıb",
} as const

// İletişim
export const ILETISIM = {
  whatsapp: '447418600856',
  whatsappURL: 'https://wa.me/447418600856',
  whatsappFormatlanmis: '+44 7418 600856',
  email: 'm.fatih.cakir@gmail.com',
  domain: 'https://www.ipekyolusifacisi.com',
  instagram: 'https://www.instagram.com/ipekyolusicfacisi',
} as const

// Renk paleti (mevcut inline style'lardan derlenmiştir; Tailwind config'e taşınmalı)
export const RENK = {
  primary: '#1C3A26',
  primaryDark: '#122B1C',
  gold: '#B8860B',
  goldLight: '#D4A843',
  cream: '#FAF6EF',
  surface: '#FAF6EF',
  dark: '#1C1C1C',
  secondary: '#6B5744',
  border: '#DEB887',
  white: '#FFFFFF',
  green: '#059669',
  whatsapp: '#25D366',
} as const
