import Link from 'next/link'

export const metadata = {
  title: 'Talebiniz Alındı · İpek Yolu Şifacısı',
}

export default function BasariliPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="inline-block text-[11px] tracking-[0.2em] text-emerald-700 uppercase">
          ✓ Talebiniz Alındı
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">
          Analiziniz hazırlanıyor
        </h1>

        <div className="text-stone-600 leading-relaxed space-y-4">
          <p>
            Talebiniz başarıyla alındı ve inceleme kuyruğuna eklendi. Klasik İslam
            tıbbı çerçevesinde hazırlanacak bireysel değerlendirmeniz, uzman
            danışmanınızın onayından sonra size iletilecektir.
          </p>
          <p>
            Sonuç ortalama <strong>24-48 saat</strong> içinde e-posta adresinize
            gönderilir. Üyeyseniz ayrıca panelinizden takip edebilirsiniz.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-left text-sm text-amber-900">
          <div className="font-semibold mb-2">Önemli hatırlatma</div>
          <p className="leading-relaxed">
            Bu platform bir tıbbi tanı veya tedavi hizmeti sunmaz. Size iletilen
            değerlendirme, klasik İslam tıbbı geleneğinin modern bir uyarlamasıdır
            ve modern hekim konsültasyonunun yerini tutmaz.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-800 text-white text-sm tracking-wide hover:bg-emerald-900 transition"
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/bitkiler"
            className="inline-flex items-center justify-center px-6 py-3 border border-stone-300 text-stone-700 text-sm tracking-wide hover:bg-stone-50 transition"
          >
            Bitki Atlasını Keşfet
          </Link>
        </div>
      </div>
    </main>
  )
}
