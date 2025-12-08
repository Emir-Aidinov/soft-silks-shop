import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RecentProduct {
  handle: string;
  title: string;
  image: string;
  price: number;
  viewedAt: number;
}

interface RecentlyViewedStore {
  products: RecentProduct[];
  addProduct: (product: RecentProduct) => void;
  clearProducts: () => void;
}

const MAX_RECENT_PRODUCTS = 10;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const { products } = get();
        // Remove if already exists
        const filtered = products.filter(p => p.handle !== product.handle);
        // Add to front with current timestamp
        const updated = [
          { ...product, viewedAt: Date.now() },
          ...filtered
        ].slice(0, MAX_RECENT_PRODUCTS);
        
        set({ products: updated });
      },

      clearProducts: () => set({ products: [] }),
    }),
    {
      name: 'recently-viewed',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
