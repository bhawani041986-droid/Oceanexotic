import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { settingsService } from "@/services/settingsService";

export interface CustomerAssets {
  logo: string;
  hero: string;
  mobileHero?: string;
  heroBadge?: string;
  heroTitle1?: string;
  heroTitle2?: string;
  heroSubtitle?: string;
  hero2?: string;
  hero3?: string;
  heroOverlayOpacity?: number;
  heroBadgeColor?: string;
  heroTitle1Color?: string;
  heroTitle2Color?: string;
  heroSubtitleColor?: string;
  favicon: string;
  appleIcon: string;
  promo: string;
  promoSecondary: string;
  mobile: string;
  placeholder: string;
}

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

interface SettingsState {
  marketplaceName: string;
  heroStyle?: string;
  categoryAnimationMode?: string;
  amazonHeroCards?: AmazonHeroCardConfig[];
  swiggyBanners?: SwiggyBannerSlide[];
  zomatoHeroConfig?: ZomatoHeroConfig;
  compactStripConfig?: CompactStripConfig;
  logoTextColor?: string;
  logoPrimaryColor?: string;
  logoSecondaryColor?: string;
  flashDealActive: boolean;
  flashDealStart: string;
  flashDealEnd: string;
  flashDealTitle: string;
  flashDealSector: string;
  flashDealFont: string;
  flashDealCarousel?: { image_url: string; product_link: string }[];
  theme: string;
  /** Current UI language code (e.g. 'en', 'hi', 'bn', 'ta') */
  language: string;
  /** Convenience alias so components can read `settings.language` */
  settings: { language: string };
  customerAssets: CustomerAssets;
  topSellers?: { id: string; name: string; rating: number; speed: string; image: string; products: string[] }[];
  productCategories?: { id: string; label: string; iconName: string; status: string; imageUrl?: string }[];
  homeSectionOrder?: string[];
  fetchSettings: () => Promise<void>;
  setSettings: (partial: Partial<Omit<SettingsState, 'settings'>>) => void;
}

const defaultAssets: CustomerAssets = {
  logo: "",
  hero: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80",
  mobileHero: "/images/premium_mobile_hero.png",
  heroBadge: "Premium Seafood Market",
  heroTitle1: "Seafood",
  heroTitle2: "Redefined.",
  heroSubtitle: "Delivered Fresh in Under 90 Minutes. Trusted by 50,000+ Customers.",
  hero2: "",
  hero3: "",
  heroOverlayOpacity: 60,
  heroBadgeColor: "",
  heroTitle1Color: "",
  heroTitle2Color: "",
  heroSubtitleColor: "",
  favicon: "/favicon.ico",
  appleIcon: "/logo-icon.svg",
  promo: "https://images.unsplash.com/photo-1551970634-747846a548cb?auto=format&fit=crop&q=80",
  promoSecondary: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80",
  mobile: "",
  placeholder: "",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      marketplaceName: "OceanExotic Global",
      flashDealActive: true,
      flashDealStart: new Date().toISOString(),
      flashDealEnd: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
      flashDealTitle: "Flash Deals.",
      flashDealSector: "Flash Product",
      flashDealFont: "font-inter",
      flashDealCarousel: [
        { image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80", product_link: "/products" },
        { image_url: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80", product_link: "/products" },
        { image_url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80", product_link: "/products" }
      ],
      theme: "theme-ocean-global-light",
      language: "en",
      settings: { language: "en" },
      customerAssets: { ...defaultAssets },
      topSellers: [
        { id: "SEL-002", name: "Devansh Fish Hub", rating: 4.6, speed: "45 min", image: "⚓", products: ["🦞", "🦀", "🦐"] },
        { id: "SEL-003", name: "Deep Fishing", rating: 5.0, speed: "60 min", image: "❄️", products: ["🥩", "🐟", "🦀"] },
        { id: "SEL-2002", name: "Deep Sea Catch", rating: 4.8, speed: "45 min", image: "⚓", products: ["🦞", "🦀", "🦐"] },
        { id: "SEL-004", name: "Rig Fishing", rating: 4.8, speed: "45 min", image: "🚢", products: ["🦞", "🦀", "🦐"] },
      ],
      productCategories: [],
      homeSectionOrder: ["HERO", "CATEGORIES", "TODAYS_CATCH", "FEATURED", "RECIPES", "PROMO", "SELLERS", "RADAR", "REVIEWS", "NEWSLETTER", "QUALITY_CHECKED", "FSSAI"],

      setSettings: (partial) =>
        set((s) => {
          const next = { ...s, ...partial };
          // Keep `settings` object in sync with `language`
          next.settings = { language: next.language ?? s.language };
          return next;
        }),

      fetchSettings: async () => {
        try {
          const settings = await settingsService.fetch();
          if (!settings) return;

          const assets = (settings.customerAssets as CustomerAssets) || get().customerAssets;
          const sanitized = { ...defaultAssets, ...assets };
          Object.keys(sanitized).forEach((key) => {
            const val = (sanitized as any)[key];
            if (typeof val === "string" && val.startsWith("blob:")) {
              (sanitized as any)[key] = "";
            }
          });

          set({
            marketplaceName: (settings.marketplaceName as string) || get().marketplaceName,
            heroStyle: (settings.heroStyle as string) || get().heroStyle || "AMAZON_CARD_GRID",
            amazonHeroCards: (settings.amazonHeroCards as any) || get().amazonHeroCards,
            swiggyBanners: (settings.swiggyBanners as any) || get().swiggyBanners || DEFAULT_SWIGGY_BANNERS,
            zomatoHeroConfig: (settings.zomatoHeroConfig as any) || get().zomatoHeroConfig || DEFAULT_ZOMATO_HERO,
            compactStripConfig: (settings.compactStripConfig as any) || get().compactStripConfig || DEFAULT_COMPACT_STRIP,
            logoTextColor: (settings.logoTextColor as string) || get().logoTextColor || "#00D1FF",
            logoPrimaryColor: (settings.logoPrimaryColor as string) || get().logoPrimaryColor || "#00D1FF",
            logoSecondaryColor: (settings.logoSecondaryColor as string) || get().logoSecondaryColor || "#F0ABFC",
            flashDealActive:
              settings.flashDealActive !== undefined
                ? Boolean(settings.flashDealActive)
                : get().flashDealActive,
            flashDealStart: (settings.flashDealStart as string) || get().flashDealStart,
            flashDealEnd: (settings.flashDealEnd as string) || get().flashDealEnd,
            flashDealTitle: (settings.flashDealTitle as string) || get().flashDealTitle,
            flashDealSector: (settings.flashDealSector as string) || get().flashDealSector,
            flashDealFont: (settings.flashDealFont as string) || get().flashDealFont,
            flashDealCarousel: (settings.flashDealCarousel as any) || get().flashDealCarousel,
            theme: (settings.customerTheme as string) || (settings.theme as string) || get().theme,
            customerAssets: sanitized,
            topSellers: (settings.topSellers as any) || get().topSellers,
            productCategories: (settings.PRODUCT_CATEGORIES as any) || get().productCategories,
            homeSectionOrder: (() => {
              let order = (settings.HOME_SECTION_ORDER as any) || get().homeSectionOrder;
              if (Array.isArray(order)) {
                if (order.includes("TRUST")) {
                  const trustIndex = order.indexOf("TRUST");
                  order = [
                    ...order.slice(0, trustIndex),
                    "QUALITY_CHECKED",
                    "FSSAI",
                    ...order.slice(trustIndex + 1)
                  ];
                }
              }
              return order;
            })(),
          });
        } catch {
          /* keep persisted defaults */
        }
      },
    }),
    {
      name: "oceanexotic-settings",
      storage: createJSONStorage(() => AsyncStorage),
      // Exclude the computed `settings` object from persistence to avoid stale data
      partialize: (state) => ({
        marketplaceName: state.marketplaceName,
        heroStyle: state.heroStyle,
        amazonHeroCards: state.amazonHeroCards,
        swiggyBanners: state.swiggyBanners,
        zomatoHeroConfig: state.zomatoHeroConfig,
        compactStripConfig: state.compactStripConfig,
        logoTextColor: state.logoTextColor,
        logoPrimaryColor: state.logoPrimaryColor,
        logoSecondaryColor: state.logoSecondaryColor,
        flashDealActive: state.flashDealActive,
        flashDealStart: state.flashDealStart,
        flashDealEnd: state.flashDealEnd,
        flashDealTitle: state.flashDealTitle,
        flashDealSector: state.flashDealSector,
        flashDealFont: state.flashDealFont,
        flashDealCarousel: state.flashDealCarousel,
        theme: state.theme,
        language: state.language,
        customerAssets: state.customerAssets,
        topSellers: state.topSellers,
        productCategories: state.productCategories,
        homeSectionOrder: state.homeSectionOrder,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.settings = { language: state.language ?? "en" };
        }
      },
    }
  )
);
