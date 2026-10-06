import React from 'react';
import { Home, BookOpen, Hexagon, Target, User } from 'lucide-react';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { HapticService } from '../../../core/native/HapticService';

export const BottomNav: React.FC = () => {
  const currentTab = useWorkspaceStore(state => state.currentTab);
  const setTab = useWorkspaceStore(state => state.setTab);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'labs', label: 'Labs', icon: BookOpen },
    { id: 'sandbox', label: 'Sandbox', icon: Hexagon },
    { id: 'practice', label: 'Practice', icon: Target },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="flex w-full bg-elevated border-t border-border-strong px-2 pb-[env(safe-area-inset-bottom)] z-[100] relative pointer-events-auto">
      <div className="flex w-full max-w-md mx-auto justify-around items-end pt-2 pb-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!isActive) {
                  HapticService.selection();
                  setTab(tab.id);
                }
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${
                isActive ? 'text-accent' : 'text-muted hover:text-secondary'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-accent-soft' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
