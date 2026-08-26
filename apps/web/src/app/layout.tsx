import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { PwaRegisterSW } from "@/components/pwa-register-sw";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// Archivo carrega interface e títulos — o eixo de largura diferencia os dois.
// JetBrains Mono aparece só em dado: carga, repetição, tempo, data.
const fontBody = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-body",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GymFlow",
  description: "SaaS-ready workout tracking platform",
  appleWebApp: {
    capable: true,
    title: "GymFlow",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${fontBody.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          <PwaRegisterSW />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
