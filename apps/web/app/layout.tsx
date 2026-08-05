import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crystodolar.app"),
  title: {
    default: "CrystoDolar — Tasas venezolanas en tiempo real",
    template: "%s | CrystoDolar",
  },
  description:
    "Consulta tasas BCV, mercado paralelo e histórico venezolano. Convierte monedas y usa una API REST sencilla.",
  applicationName: "CrystoDolar",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: "CrystoDolar",
    title: "CrystoDolar — La tasa clara para Venezuela",
    description: "Tasas, histórico, conversión y API REST.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrystoDolar",
    description: "Tasas venezolanas en tiempo real.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
