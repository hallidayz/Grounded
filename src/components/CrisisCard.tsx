/**
 * Crisis Card Component
 * 
 * Displays region-specific crisis resources with functional tel: and sms: links.
 * Appears when crisis is detected (keyword or Safety Auditor).
 * 
 * Features:
 * - Region-specific resources (US, UK, CA, AU, INTL)
 * - Functional tel: and sms: links
 * - Quick Exit button for domestic violence scenarios
 * - Warm, supportive language
 */

import React, { useState, useEffect } from 'react';
import { getCrisisResources, detectRegion, buildSMSUri, type Region, type CrisisResource } from '../services/crisisResources';
import { logger } from '../utils/logger';

interface CrisisCardProps {
  onClose?: () => void;
  showQuickExit?: boolean; // For domestic violence scenarios
  region?: Region; // Override auto-detection
}

const CrisisCard: React.FC<CrisisCardProps> = ({ 
  onClose, 
  showQuickExit = false,
  region: overrideRegion 
}) => {
  const [detectedRegion, setDetectedRegion] = useState<Region>('US');
  const [resources, setResources] = useState(getCrisisResources('US'));

  useEffect(() => {
    const region = overrideRegion || detectRegion();
    setDetectedRegion(region);
    setResources(getCrisisResources(region));
  }, [overrideRegion]);

  const handleQuickExit = () => {
    // Clear browser history and close app/tab
    if (typeof window !== 'undefined') {
      // Clear recent history
      window.history.replaceState(null, '', '/');
      // Attempt to close (may not work in all browsers)
      window.close();
      // If close fails, redirect to a safe page
      setTimeout(() => {
        window.location.href = 'https://www.google.com';
      }, 100);
    }
  };

  const handleCall = (action: string) => {
    if (action && action.startsWith('tel:')) {
      window.location.href = action;
    }
  };

  const handleText = (action: string, body?: string) => {
    if (action && action.startsWith('sms:')) {
      // Extract number from sms: URI
      const number = action.replace('sms:', '').split(/[?&]/)[0];
      const smsUri = buildSMSUri(number, body);
      window.location.href = smsUri;
    }
  };

  const renderResourceButton = (resource: CrisisResource) => {
    if (resource.callAction) {
      return (
        <button
          onClick={() => handleCall(resource.callAction!)}
          className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>📞</span>
          {resource.buttonLabel}
        </button>
      );
    }
    
    if (resource.textAction) {
      return (
        <button
          onClick={() => handleText(resource.textAction!, resource.textBody)}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>💬</span>
          {resource.buttonLabel}
        </button>
      );
    }
    
    if (resource.url) {
      return (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 px-6 bg-navy-primary hover:bg-navy-dark text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>🌐</span>
          {resource.buttonLabel}
        </a>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-bg-primary w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-red-500/30">
        {/* Quick Exit Button (for domestic violence) */}
        {showQuickExit && (
          <div className="bg-red-600 text-white p-3 text-center">
            <button
              onClick={handleQuickExit}
              className="text-sm font-bold uppercase tracking-wide hover:underline"
            >
              🚨 Quick Exit
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 p-6 sm:p-8 text-center border-b border-red-100 dark:border-red-900/30">
          <div className="text-5xl mb-3">❤️‍🩹</div>
          <h2 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mb-2">
            I'm glad you reached out
          </h2>
          <p className="text-sm sm:text-base text-red-700 dark:text-red-300 leading-relaxed">
            I'm glad you reached out, but I need you to talk to a person. As an AI, I have limits. What you're describing needs a human touch and professional support. These services are free, confidential, and available 24/7.
          </p>
        </div>

        {/* Resources */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Primary Resource */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-text-primary dark:text-white">
              Immediate Help
            </h3>
            {renderResourceButton(resources.primary)}
            <p className="text-xs text-text-secondary dark:text-white/70">
              {resources.primary.subtext}
            </p>
          </div>

          {/* Secondary Resource */}
          {resources.secondary && (
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-text-primary dark:text-white">
                Alternative Support
              </h3>
              {renderResourceButton(resources.secondary)}
              <p className="text-xs text-text-secondary dark:text-white/70">
                {resources.secondary.subtext}
              </p>
            </div>
          )}

          {/* LGBTQ+ Resource */}
          {resources.lgbtq && (
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-text-primary dark:text-white">
                LGBTQ+ Support
              </h3>
              {renderResourceButton(resources.lgbtq)}
              <p className="text-xs text-text-secondary dark:text-white/70">
                {resources.lgbtq.subtext}
              </p>
            </div>
          )}

          {/* Domestic Violence Resource */}
          {resources.domesticViolence && (
            <div className="space-y-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-bold text-text-primary dark:text-white">
                Domestic Violence Support
              </h3>
              {renderResourceButton(resources.domesticViolence)}
              <p className="text-xs text-text-secondary dark:text-white/70 mt-2">
                {resources.domesticViolence.subtext}
              </p>
              {showQuickExit && (
                <p className="text-xs text-text-secondary dark:text-white/70 mt-2 italic">
                  You can clear your browser history after visiting this page.
                </p>
              )}
            </div>
          )}

          {/* Emergency Services */}
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
              🚨 Emergency Services
            </h3>
            <p className="text-sm text-red-700 dark:text-red-200">
              <strong>911</strong> (US) or your local emergency number - For immediate life-threatening emergencies
            </p>
          </div>
        </div>

        {/* Footer */}
        {onClose && (
          <div className="p-4 bg-bg-secondary dark:bg-dark-bg-secondary border-t border-border-soft dark:border-dark-border text-center">
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary dark:text-white/60 dark:hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrisisCard;
