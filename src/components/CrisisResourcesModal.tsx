import React from 'react';
import { LCSWConfig } from '../types';

interface CrisisResourcesModalProps {
  onClose: () => void;
  lcswConfig?: LCSWConfig;
}

const CrisisResourcesModal: React.FC<CrisisResourcesModalProps> = ({ onClose, lcswConfig }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-dark/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-dark-bg-primary w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-pop relative border border-border-soft dark:border-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 sm:p-10 space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">📞</div>
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight">
              Crisis Resources
            </h2>
            <p className="text-sm sm:text-base text-text-primary/60 dark:text-white/60">
              You're not alone. Help is available 24/7.
            </p>
          </div>

          <div className="space-y-4">
            {/* Emergency Services */}
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 sm:p-5 rounded-xl">
              <h3 className="text-lg font-black text-red-800 dark:text-red-300 mb-2">
                🚨 Emergency Services
              </h3>
              <div className="space-y-2 text-sm text-red-700 dark:text-red-200">
                <p>
                  <strong>911</strong> - For immediate emergencies
                </p>
                <p className="text-xs text-red-600 dark:text-red-300">
                  Call 911 if you or someone else is in immediate danger.
                </p>
              </div>
            </div>

            {/* Crisis Hotlines */}
            <div className="bg-yellow-warm/10 dark:bg-yellow-warm/20 border-l-4 border-yellow-warm p-4 sm:p-5 rounded-xl">
              <h3 className="text-lg font-black text-text-primary dark:text-white mb-3">
                📞 Crisis Hotlines (24/7, Free, Confidential)
              </h3>
              <div className="space-y-3 text-sm text-text-primary dark:text-white">
                <div>
                  <p className="font-bold text-base">988 Suicide & Crisis Lifeline</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary mt-1">
                    Dial <strong>988</strong> or text 988. Available 24/7 for anyone in suicidal crisis or emotional distress.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base">Crisis Text Line</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary mt-1">
                    Text <strong>HOME</strong> to <strong>741741</strong>. Free, 24/7 crisis support via text message.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base">National Domestic Violence Hotline</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary mt-1">
                    Call <strong>1-800-799-SAFE (7233)</strong> or text START to 88788. 24/7 support for domestic violence.
                  </p>
                </div>
              </div>
            </div>

            {/* Therapist Contact */}
            {lcswConfig?.emergencyContact?.phone && (
              <div className="bg-navy-primary/10 dark:bg-navy-primary/20 border-l-4 border-navy-primary p-4 sm:p-5 rounded-xl">
                <h3 className="text-lg font-black text-text-primary dark:text-white mb-2">
                  👤 Your Therapist
                </h3>
                <div className="space-y-2 text-sm text-text-primary dark:text-white">
                  {lcswConfig.emergencyContact.phone && (
                    <p>
                      <strong>Phone:</strong> {lcswConfig.emergencyContact.phone}
                    </p>
                  )}
                  {lcswConfig.emergencyContact.email && (
                    <p>
                      <strong>Email:</strong> {lcswConfig.emergencyContact.email}
                    </p>
                  )}
                  {lcswConfig.emergencyContact.name && (
                    <p className="text-xs text-text-secondary dark:text-text-secondary mt-1">
                      Contact: {lcswConfig.emergencyContact.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Important Note */}
            <div className="bg-bg-secondary dark:bg-dark-bg-secondary p-4 sm:p-5 rounded-xl border border-border-soft dark:border-dark-border">
              <p className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed">
                <strong>Remember:</strong> These resources are available 24/7. If you're in crisis, don't wait - reach out immediately. Your safety and wellbeing are important.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-navy-primary dark:bg-navy-primary text-white dark:text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisResourcesModal;

