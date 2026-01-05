import React from 'react';

interface DatabaseMigrationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DatabaseMigrationModal: React.FC<DatabaseMigrationModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-white dark:bg-dark-bg-primary w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-pop relative border border-border-soft dark:border-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-warm/20 dark:bg-yellow-warm/30 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-text-primary dark:text-white mb-2">
                Existing Database Found
              </h2>
              <p className="text-sm sm:text-base text-text-secondary dark:text-text-secondary">
                An existing on-device database for <strong>Grounded</strong> already exists.
              </p>
            </div>

            <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-bold text-text-primary dark:text-white">
                ⚠️ Important Notice
              </p>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary">
                Proceeding with this app will remove the old database and replace it with a new database just for this application.
              </p>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary mt-2">
                <strong>All existing data in the old database will be lost.</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {/* Primary action: Skip and use existing database */}
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest bg-yellow-warm text-text-primary hover:opacity-90 transition-all shadow-lg"
              >
                Skip (Use Existing)
              </button>
              {/* Secondary action: Reset database */}
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white hover:opacity-90 transition-all"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseMigrationModal;

