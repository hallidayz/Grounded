
import React from 'react';

interface HelpOverlayProps {
  onClose: () => void;
}

const HelpOverlay: React.FC<HelpOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-dark/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-dark-bg-primary w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-pop relative border border-border-soft dark:border-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-text-primary dark:text-white tracking-tight">How to navigate</h2>
            <p className="text-text-secondary dark:text-text-secondary font-medium">Mastering Grounded in 3 steps.</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-navy-primary dark:bg-navy-primary flex items-center justify-center text-white font-black shrink-0 shadow-lg">1</div>
              <div>
                <h4 className="font-black text-text-primary dark:text-white text-lg">Define & Rank</h4>
                <p className="text-text-secondary dark:text-text-secondary text-sm leading-relaxed">Pick up to 10 values in the <b>Values</b> tab. Rank them by dragging. Your top value becomes your "North Star" for the Dashboard guidance.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-yellow-warm dark:bg-yellow-warm flex items-center justify-center text-navy-primary dark:text-navy-primary font-black shrink-0 shadow-lg">2</div>
              <div>
                <h4 className="font-black text-text-primary dark:text-white text-lg">Embody Daily</h4>
                <p className="text-text-secondary dark:text-text-secondary text-sm leading-relaxed">In the <b>Dashboard</b>, open a value to reflect on your progress. Log a win or set a "Next Aim" (micro-goal) to build momentum.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-calm-sage dark:bg-calm-sage flex items-center justify-center text-white dark:text-navy-primary font-black shrink-0 shadow-lg">3</div>
              <div>
                <h4 className="font-black text-text-primary dark:text-white text-lg">Synthesize</h4>
                <p className="text-text-secondary dark:text-text-secondary text-sm leading-relaxed">Use <b>Reports</b> to generate clinical-style summaries (SOAP/DAP) of your journey to share with a therapist or for personal growth audits.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-soft dark:border-dark-border space-y-4">
             <div className="bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl flex items-start gap-4">
                <div className="text-2xl mt-1">💡</div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest">Pro Tip</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed font-medium">Head to the <b>Vault</b> to enable "Accountability Nudges"—system notifications that keep your North Star top-of-mind.</p>
                </div>
             </div>

             <button 
               onClick={onClose}
               className="w-full py-5 bg-navy-primary dark:bg-navy-primary text-white dark:text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
             >
               Got it, Let's grow
             </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default HelpOverlay;
