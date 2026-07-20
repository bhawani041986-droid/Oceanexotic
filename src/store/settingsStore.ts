import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FULL_API_URL as API_BASE_URL } from '@/config/api';

interface SettingsState {
  marketplaceName: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  commissionRate: number;
  multiSigAuthorized: boolean;
  
  // Social & Contact Registry
  instagram: string;
  youtube: string;
  whatsapp: string;
  contactNumber: string;
  address: string;
  theme: string;
  font: string;
  email: string;
  
  // Customer Theme Engine
  customerTheme: string;
  logoTextColor?: string;
  logoPrimaryColor?: string;
  logoSecondaryColor?: string;
  iosAppUrl?: string;
  androidAppUrl?: string;
  agentAppUrl?: string;
  sellerAppUrl?: string;
  adminAppUrl?: string;
  atmosphericGlow: number;
  heroOverlayOpacity: number;
  flashDealActive: boolean;
  flashDealStart: string;
  flashDealEnd: string;
  flashDealTitle: string;
  flashDealSector: string;
  flashDealFont: string;
  flashDealCarousel: { image_url: string; product_link: string }[];
  customerAssets: {
    logo: string;
    hero: string;
    mobileHero?: string;
    heroBadge?: string;
    heroTitle1?: string;
    heroTitle2?: string;
    heroSubtitle?: string;
    heroBadgeColor?: string;
    heroTitle1Color?: string;
    heroTitle2Color?: string;
    heroSubtitleColor?: string;
    hero2?: string;
    hero3?: string;
    favicon: string;
    appleIcon: string;
    promo: string;
    promoSecondary: string;
    mobile: string;
    placeholder: string;
    customerAppIcon?: string;
    agentAppIcon?: string;
    sellerAppIcon?: string;
    adminAppIcon?: string;
  };

  // PayU Registry
  payu: {
    merchantKey: string;
    merchantSalt: string;
    mode: 'test' | 'live';
  };

  // Order Window Control
  ordersEnabled: boolean;
  ordersOpenTime: string;       // HH:MM format e.g. "09:00"
  ordersCloseTime: string;      // HH:MM format e.g. "22:00"
  ordersNextOpenText: string;   // Human-readable label shown to customers
  topSellers?: { id: string; name: string; rating: number; speed: string; image: string; products: string[] }[];
  cod_enabled: boolean;

  setSettings: (settings: Partial<SettingsState>) => void;
  authorizeMultiSig: () => void;
  fetchSettings: () => Promise<void>;
  pushSettings: () => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      marketplaceName: "OceanExotic Global",
      currency: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata (IST)",
      commissionRate: 12,
      multiSigAuthorized: false,
      theme: "theme-ocean-neon",
      font: "font-inter",
      customerTheme: "theme-ocean-neon",
      logoTextColor: "#00D1FF",
      logoPrimaryColor: "#00D1FF",
      logoSecondaryColor: "#F0ABFC",
      iosAppUrl: "",
      androidAppUrl: "https://expo.dev/accounts/bhawani-ocean/projects/oceanexotic-customer/builds/current",
      agentAppUrl: "https://expo.dev/accounts/bhawani-ocean/projects/oceanexotic-agent/builds/e9861ee7-d27a-43cf-97d5-83be278d0240",
      sellerAppUrl: "https://expo.dev/accounts/bhawani-ocean/projects/oceanexotic-seller/builds/current",
      adminAppUrl: "https://expo.dev/accounts/bhawani-ocean/projects/oceanexotic-admin/builds/db18e872-65d2-417d-9d9a-28d6e75e654d",
      atmosphericGlow: 15,
      heroOverlayOpacity: 80,
      flashDealActive: true,
      flashDealStart: new Date().toISOString(), // Now
      flashDealEnd: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3 hours from now
      flashDealTitle: "Flash Deals.",
      flashDealSector: "Flash Product",
      flashDealFont: "font-inter",
      flashDealCarousel: [
        { image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80", product_link: "#" },
        { image_url: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80", product_link: "#" },
        { image_url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80", product_link: "#" }
      ],
      topSellers: [
        { id: "SEL-002", name: "Devansh Fish Hub", rating: 4.6, speed: "45 min", image: "⚓", products: ["🦞", "🦀", "🦐"] },
        { id: "SEL-003", name: "Deep Fishing", rating: 5.0, speed: "60 min", image: "❄️", products: ["🥩", "🐟", "🦀"] },
        { id: "SEL-2002", name: "Deep Sea Catch", rating: 4.8, speed: "45 min", image: "⚓", products: ["🦞", "🦀", "🦐"] },
        { id: "SEL-004", name: "Rig Fishing", rating: 4.8, speed: "45 min", image: "🚢", products: ["🦞", "🦀", "🦐"] },
      ],
      customerAssets: {
        logo: "",
        hero: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80",
        mobileHero: "/images/premium_mobile_hero.png",
        heroBadge: "Premium Seafood Market",
        heroTitle1: "Seafood",
        heroTitle2: "Redefined.",
        heroSubtitle: "Delivered Fresh in Under 90 Minutes. Trusted by 50,000+ Customers.",
        heroBadgeColor: "",
        heroTitle1Color: "",
        heroTitle2Color: "",
        heroSubtitleColor: "",
        hero2: "",
        hero3: "",
        favicon: "/logo-icon.svg",
        appleIcon: "/logo-icon.svg",
        promo: "https://images.unsplash.com/photo-1551970634-747846a548cb?auto=format&fit=crop&q=80",
        promoSecondary: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80",
        mobile: "",
        placeholder: ""
      },

      payu: {
        merchantKey: "PAYU_KEY_MOCK",
        merchantSalt: "PAYU_SALT_MOCK",
        mode: 'test'
      },

      // Order Window Defaults
      ordersEnabled: true,
      ordersOpenTime: '09:00',
      ordersCloseTime: '22:00',
      ordersNextOpenText: 'Tomorrow at 09:00 AM',
      cod_enabled: false,
      
      // Default Global Handshakes
      instagram: "@oceanexotic_global",
      youtube: "youtube.com/@oceanexotic",
      whatsapp: "+91 98765 43210",
      contactNumber: "+91 03192 123456",
      address: "Marine Hub, Phoenix Bay, Port Blair, Andaman & Nicobar Islands",
      email: "dispatch@oceanexotic.com",

      setSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
      authorizeMultiSig: () => set({ multiSigAuthorized: true }),

      fetchSettings: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/system/settings`);
          const data = await response.json();
          if (data.status === 'success' && data.settings) {
            set((state) => ({ ...state, ...data.settings }));
          }
        } catch (error) {
          console.warn("Registry Fetch Failed (Silenced):", error);
        }
      },

      pushSettings: async () => {
        try {
          const state = get();

          // Strip base64 data: URIs from customerAssets before sending.
          // Base64-encoded images can be 3–5 MB, exceeding Vercel's 4.5 MB
          // serverless function payload limit and causing "sync failed" errors.
          // Only URL references are persisted; data URIs are transient UI previews.
          const sanitisedAssets = Object.fromEntries(
            Object.entries(state.customerAssets || {}).map(([k, v]) => [
              k,
              typeof v === 'string' && v.startsWith('data:') ? '' : v
            ])
          );

          const settingsToSave = {
            marketplaceName: state.marketplaceName,
            currency: state.currency,
            customerTheme: state.customerTheme,
            logoTextColor: state.logoTextColor,
            logoPrimaryColor: state.logoPrimaryColor,
            logoSecondaryColor: state.logoSecondaryColor,
            iosAppUrl: state.iosAppUrl,
            androidAppUrl: state.androidAppUrl,
            agentAppUrl: state.agentAppUrl,
            sellerAppUrl: state.sellerAppUrl,
            adminAppUrl: state.adminAppUrl,
            atmosphericGlow: state.atmosphericGlow,
            heroOverlayOpacity: state.heroOverlayOpacity,
            flashDealActive: state.flashDealActive,
            flashDealStart: state.flashDealStart,
            flashDealEnd: state.flashDealEnd,
            flashDealTitle: state.flashDealTitle,
            flashDealSector: state.flashDealSector,
            flashDealFont: state.flashDealFont,
            flashDealCarousel: state.flashDealCarousel,
            customerAssets: sanitisedAssets,
            instagram: state.instagram,
            youtube: state.youtube,
            whatsapp: state.whatsapp,
            contactNumber: state.contactNumber,
            address: state.address,
            theme: state.theme,
            email: state.email,
            payu: state.payu,
            ordersEnabled: state.ordersEnabled,
            ordersOpenTime: state.ordersOpenTime,
            ordersCloseTime: state.ordersCloseTime,
            ordersNextOpenText: state.ordersNextOpenText,
            topSellers: state.topSellers,
            cod_enabled: state.cod_enabled
          };

          const response = await fetch(`${API_BASE_URL}/system/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings: settingsToSave })
          });
          const data = await response.json();
          return data.status === 'success';
        } catch (error) {
          console.warn("Registry Sync Failed (Silenced):", error);
          return false;
        }
      }
    }),
    {
      name: 'oceanexotic-governance-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Absolute Purge of Stale Blob Protocols
          const assets = state.customerAssets;
          let hasDirtyBlob = false;
          const sanitizedAssets = { ...assets };

          Object.keys(assets).forEach((key) => {
            const val = (assets as any)[key];
            if (typeof val === 'string' && val.startsWith('blob:')) {
              (sanitizedAssets as any)[key] = "";
              hasDirtyBlob = true;
            }
          });

          if (hasDirtyBlob) {
            state.setSettings({ customerAssets: sanitizedAssets });
          }
        }
      },
    }
  )
);
