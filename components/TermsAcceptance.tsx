import React, { useState } from 'react';

interface TermsAcceptanceProps {
  onAccept: () => void;
  onDecline: () => void;
}

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({ onAccept, onDecline }) => {
  const [readTerms, setReadTerms] = useState(false);
  const [readDisclaimer, setReadDisclaimer] = useState(false);

  const canAccept = readTerms && readDisclaimer;

  return (
    <div className="min-h-screen bg-pure-foundation dark:bg-executive-depth flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-executive-depth rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-creative-depth/30 overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-authority-navy dark:text-pure-foundation tracking-tight">
              Acceptance of Terms and Conditions
            </h1>
            <p className="text-sm sm:text-base text-authority-navy/60 dark:text-pure-foundation/60">
              Please read the following information carefully before using this app.
            </p>
          </div>

          <div className="space-y-4 text-authority-navy dark:text-pure-foundation">
            <p className="text-sm sm:text-base leading-relaxed">
              By selecting "I Accept," you confirm that you have read, understood, and agree to the Terms and Conditions governing the use of this application ("the App").
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-creative-depth/30">
              <h2 className="text-lg sm:text-xl font-black text-authority-navy dark:text-pure-foundation">
                DISCLAIMER
              </h2>
              
              <div className="space-y-3 text-sm sm:text-base leading-relaxed">
                <p>
                  This App is designed for general wellness and informational purposes only. It is <strong>not</strong> a substitute for professional therapy, medical advice, diagnosis, or treatment.
                </p>
                
                <p>
                  You should always seek help from a licensed therapist, counselor, psychiatrist, or other qualified healthcare provider for mental health concerns.
                </p>
                
                <p>
                  If you are in crisis or believe you may be in danger, do not use this App as a source of emergency support. Please contact local emergency services or crisis resources immediately.
                </p>
              </div>

              <div className="bg-pure-foundation dark:bg-executive-depth/50 rounded-lg p-4 sm:p-5 space-y-2">
                <p className="font-bold text-sm sm:text-base">In the United States:</p>
                <ul className="space-y-2 text-sm sm:text-base list-disc list-inside ml-2">
                  <li>Call <strong>911</strong> for emergencies</li>
                  <li><strong>988 Suicide and Crisis Lifeline</strong> – Dial 988 (24/7, free, confidential)</li>
                  <li><strong>Crisis Text Line</strong> – Text HOME to 741741</li>
                  <li><strong>National Domestic Violence Hotline</strong> – 1-800-799-SAFE (7233)</li>
                </ul>
              </div>

              <p className="text-sm sm:text-base leading-relaxed pt-2">
                By proceeding, you acknowledge that you understand and agree to these terms and that you accept full responsibility for your use of the App.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-creative-depth/30">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={readTerms}
                onChange={(e) => setReadTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-authority-navy/30 dark:border-pure-foundation/30 text-brand-accent focus:ring-2 focus:ring-brand-accent/50 cursor-pointer"
              />
              <span className="text-sm sm:text-base text-authority-navy dark:text-pure-foundation leading-relaxed flex-1">
                I have read and understand the Terms and Conditions.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={readDisclaimer}
                onChange={(e) => setReadDisclaimer(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-authority-navy/30 dark:border-pure-foundation/30 text-brand-accent focus:ring-2 focus:ring-brand-accent/50 cursor-pointer"
              />
              <span className="text-sm sm:text-base text-authority-navy dark:text-pure-foundation leading-relaxed flex-1">
                I acknowledge this App does not replace professional therapy or emergency resources.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 sm:py-4 bg-pure-foundation dark:bg-executive-depth/50 text-authority-navy dark:text-pure-foundation rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-80 transition-all border border-slate-200 dark:border-creative-depth/30"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!canAccept}
              className={`flex-1 px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base transition-all ${
                canAccept
                  ? 'bg-brand-accent text-authority-navy hover:opacity-90 shadow-lg active:scale-[0.98]'
                  : 'bg-slate-200 dark:bg-executive-depth/30 text-slate-400 dark:text-pure-foundation/30 cursor-not-allowed'
              }`}
            >
              Accept
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #cbd5e1; 
          border-radius: 10px; 
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #4a5568; 
        }
      `}</style>
    </div>
  );
};

export default TermsAcceptance;

