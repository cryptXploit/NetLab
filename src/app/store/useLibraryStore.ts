import { create } from 'zustand';
import { LibraryService } from '../../core/persistence/LibraryService';
import { type SavedLab } from '../../core/persistence/db';

interface LibraryStoreState {
  isLibraryOpen: boolean;
  savedLabs: SavedLab[];
  toggleLibrary: () => void;
  fetchLabs: () => Promise<void>;
  deleteLab: (id: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryStoreState>((set) => ({
  isLibraryOpen: false,
  savedLabs: [],

  toggleLibrary: () => {
    set(state => ({ isLibraryOpen: !state.isLibraryOpen }));
  },

  fetchLabs: async () => {
    try {
      const labs = await LibraryService.getSavedLabs();
      set({ savedLabs: labs });
    } catch (err) {
      console.error('Failed to fetch labs:', err);
    }
  },

  deleteLab: async (id: string) => {
    try {
      await LibraryService.deleteLab(id);
      const labs = await LibraryService.getSavedLabs();
      set({ savedLabs: labs });
    } catch (err) {
      console.error('Failed to delete lab:', err);
    }
  }
}));
