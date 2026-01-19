import React, { useState, useEffect } from 'react';
import { LCSWConfig } from '../types';
import { getCrisisResources, detectRegion, buildSMSUri, type Region } from '../services/crisisResources';

interface CrisisResourcesModalProps {
  onClose: () => void;
  lcswConfig?: LCSWConfig;
  region?: Region; // Override auto-detection
}

const CrisisResourcesModal: React.FC<CrisisResourcesModalProps> = ({ onClose, lcswConfig, region: overrideRegion }) => {
  const [detectedRegion, setDetectedRegion] = useState<Region>('US');
  const [resources, setResources] = useState(getCrisisResources('US'));

  useEffect(() => {
    const region = overrideRegion || detectRegion();
    setDetectedRegion(region);
    setResources(getCrisisResources(region));
  }, [overrideRegion]);

  const handleCall = (action: string) => {
    if (action && action.startsWith('tel:')) {
      window.location.href = action;
    }
  };

  const handleText = (action: string, body?: string) => {
    if (action && action.startsWith('sms:')) {
      const number = action.replace('sms:', '').split(/[?&]/)[0];
      const smsUri = buildSMSUri(number, body);
      window.location.href = smsUri;
    }
  };

  const renderResourceButton = (resource: typeof resources.primary) => {
    if (!resource) return null;

    if (resource.callAction) {
      return (
        <a
          href={resource.callAction}
          onClick={(e) => {
            e.preventDefault();
            handleCall(resource.callAction!);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-lg transition-all active:scale-95"
        >
          <span>📞</span>
          {resource.buttonLabel}
        </a>
      );
    }
    
    if (resource.textAction) {
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleText(resource.textAction!, resource.textBody);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-lg transition-all active:scale-95"
        >
          <span>💬</span>
          {resource.buttonLabel}
        </a>
      );
    }
    
    if (resource.url) {
      return (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-navy-primary hover:bg-navy-dark text-white font-bold text-base rounded-lg transition-all active:scale-95"
        >
          <span>🌐</span>
          {resource.buttonLabel}
        </a>
      );
    }
    
    return null;
  };
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
          {/* Header with new copy */}
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">🆘</div>
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight">
              Need urgent help now?
            </h2>
            <p className="text-sm sm:text-base text-text-primary/60 dark:text-white/60 italic">
              Grounded is not emergency care or therapy.
              <br />
              For urgent help:
            </p>
          </div>

          <div className="space-y-4">
            {/* 988 - Primary Resource */}
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 sm:p-5 rounded-xl">
              <h3 className="text-lg font-black text-red-800 dark:text-red-300 mb-3">
                📞 988 Suicide & Crisis Lifeline
              </h3>
              <p className="text-sm text-red-700 dark:text-red-200 mb-3">
                24/7, Free, Confidential
              </p>
              <div className="flex gap-2">
                <a
                  href="tel:988"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-lg transition-all active:scale-95"
                >
                  <span>📞</span>
                  Call 988
                </a>
                <a
                  href="sms:988&body=HOME"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-lg transition-all active:scale-95"
                >
                  <span>💬</span>
                  Text HOME to 988
                </a>
              </div>
            </div>

            {/* Crisis Text Line */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 sm:p-5 rounded-xl">
              <h3 className="text-lg font-black text-blue-800 dark:text-blue-300 mb-3">
                💬 Crisis Text Line
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
                Text HOME to 741741 for free, 24/7 support
              </p>
              <a
                href="sms:741741&body=HOME"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-lg transition-all active:scale-95"
              >
                <span>💬</span>
                Text HOME to 741741
              </a>
            </div>

            {/* Emergency Services */}
            <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-400 p-4 sm:p-5 rounded-xl">
              <h3 className="text-lg font-black text-gray-800 dark:text-gray-200 mb-2">
                🚨 Emergency Services
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>911</strong> - For immediate life-threatening emergencies
              </p>
            </div>

            {/* Local Resources Link */}
            <a
              href="https://findahelpline.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-navy-primary hover:bg-navy-dark text-white font-bold text-base rounded-lg transition-all"
            >
              <span>🌐</span>
              Find local crisis lines
            </a>

            {/* Important Note */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed text-center">
                <strong>Grounded</strong> is a moment helper, not emergency care.
                <br />
                These resources are available 24/7. Your safety matters.
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

