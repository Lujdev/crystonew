import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { DomainAnnouncement } from "../components/domain-announcement";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

const GOOGLE_TAG_ID = "G-NL0Y3R9JS8";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body-google",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-google",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crystodolar.app"),
  title: {
    default: "CrystoDolar — La tasa que te da claridad",
    template: "%s | CrystoDolar",
  },
  description:
    "Tasas venezolanas claras: BCV, mercado, histórico, conversión y API REST para productos reales.",
  applicationName: "CrystoDolar",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: "CrystoDolar",
    title: "CrystoDolar — La tasa que te da claridad",
    description: "Tasas, histórico, conversión y API REST para Venezuela.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrystoDolar",
    description: "Tasas venezolanas claras y una API lista para integrar.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <ThemeProvider>
          <DomainAnnouncement />
          {children}
        </ThemeProvider>
        <Analytics />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_TAG_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
