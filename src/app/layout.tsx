import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";
import { env } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: "Virus Tracker | Global Outbreak Intelligence",
    template: "%s | Virus Tracker",
  },
  description:
    "Virus Tracker monitors global virus spread with heat zones, trajectory analysis, and realtime outbreak intelligence.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Virus Tracker | Global Outbreak Intelligence",
    description:
      "Track emerging global threats and viruses with realtime heat zones, trajectory forecasts, and threat intelligence.",
    url: env.APP_URL,
    siteName: "Virus Tracker",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Virus Tracker | Global Outbreak Intelligence",
    description:
      "Track emerging global threats and viruses with realtime heat zones and trajectory analysis.",
  },
  other: env.NEXT_PUBLIC_ADSENSE_CLIENT
    ? { "google-adsense-account": env.NEXT_PUBLIC_ADSENSE_CLIENT }
    : {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(env.NEXT_PUBLIC_ADSENSE_CLIENT)}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        <header className="sticky top-0 z-50 border-b border-cyan-400/20 bg-slate-950/90 backdrop-blur">
          <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-[0.25em] text-cyan-300">
              VIRUS TRACKER
            </Link>
            <div className="flex items-center gap-5 text-sm text-cyan-100/80">
              <Link href="/map" className="hover:text-cyan-300">
                Heat Map
              </Link>
              <Link href="/news" className="hover:text-cyan-300">
                News
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
