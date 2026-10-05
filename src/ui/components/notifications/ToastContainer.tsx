import React from 'react';
import { useToastStore } from '../../../app/store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md w-80
              ${toast.type === 'success' 
                ? 'bg-green-950/80 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]' 
                : 'bg-zinc-900/90 border-zinc-700/50'
              }
            `}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <div className={`font-bold text-sm ${toast.type === 'success' ? 'text-green-300' : 'text-zinc-200'}`}>
                {toast.title}
              </div>
              <div className="text-sm text-zinc-400 mt-1 leading-snug">
                {toast.message}
              </div>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
