import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => set((state) => {
        const existingItem = state.items.find(item => item._id === product._id);

        if (existingItem) {
          return {
            items: state.items.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          };
        }

        return { items: [...state.items, { ...product, quantity: 1 }] };
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item._id !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item._id === productId ? { ...item, quantity } : item
        )
      })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'gofarm-cart',
    }
  )
);
