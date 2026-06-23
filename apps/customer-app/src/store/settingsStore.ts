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
  favicon: string;
  appleIcon: string;
  promo: string;
  promoSecondary: string;
  mobile: string;
  placeholder: string;
}

interface SettingsState {
  marketplaceName: string;
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
  favicon: "/logo-icon.svg",
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
      theme: "theme-ocean-neon",
      language: "en",
      settings: { language: "en" },
      customerAssets: { ...defaultAssets },
      topSellers: [
        { id: "SEL-001", name: "Marine Masters", rating: 4.9, speed: "30 min", image: "🚢", products: ["🍣", "🐟", "🦑"] },
        { id: "SEL-002", name: "Deep Sea Delivery", rating: 5.0, speed: "45 min", image: "⚓", products: ["🦞", "🦀", "🦐"] },
        { id: "SEL-003", name: "Arctic Product", rating: 4.8, speed: "60 min", image: "❄️", products: ["🥩", "🐟", "🦀"] },
      ],

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
            const val = (sanitized as Record<string, string>)[key];
            if (typeof val === "string" && val.startsWith("blob:")) {
              (sanitized as Record<string, string>)[key] = "";
            }
          });

          set({
            marketplaceName: (settings.marketplaceName as string) || get().marketplaceName,
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
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.settings = { language: state.language ?? "en" };
        }
      },
    }
  )
);
