import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProState {
  isPro: boolean;
  showPaywall: boolean;
  
  unlockPro: () => void;
  restorePurchases: () => Promise<boolean>;
  setShowPaywall: (show: boolean) => void;
}

export const useProStore = create<ProState>()(
  persist(
    (set) => ({
      isPro: true, // Monetization deferred for V1
      showPaywall: false,
      
      unlockPro: () => set({ isPro: true, showPaywall: false }),
      
      restorePurchases: async () => {
        // Mock implementation for restoring purchases
        return new Promise(resolve => {
          setTimeout(() => {
            // Normally this would query the App Store / Play Store
            set({ isPro: true, showPaywall: false });
            resolve(true);
          }, 1500);
        });
      },
      
      setShowPaywall: (show) => set({ showPaywall: show }),
    }),
    {
      name: 'netlab-pro-storage',
      partialize: (state) => ({ isPro: state.isPro })
    }
  )
);
