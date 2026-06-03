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
  
  // Customer Theme Engine
  customerTheme: string;
  atmosphericGlow: number;
  flashDealActive: boolean;
  flashDealEnd: string;
  customerAssets: {
    logo: string;
    hero: string;
    favicon: string;
    appleIcon: string;
    promo: string;
    promoSecondary: string;
    mobile: string;
    placeholder: string;
  };

  // PayU Registry
  payu: {
    merchantKey: string;
    merchantSalt: string;
    mode: 'test' | 'live';
  };

  setSettings: (settings: Partial<SettingsState>) => void;
  authorizeMultiSig: () => void;
  fetchSettings: () => Promise<void>;
  pushSettings: () => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      marketplaceName: "OceanExotic Global",
      currency: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata (IST)",
      commissionRate: 12,
      multiSigAuthorized: false,
      theme: "theme-ocean-neon",
      font: "font-inter",
      customerTheme: "theme-midnight-deep",
      atmosphericGlow: 15,
      flashDealActive: true,
      flashDealEnd: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3 hours from now
      customerAssets: {
        logo: "",
        hero: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80",
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
      
      // Default Global Handshakes
      instagram: "@oceanexotic_global",
      youtube: "youtube.com/@oceanexotic",
      whatsapp: "+91 98765 43210",
      contactNumber: "+91 03192 123456",
      address: "Marine Hub, Phoenix Bay, Port Blair, Andaman & Nicobar Islands",

      setSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
      authorizeMultiSig: () => set({ multiSigAuthorized: true }),

      fetchSettings: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/system/settings.php`);
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
          const state = useSettingsStore.getState();
          const settingsToSave = {
            marketplaceName: state.marketplaceName,
            currency: state.currency,
            customerTheme: state.customerTheme,
            atmosphericGlow: state.atmosphericGlow,
            flashDealActive: state.flashDealActive,
            flashDealEnd: state.flashDealEnd,
            customerAssets: state.customerAssets,
            instagram: state.instagram,
            youtube: state.youtube,
            whatsapp: state.whatsapp,
            contactNumber: state.contactNumber,
            address: state.address,
            theme: state.theme,
            payu: state.payu
          };

          const response = await fetch(`${API_BASE_URL}/system/settings.php`, {
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
