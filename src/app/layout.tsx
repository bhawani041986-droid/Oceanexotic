import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/Toast";

// Fonts disabled to bypass network issues during build

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F172A',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://oceanexotic.com'),
  title: "OceanExotic Global | Elite Maritime Marketplace",
  description: "Experience absolute authority in exotic maritime trade. Rare, direct-from-source harvests with cold-chain integrity and global settlement sovereignty.",
  keywords: ["seafood", "exotic fish", "maritime trade", "bluefin tuna", "oceanexotic", "premium seafood"],
  openGraph: {
    title: "OceanExotic Global | Elite Maritime Marketplace",
    description: "Premium exotic maritime sourcing with total transparency and integrity.",
    url: "https://oceanexotic.com",
    siteName: "OceanExotic Global",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OceanExotic Global Platform Integrity",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

import { ThemeApplier } from "@/components/ThemeApplier";
import { CustomerThemeApplier } from "@/components/customer/CustomerThemeApplier";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="font-sans antialiased min-h-screen selection:bg-primary/30 selection:text-white">
        <ThemeApplier />
        <CustomerThemeApplier />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
