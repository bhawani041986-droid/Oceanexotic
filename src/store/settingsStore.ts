import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FULL_API_URL as API_BASE_URL } from '@/config/api';

export interface AmazonHeroCardItem {
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  query: string;
}

export interface AmazonHeroCardConfig {
  id: string;
  title: string;
  badge: string;
  themeColor: string;
  accentColor: string;
  active: boolean;
  items: AmazonHeroCardItem[];
}

export interface SwiggyBannerSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  badge: string;
}

export interface ZomatoHeroConfig {
  backdropUrl: string;
  backdrops?: string[];
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  badgeText: string;
  overlayOpacity: number;
  trustBadge1: string;
  trustBadge2: string;
  trustBadge3: string;
}

export interface CompactStripConfig {
  tickerText: string;
  bgColor: string;
  textColor: string;
}

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
  heroStyle?: 'AMAZON_CARD_GRID' | 'SWIGGY_DYNAMIC_BANNER' | 'ZOMATO_HIGH_IMPACT' | 'COMPACT_MINIMAL_STRIP';
  amazonHeroCards?: AmazonHeroCardConfig[];
  swiggyBanners?: SwiggyBannerSlide[];
  zomatoHeroConfig?: ZomatoHeroConfig;
  compactStripConfig?: CompactStripConfig;
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

export const DEFAULT_AMAZON_HERO_CARDS: AmazonHeroCardConfig[] = [
  {
    id: "card-1",
    title: "Continue Shopping Deals",
    badge: "Exclusive",
    themeColor: "#0d5c3a",
    accentColor: "#10B981",
    active: true,
    items: [
      { name: "Surmai Steaks", price: "₹1,899", oldPrice: "₹2,299", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Surmai" },
      { name: "King Jumbo Prawns", price: "₹6,989", oldPrice: "₹7,999", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80", query: "Prawn" },
      { name: "Seawater Crabs", price: "₹2,799", oldPrice: "₹3,499", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80", query: "Crab" },
      { name: "Red Snapper Fillet", price: "₹798", oldPrice: "₹999", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80", query: "Snapper" },
    ]
  },
  {
    id: "card-2",
    title: "Today's Fresh Landed Catch",
    badge: "Landed Today",
    themeColor: "#034873",
    accentColor: "#38BDF8",
    active: true,
    items: [
      { name: "Black Pomfret", price: "₹1,299", oldPrice: "₹1,599", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80", query: "Pomfret" },
      { name: "Cleaned Squid", price: "₹798", oldPrice: "₹950", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80", query: "Squid" },
      { name: "Rock Lobster", price: "₹2,450", oldPrice: "₹2,999", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80", query: "Lobster" },
      { name: "Yellowfin Tuna", price: "₹890", oldPrice: "₹1,100", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Tuna" },
    ]
  },
  {
    id: "card-3",
    title: "Chef's Ready-to-Cook Specials",
    badge: "Quick Cook",
    themeColor: "#7c1d1d",
    accentColor: "#F43F5E",
    active: true,
    items: [
      { name: "Fish Fry Cut", price: "₹450", oldPrice: "₹550", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80", query: "Fry" },
      { name: "Prawn Biryani Cut", price: "₹850", oldPrice: "₹999", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80", query: "Prawn" },
      { name: "Grill Steaks", price: "₹1,150", oldPrice: "₹1,399", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Steak" },
      { name: "Crab Lollipop", price: "₹650", oldPrice: "₹799", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80", query: "Crab" },
    ]
  },
  {
    id: "card-4",
    title: "Flash Seafood Discounts",
    badge: "30% OFF",
    themeColor: "#581c87",
    accentColor: "#C084FC",
    active: true,
    items: [
      { name: "Tiger Prawns", price: "₹990", oldPrice: "₹1,290", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80", query: "Tiger" },
      { name: "Silver Pomfret", price: "₹1,450", oldPrice: "₹1,800", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80", query: "Pomfret" },
      { name: "Anjal Slices", price: "₹1,120", oldPrice: "₹1,399", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Anjal" },
      { name: "Asian Sea Bass", price: "₹780", oldPrice: "₹950", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80", query: "Bass" },
    ]
  }
];

export const DEFAULT_SWIGGY_BANNERS: SwiggyBannerSlide[] = [
  {
    id: "swiggy-1",
    title: "FRESH SURMAI & SALMON FESTIVAL",
    subtitle: "Direct landed catch from Port Blair Harbour. Delivered chilled in under 90 minutes.",
    ctaText: "SHOP FRESH SEAFOOD",
    ctaLink: "/products?search=surmai",
    imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80",
    badge: "Port Blair Dock"
  },
  {
    id: "swiggy-2",
    title: "KING JUMBO PRAWNS & ROCK LOBSTER",
    subtitle: "Sustainably harvested seawater crustaceans. Perfect for weekend grills.",
    ctaText: "EXPLORE CRUSTACEANS",
    ctaLink: "/products?search=prawn",
    imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80",
    badge: "Limited Catch"
  }
];

export const DEFAULT_ZOMATO_HERO: ZomatoHeroConfig = {
  backdropUrl: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80",
  backdrops: [
    "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80"
  ],
  titleLine1: "FRESHNESS",
  titleLine2: "REDEFINED.",
  subtitle: "Delivered Fresh in Under 90 Minutes. Trusted by 50,000+ Customers.",
  badgeText: "PREMIUM SEAFOOD MARKET",
  overlayOpacity: 60,
  trustBadge1: "🛡️ FSSAI Quality Certified",
  trustBadge2: "⏱️ 90-Min Superfast Express",
  trustBadge3: "❄️ 100% Cold Chain Sealed"
};

export const DEFAULT_COMPACT_STRIP: CompactStripConfig = {
  tickerText: "🔥 20% OFF ALL SEAWATER FISH TODAY | FREE EXPRESS DELIVERY ON ORDERS OVER ₹499",
  bgColor: "#0d5c3a",
  textColor: "#FFFFFF"
};

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
      heroStyle: "AMAZON_CARD_GRID",
      amazonHeroCards: DEFAULT_AMAZON_HERO_CARDS,
      swiggyBanners: DEFAULT_SWIGGY_BANNERS,
      zomatoHeroConfig: DEFAULT_ZOMATO_HERO,
      compactStripConfig: DEFAULT_COMPACT_STRIP,
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
            heroStyle: state.heroStyle,
            amazonHeroCards: state.amazonHeroCards,
            swiggyBanners: state.swiggyBanners,
            zomatoHeroConfig: state.zomatoHeroConfig,
            compactStripConfig: state.compactStripConfig,
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
