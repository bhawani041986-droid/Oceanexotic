import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { settingsService } from "@/services/settingsService";

export interface CustomerAssets {
  logo: string;
  hero: string;
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
  flashDealEnd: string;
  theme: string;
  customerAssets: CustomerAssets;
  fetchSettings: () => Promise<void>;
  setSettings: (partial: Partial<SettingsState>) => void;
}

const defaultAssets: CustomerAssets = {
  logo: "",
  hero: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80",
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
      flashDealEnd: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
      theme: "theme-zomato-passion",
      customerAssets: { ...defaultAssets },

      setSettings: (partial) => set((s) => ({ ...s, ...partial })),

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
            flashDealEnd: (settings.flashDealEnd as string) || get().flashDealEnd,
            theme: (settings.customerTheme as string) || (settings.theme as string) || get().theme,
            customerAssets: sanitized,
          });
        } catch {
          /* keep persisted defaults */
        }
      },
    }),
    {
      name: "oceanexotic-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
