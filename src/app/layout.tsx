import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/Toast";

// Fonts disabled to bypass network issues during build

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F172A',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://oceanexotic.com'),
  title: "OceanExotic Global | Elite Maritime Marketplace",
  description: "Experience the finest, freshest seafood delivered directly from the ocean to your door. Premium quality guaranteed.",
  keywords: ["seafood", "exotic fish", "maritime trade", "bluefin tuna", "oceanexotic", "premium seafood"],
  openGraph: {
    title: "OceanExotic Global | Elite Maritime Marketplace",
    description: "Experience the finest, freshest seafood delivered directly from the ocean to your door. Premium quality guaranteed.",
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
import { AppSplashScreen } from "@/components/ui/AppSplashScreen";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('oceanexotic-theme');
                var font = localStorage.getItem('oceanexotic-font');
                if (!theme) {
                   var store = localStorage.getItem('oceanexotic-governance-settings');
                   if (store) {
                     var state = JSON.parse(store).state;
                     if (state && state.theme) theme = state.theme;
                     if (state && state.font) font = state.font;
                   }
                }
                if (theme) {
                   document.documentElement.classList.add(theme);
                   var lightThemes = ['theme-light-sovereign', 'theme-swiggy-vibrant', 'theme-zomato-passion'];
                   if (lightThemes.includes(theme)) {
                     document.documentElement.classList.remove('dark');
                     document.documentElement.classList.add('light');
                   }
                } else {
                   document.documentElement.classList.add('theme-ocean-neon');
                }
                
                if (font) {
                   var lower = font.toLowerCase();
                   var fontClass = font;
                   if (!lower.startsWith('font-')) {
                     if (lower === 'inter') fontClass = 'font-inter';
                     else if (lower === 'outfit') fontClass = 'font-outfit';
                     else if (lower === 'plus jakarta' || lower === 'plus jakarta sans') fontClass = 'font-plus-jakarta';
                     else if (lower === 'space grotesk' || lower === 'roboto mono') fontClass = 'font-space-grotesk';
                     else if (lower === 'kanit') fontClass = 'font-kanit';
                     else if (lower === 'cinzel') fontClass = 'font-cinzel';
                     else if (lower === 'roboto') fontClass = 'font-roboto';
                     else fontClass = 'font-' + lower.replace(/\\s+/g, '-');
                   }
                   document.documentElement.classList.add(fontClass);
                }
                
                var blur = localStorage.getItem('oceanexotic-blur');
                var glow = localStorage.getItem('oceanexotic-glow');
                if (blur) document.documentElement.style.setProperty('--glass-blur-factor', (parseInt(blur) / 100).toString());
                if (glow) document.documentElement.style.setProperty('--glow-opacity-factor', (parseInt(glow) / 100).toString());
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen selection:bg-primary/30 selection:text-white">
        <ThemeApplier />
        <CustomerThemeApplier />
        <AppSplashScreen />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
