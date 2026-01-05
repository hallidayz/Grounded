import React, { useState, useEffect } from 'react';
import { dbService } from '../services/database';

interface DatabaseViewerProps {
  onClose: () => void;
}

const DatabaseViewer: React.FC<DatabaseViewerProps> = ({ onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dbService.exportAllData()
      .then(setData)
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-md">
      <div className="bg-white dark:bg-dark-bg-primary w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border-soft dark:border-dark-border">
        <div className="p-6 border-b border-border-soft dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-bg-primary">
          <div>
            <h2 className="text-xl font-black text-text-primary dark:text-white flex items-center gap-2">
              <span className="text-2xl">🗄️</span> Database Inspector
            </h2>
            <p className="text-xs text-text-secondary dark:text-text-secondary mt-1">
              Raw contents of groundedDB (Unencrypted)
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-text-tertiary hover:text-text-primary dark:text-text-tertiary dark:hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-bg-secondary/50 dark:bg-black/20 font-mono text-xs">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-primary"></div>
              <p className="text-text-secondary">Loading database content...</p>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
              Error: {error}
            </div>
          )}
          
          {data && (
            <div className="space-y-6">
              {Object.keys(data).map(storeName => (
                <div key={storeName} className="space-y-2">
                  {/* PREV: text-navy-primary dark:text-yellow-warm */}
                  <h3 className="text-sm font-bold text-navy-primary dark:text-brand-light uppercase tracking-wider sticky top-0 bg-bg-secondary dark:bg-dark-bg-secondary p-2 rounded-lg border border-border-soft dark:border-dark-border/50">
                    {storeName} <span className="opacity-50">({data[storeName].length} items)</span>
                  </h3>
                  <div className="pl-2 border-l-2 border-border-soft dark:border-dark-border ml-2">
                    {data[storeName].length > 0 ? (
                      <pre className="whitespace-pre-wrap break-all text-text-primary dark:text-white/80 overflow-x-auto">
                        {JSON.stringify(data[storeName], null, 2)}
                      </pre>
                    ) : (
                      <p className="text-text-tertiary italic p-2">Empty store</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border-soft dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-bg-primary">
           <p className="text-xs text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             Confidential Data
           </p>
           <button
             onClick={() => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `grounded-db-dump-${new Date().toISOString()}.json`;
                a.click();
             }}
             className="px-4 py-2 bg-navy-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 shadow-lg flex items-center gap-2"
             disabled={!data}
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             Download JSON
           </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;
