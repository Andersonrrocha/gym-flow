import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import { PwaRegisterSW } from "@/components/pwa-register-sw";
import "./globals.css";

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
    <html lang={locale} className="dark">
      <body className="antialiased">
        <PwaRegisterSW />
        {children}
      </body>
    </html>
  );
}
