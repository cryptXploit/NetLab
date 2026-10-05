import React from 'react';
import { useTutorialStore } from '../../../app/store/useTutorialStore';
import { TUTORIAL_STEPS } from '../../../core/tutorial/TutorialSteps';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const TutorialOverlay: React.FC = () => {
  const { isActive, currentStep, nextStep, skipTutorial } = useTutorialStore();

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm pointer-events-auto"
        >
          <div className="bg-zinc-900 border-2 border-indigo-500/50 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.2)] p-5 overflow-hidden relative">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="bg-indigo-900/50 p-2 rounded-lg text-indigo-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-100 text-lg">
                {TUTORIAL_STEPS[currentStep].title}
              </h3>
            </div>
            
            <p className="text-sm text-zinc-400 leading-relaxed mb-6 relative z-10 min-h-[3rem]">
              {TUTORIAL_STEPS[currentStep].content}
            </p>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex gap-1.5">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-indigo-500' : 'w-1.5 bg-zinc-700'}`}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={skipTutorial}
                  className="px-4 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => nextStep(TUTORIAL_STEPS.length)}
                  className="px-5 py-1.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
