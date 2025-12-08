import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[]; // Array of product handles
  
  addFavorite: (handle: string) => void;
  removeFavorite: (handle: string) => void;
  toggleFavorite: (handle: string) => void;
  isFavorite: (handle: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (handle) => {
        const { favorites } = get();
        if (!favorites.includes(handle)) {
          set({ favorites: [...favorites, handle] });
        }
      },

      removeFavorite: (handle) => {
        set({ favorites: get().favorites.filter(h => h !== handle) });
      },

      toggleFavorite: (handle) => {
        const { favorites, addFavorite, removeFavorite } = get();
        if (favorites.includes(handle)) {
          removeFavorite(handle);
        } else {
          addFavorite(handle);
        }
      },

      isFavorite: (handle) => {
        return get().favorites.includes(handle);
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
