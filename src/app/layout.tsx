import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/config";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { MotionProvider } from "@/components/motion";

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
      <head>
        {env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(env.NEXT_PUBLIC_ADSENSE_CLIENT)}`}
            crossOrigin="anonymous"
          />
        ) : null}
        {env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(env.NEXT_PUBLIC_GA_MEASUREMENT_ID)}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`,
              }}
            />
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <MotionProvider>
          <Header />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-6">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
