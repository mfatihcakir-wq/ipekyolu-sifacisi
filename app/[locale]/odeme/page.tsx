export const metadata = {
  title: "Üyelik Planlarımız Yakında · İpek Yolu Şifacısı",
  description:
    "Ödeme altyapımız hazırlanıyor. Danışmanlık için WhatsApp'tan iletişime geçebilirsiniz.",
  robots: { index: false, follow: false },
}

export default function OdemePage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="inline-block text-[11px] tracking-[0.2em] text-stone-500 uppercase">
          قريباً · Yakında
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">
          Üyelik Planlarımız Yakında
        </h1>
        <p className="text-stone-600 leading-relaxed">
          Ödeme altyapımız hazırlık aşamasındadır. Bu süreçte tek seferlik
          danışmanlık ve analiz talepleriniz için WhatsApp üzerinden
          doğrudan iletişime geçebilirsiniz.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <a
            href="https://wa.me/905331687226"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-800 text-white text-sm tracking-wide hover:bg-emerald-900 transition"
          >
            WhatsApp ile İletişim
          </a>
          <a
            href="/analiz"
            className="inline-flex items-center justify-center px-6 py-3 border border-stone-300 text-stone-700 text-sm tracking-wide hover:bg-stone-50 transition"
          >
            Ücretsiz Analize Başla
          </a>
        </div>
        <p className="text-xs text-stone-400 pt-8">
          Abonelik sistemi aktifleştiğinde kayıtlı e-posta adreslerine bilgi
          verilecektir.
        </p>
      </div>
    </main>
  )
}
