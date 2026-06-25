import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "@/services/productService";

interface WishlistState {
  items: Product[];
  toggleFavorite: (product: Product) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (product) => {
        const items = get().items;
        const exists = items.some((item) => item.id === product.id);
        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "oceanexotic-wishlist",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
