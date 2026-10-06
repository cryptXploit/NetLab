import React from 'react';
import { useProStore } from '../../../app/store/useProStore';
import { Crown } from 'lucide-react';

export const AdBanner: React.FC = () => {
  const { isPro, setShowPaywall } = useProStore();

  if (isPro) return null;

  return (
    <div className="w-full bg-surface border-t border-border-strong p-2 flex items-center justify-center shrink-0 z-50">
      <div 
        onClick={() => setShowPaywall(true)}
        className="w-[320px] h-[50px] bg-elevated border border-border border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-border-base transition-colors"
      >
        <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Advertisement</span>
        <div className="flex items-center gap-1.5 text-accent text-xs font-medium">
          <Crown className="w-3 h-3" />
          Remove Ads with Pro
        </div>
      </div>
    </div>
  );
};
