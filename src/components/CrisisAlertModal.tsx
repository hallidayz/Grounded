import React from 'react';
import { CrisisResponse, CrisisResource } from '../services/safetyService';

interface CrisisAlertModalProps {
  data: CrisisResponse;
  onClose: () => void;
}

// Helper function to generate the correct href link
const getContactLink = (contact: CrisisResource['contact']): string => {
  if (contact.type === 'phone') {
    return `tel:${contact.number}`;
  }
  if (contact.type === 'text') {
    // For texting, we can use sms: scheme. 
    // Note: iOS/Android handle sms: body differently usually, but basic sms:number works.
    return `sms:${contact.number}`;
  }
  return '#'; // Fallback
};

export const CrisisAlertModal: React.FC<CrisisAlertModalProps> = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-bg-secondary w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 border-red-500/20 animate-scale-in">
        
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 p-6 text-center border-b border-red-100 dark:border-red-900/30">
          <span className="text-4xl mb-2 block">❤️‍🩹</span>
          <h3 className="text-xl font-black text-red-600 dark:text-red-400 uppercase tracking-wide">
            Support is Available
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-text-primary dark:text-white/90 text-center font-medium leading-relaxed">
            {data.message}
          </p>

          <div className="space-y-3">
            {data.resources.map((resource, index) => (
              <div 
                key={index}
                className="bg-bg-secondary dark:bg-dark-bg-primary rounded-xl p-4 border border-border-soft dark:border-dark-border"
              >
                <div className="font-bold text-navy-primary dark:text-white mb-2">
                  {resource.name}
                </div>
                
                <div className="flex gap-3">
                  {/* Primary Action Button (Call/Text) */}
                  <a 
                    href={getContactLink(resource.contact)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-brand dark:bg-brand-light text-white dark:text-navy-primary rounded-lg font-bold text-sm hover:opacity-90 transition-opacity active:scale-95"
                  >
                    <span>{resource.contact.type === 'phone' ? '📞' : '💬'}</span>
                    {resource.contact.displayText}
                  </a>

                  {/* Website Link */}
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center py-2 px-3 bg-white dark:bg-white/5 border border-border-soft dark:border-white/10 text-text-secondary dark:text-white/60 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                  >
                    🌐
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-bg-secondary dark:bg-dark-bg-primary border-t border-border-soft dark:border-dark-border text-center">
          <button 
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary dark:text-white/40 dark:hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrisisAlertModal;

