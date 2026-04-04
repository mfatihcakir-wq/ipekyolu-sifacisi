import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "İpek Yolu Şifacısı — Klasik İslam Tıbbı Danışmanlığı",
    template: "%s · İpek Yolu Şifacısı"
  },
  description: "Bin yıllık İslam ve Osmanlı tıbbının birikimi ile hazırlanmış, sizin mizacınıza özel sağlık danışmanlığı. el-Hâvî, el-Kânûn, Tahbîzü'l-Mathûn — 18 klasik eserden 25.000+ kayıt.",
  keywords: ["İslam tıbbı", "mizaç analizi", "klasik tıp", "bitkisel tedavi", "danışmanlık", "İbn Sînâ", "el-Kânûn"],
  openGraph: {
    title: "İpek Yolu Şifacısı",
    description: "Vücudunuzun dilini anlıyoruz. Bin yıllık İslam tıbbı geleneğiyle hazırlanmış, size özel sağlık danışmanlığı.",
    url: "https://ipekyolu-sifacisi.vercel.app",
    siteName: "İpek Yolu Şifacısı",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "İpek Yolu Şifacısı",
    description: "Vücudunuzun dilini anlıyoruz. Klasik İslam tıbbı ile mizaç analizi.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
