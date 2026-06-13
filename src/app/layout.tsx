import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthHydration } from "@/components/auth/AuthHydration";

// Fonts disabled to bypass network issues during build

// Fonts disabled to bypass network issues during build

export const revalidate = 3600; // Cache layout for 1 hour to ensure < 0.05s TTFB

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F172A',
};

import { createClient } from "@supabase/supabase-js";

export async function generateMetadata(): Promise<Metadata> {
  const defaultMeta: Metadata = {
    metadataBase: new URL('https://oceanexotic.com'),
    title: "OceanExotic Global | Elite Maritime Marketplace",
    description: "Experience the finest, freshest seafood delivered directly from the ocean to your door. Premium quality guaranteed.",
    keywords: ["seafood", "exotic fish", "maritime trade", "bluefin tuna", "oceanexotic", "premium seafood"],
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
    appleWebApp: {
      title: 'OceanExotic',
      statusBarStyle: 'black-translucent',
      capable: true,
    },
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

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('marketplace_settings')
        .select('setting_value')
        .eq('setting_key', 'customerAssets')
        .single();
      
      if (data && data.setting_value) {
        let assets = data.setting_value;
        if (typeof assets === 'string') assets = JSON.parse(assets);
        
        const title1 = assets.heroTitle1 || 'Seafood';
        const title2 = assets.heroTitle2 || 'Redefined.';
        const dynamicTitle = `${title1} ${title2} | OceanExotic Global`;
        const dynamicDesc = assets.heroSubtitle || defaultMeta.description;
        const dynamicImg = assets.hero || "/og-image.jpg";

        return {
          ...defaultMeta,
          title: dynamicTitle,
          description: dynamicDesc as string,
          openGraph: {
            ...defaultMeta.openGraph,
            title: dynamicTitle,
            description: dynamicDesc as string,
            images: [
              {
                url: dynamicImg,
                width: 1200,
                height: 630,
                alt: dynamicTitle,
              }
            ]
          }
        };
      }
    }
  } catch (e) {
    console.error("SEO Metadata Generation Error:", e);
  }

  return defaultMeta;
}

import { ThemeApplier } from "@/components/ThemeApplier";
import { CustomerThemeApplier } from "@/components/customer/CustomerThemeApplier";
import { AppSplashScreen } from "@/components/ui/AppSplashScreen";
import { CUSTOMER_THEMES } from "@/config/customerThemes";

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
                     else fontClass = 'font-' + lower.replace(/\s+/g, '-');
                   }
                   document.documentElement.classList.add(fontClass);
                }
                
                var blur = localStorage.getItem('oceanexotic-blur');
                var glow = localStorage.getItem('oceanexotic-glow');
                if (blur) document.documentElement.style.setProperty('--glass-blur-factor', (parseInt(blur) / 100).toString());
                if (glow) document.documentElement.style.setProperty('--glow-opacity-factor', (parseInt(glow) / 100).toString());
                
                var isCustomer = !window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/seller');
                if (isCustomer) {
                  var customerThemeId = 'theme-ocean-neon';
                  var storeStr = localStorage.getItem('oceanexotic-governance-settings');
                  if (storeStr) {
                    var s = JSON.parse(storeStr).state;
                    if (s && s.customerTheme) customerThemeId = s.customerTheme;
                  }
                  
                  var ALL_THEMES = ${JSON.stringify(CUSTOMER_THEMES)};
                  var cTheme = ALL_THEMES.find(function(t) { return t.id === customerThemeId; }) || ALL_THEMES[0];
                  
                  if (cTheme) {
                    var root = document.documentElement;
                    root.style.setProperty('--c-primary', cTheme.colors.primary);
                    root.style.setProperty('--c-primary-light', cTheme.colors.primaryLight);
                    root.style.setProperty('--c-secondary', cTheme.colors.secondary);
                    root.style.setProperty('--c-accent', cTheme.colors.accent);
                    root.style.setProperty('--c-bg', cTheme.colors.bg);
                    root.style.setProperty('--c-bg-alt', cTheme.colors.bgAlt);
                    root.style.setProperty('--c-card', cTheme.colors.card);
                    root.style.setProperty('--c-text-primary', cTheme.colors.textPrimary);
                    root.style.setProperty('--c-text-secondary', cTheme.colors.textSecondary);
                    
                    var isLight = cTheme.id.includes('light') || cTheme.id.includes('burst') || cTheme.id.includes('passion') || cTheme.colors.bg === '#F8FAFC' || cTheme.colors.bg === '#FFFFFF';
                    
                    root.style.setProperty('--primary', cTheme.colors.primary);
                    root.style.setProperty('--primary-light', cTheme.colors.primaryLight);
                    root.style.setProperty('--secondary', cTheme.colors.bgAlt);
                    root.style.setProperty('--background', cTheme.colors.bg);
                    root.style.setProperty('--card', cTheme.colors.card);
                    root.style.setProperty('--foreground', cTheme.colors.textPrimary);
                    root.style.setProperty('--muted-foreground', cTheme.colors.textSecondary);
                    root.style.setProperty('--border', isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)');
                    
                    root.style.setProperty('--c-radius-btn', cTheme.visuals.radiusBtn);
                    root.style.setProperty('--c-radius-card', cTheme.visuals.radiusCard);
                    root.style.setProperty('--c-shadow-glow', cTheme.visuals.shadowGlow);
                    root.style.setProperty('--c-gradient-hero', cTheme.visuals.gradientHero);
                    root.style.setProperty('--c-glass-opacity', cTheme.visuals.glassOpacity);
                    root.style.setProperty('--c-glass-blur', cTheme.visuals.glassBlur);
                    root.style.setProperty('--c-font-family', cTheme.fontFamily);
                    
                    root.style.setProperty('--font-sans', cTheme.fontFamily);
                    root.style.setProperty('--radius-button', cTheme.visuals.radiusBtn);
                    root.style.setProperty('--radius-card', cTheme.visuals.radiusCard);
                    root.style.setProperty('--shadow-glow', cTheme.visuals.shadowGlow);
                    
                    if (isLight) {
                      root.classList.add('customer-light', 'light');
                      root.classList.remove('customer-dark', 'dark');
                    } else {
                      root.classList.add('customer-dark', 'dark');
                      root.classList.remove('customer-light', 'light');
                    }
                  }
                }
              } catch (e) {}
            `,
          }}
        />
        {/* Google Translate Auto-DOM Injection */}
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `
        }} />
        <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>
      </head>
      <body className="font-sans antialiased min-h-screen selection:bg-primary/30 selection:text-white">
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <ThemeApplier />
        <CustomerThemeApplier />
        <AppSplashScreen />
        <AuthHydration />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
