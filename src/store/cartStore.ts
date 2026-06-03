import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId?: string;
  isMarinated?: boolean;
  selectedMarinade?: string;
  cutOption?: string;
  sellerName?: string;
  metadata?: any;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleMarination: (id: string) => void;
  updateCutOption: (id: string, option: string) => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find((i) => i.id === item.id);
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
          ),
        }),
      clearCart: () => set({ items: [] }),
      toggleMarination: (id) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, isMarinated: !i.isMarinated, selectedMarinade: !i.isMarinated ? 'Tandoori Island Rub' : undefined } : i
          ),
        }),
      updateCutOption: (id, option) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, cutOption: option } : i
          ),
        }),
      getTotal: () => get().items.reduce((acc, item) => {
        const marinationPremium = item.isMarinated ? 150 : 0;
        return acc + (item.price + marinationPremium) * item.quantity;
      }, 0),
    }),
    {
      name: 'oceanexotic-cart',
    }
  )
);
