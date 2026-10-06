import React, { useState } from 'react';
import { useProStore } from '../../../app/store/useProStore';
import { useToastStore } from '../../../app/store/useToastStore';
import { X, Check, ShieldAlert, Zap, Network, Crown, Loader2 } from 'lucide-react';

export const ProPaywallModal: React.FC = () => {
  const { showPaywall, setShowPaywall, unlockPro, restorePurchases } = useProStore();
  const addToast = useToastStore(state => state.addToast);
  
  const [isProcessing, setIsProcessing] = useState(false);

  if (!showPaywall) return null;

  const handlePurchase = () => {
    setIsProcessing(true);
    // Mock purchase flow
    setTimeout(() => {
      setIsProcessing(false);
      unlockPro();
      addToast('NETLAB Pro Unlocked!', 'Welcome to the premium experience.', 'success');
    }, 1500);
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    const success = await restorePurchases();
    setIsProcessing(false);
    if (success) {
      addToast('Purchases Restored', 'Your Pro access has been restored.', 'success');
    } else {
      addToast('Restore Failed', 'No previous purchases found.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isProcessing && setShowPaywall(false)}
      />

      {/* Modal */}
      <div className="relative bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-border-strong animate-in zoom-in-95 duration-200">
        
        {/* Header / Hero */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          
          <button 
            onClick={() => setShowPaywall(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            disabled={isProcessing}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
              <Crown className="w-8 h-8 text-amber-900" />
            </div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">NETLAB Pro</h2>
            <p className="text-indigo-200 text-sm font-medium">
              Master network engineering with zero limits.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="p-6 pb-2">
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-primary">Ad-Free Experience</h4>
                <p className="text-sm text-secondary leading-snug">Focus completely on learning without any visual interruptions.</p>
              </div>
            </li>
            
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                <Network className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-primary">Advanced Curriculum</h4>
                <p className="text-sm text-secondary leading-snug">Unlock complex multi-router topologies and advanced troubleshooting labs.</p>
              </div>
            </li>
            
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-bold text-primary">Unlimited Practice</h4>
                <p className="text-sm text-secondary leading-snug">Generate infinite deterministic scenarios to drill your mastery.</p>
              </div>
            </li>
            
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h4 className="font-bold text-primary">Network Doctor Premium</h4>
                <p className="text-sm text-secondary leading-snug">Get deeper, step-by-step diagnostic hints when you are stuck.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action Area */}
        <div className="p-6 bg-base mt-2 flex flex-col gap-3">
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-accent to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-accent-hover hover:to-indigo-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unlock Forever • $9.99'}
          </button>
          
          <button
            onClick={handleRestore}
            disabled={isProcessing}
            className="text-xs font-bold text-muted hover:text-secondary uppercase tracking-widest text-center py-2 transition-colors"
          >
            Restore Purchases
          </button>
        </div>
        
      </div>
    </div>
  );
};
