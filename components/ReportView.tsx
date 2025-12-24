
import React, { useState, useMemo } from 'react';
import { LogEntry, ValueItem, LCSWConfig } from '../types';
import { generateHumanReports } from '../services/aiService';
import { shareViaEmail, generateEmailReport, isWebShareAvailable } from '../services/emailService';

interface ReportViewProps {
  logs: LogEntry[];
  values: ValueItem[];
  lcswConfig?: LCSWConfig;
}

const ReportView: React.FC<ReportViewProps> = ({ logs, values, lcswConfig }) => {
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set(logs.map(l => l.id)));
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'review' | 'generate'>('review');

  const filteredLogs = useMemo(() => {
    return logs.filter(l => selectedLogIds.has(l.id));
  }, [logs, selectedLogIds]);

  const handleGenerate = async () => {
    if (filteredLogs.length === 0) {
      alert("Please select at least one log to synthesize.");
      return;
    }
    setLoading(true);
    try {
      // Generate report using on-device AI with configuration
      // This will use rule-based fallback if AI models aren't available
      const report = await generateHumanReports(filteredLogs, values, lcswConfig);
      setGeneratedReport(report);
      setMode('generate');
    } catch (error) {
      console.error("Report synthesis failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to load on-device models')) {
        // Model loading failed - show alert and generate fallback report
        alert("AI models are not available. The app will generate a basic report using rule-based analysis. Please check your internet connection and try updating the models in Settings.");
        
        // Generate and display fallback report
        const { generateFallbackReport } = await import('../services/aiService');
        const fallbackReport = generateFallbackReport(filteredLogs, values);
        const disclaimer = `\n\n---\n\n*This report was generated using rule-based analysis because AI models are not available. For AI-enhanced reports, please check your internet connection and try updating the models in Settings.*`;
        setGeneratedReport(fallbackReport + disclaimer);
        setMode('generate');
      } else {
        alert("Something went wrong while synthesizing your journey. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleLog = (id: string) => {
    setSelectedLogIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in pb-12 sm:pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-navy-primary dark:text-white tracking-tight">Clinical Synthesis</h2>
          <p className="text-text-secondary dark:text-text-secondary text-sm sm:text-lg mt-1">Human-first insights for professional sharing.</p>
        </div>
        {mode === 'generate' && (
          <button onClick={() => setMode('review')} className="text-yellow-warm dark:text-yellow-warm font-black uppercase text-[10px] tracking-widest hover:underline">
            ← Edit Selection
          </button>
        )}
      </div>

      {mode === 'review' ? (
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[10px] font-black text-text-secondary dark:text-text-secondary uppercase tracking-widest">Select your records</h3>
              <span className="text-[10px] font-bold text-yellow-warm bg-yellow-warm/20 dark:bg-yellow-warm/30 px-2 sm:px-3 py-1 rounded-full uppercase">{selectedLogIds.size} Ready</span>
            </div>
            <div className="space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {sortedLogs.length === 0 && (
                 <div className="text-center py-16 sm:py-24 bg-white dark:bg-dark-bg-primary rounded-2xl sm:rounded-[40px] border border-dashed border-border-soft dark:border-dark-border text-text-tertiary dark:text-text-tertiary">
                    No data in the vault yet.
                 </div>
              )}
              {sortedLogs.map(log => {
                const val = values.find(v => v.id === log.valueId);
                const isSelected = selectedLogIds.has(log.id);
                return (
                  <button 
                    key={log.id} 
                    onClick={() => toggleLog(log.id)}
                    className={`w-full text-left bg-white dark:bg-dark-bg-primary p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] border-2 transition-all flex gap-3 sm:gap-6 ${isSelected ? 'border-yellow-warm shadow-xl' : 'border-border-soft dark:border-dark-border opacity-50'}`}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1 ${isSelected ? 'bg-yellow-warm border-yellow-warm' : 'border-border-soft dark:border-dark-border'}`}>
                      {isSelected && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-navy-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between mb-2">
                        <span className="text-[9px] sm:text-[10px] font-black text-text-secondary dark:text-text-secondary uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</span>
                        <span className="text-xl sm:text-2xl">{log.mood}</span>
                      </div>
                      <p className="text-base sm:text-lg font-black text-text-primary dark:text-white truncate">{val?.name}</p>
                      {log.deepReflection && (
                        <p className="text-text-primary dark:text-white/80 mt-2 sm:mt-3 leading-relaxed text-xs sm:text-sm line-clamp-2 font-medium">
                          Deep Reflection: {log.deepReflection.substring(0, 100)}{log.deepReflection.length > 100 ? '...' : ''}
                        </p>
                      )}
                      <p className="text-text-primary/70 dark:text-white/70 mt-2 sm:mt-3 italic leading-relaxed text-sm sm:text-base line-clamp-2">"{log.note}"</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-bg-primary p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[48px] border border-border-soft dark:border-dark-border shadow-2xl sticky top-20 sm:top-24 space-y-6 sm:space-y-8">
               <div className="space-y-3 sm:space-y-4">
                 <p className="text-sm font-bold text-text-primary dark:text-white">Synthesis Engine</p>
                 <p className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed">This will generate a natural-language report in SOAP, DAP, and BIRP formats simultaneously. Perfect for review with your therapist.</p>
               </div>
              <button
                onClick={handleGenerate}
                disabled={loading || selectedLogIds.size === 0}
                className="w-full py-4 sm:py-5 bg-navy-primary dark:bg-navy-primary text-white dark:text-white rounded-2xl sm:rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-20 text-[9px] sm:text-[10px]"
              >
                {loading ? 'Synthesizing...' : 'Generate All'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8 animate-pop">
           <div className="bg-white dark:bg-dark-bg-primary p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-[56px] shadow-2xl border border-yellow-warm/20 dark:border-yellow-warm/30 max-w-4xl mx-auto prose prose-slate dark:prose-invert">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-border-soft dark:border-dark-border">
                <p className="text-[10px] font-black text-yellow-warm uppercase tracking-[0.3em]">Confidential Clinical Summary</p>
                <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedReport);
                    alert("All formats copied to clipboard!");
                  }}
                    className="px-4 sm:px-6 py-2 bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-yellow-warm/30 dark:hover:bg-yellow-warm/40"
                >
                    Copy
                  </button>
                  <button 
                    onClick={async () => {
                      const emailData = generateEmailReport(filteredLogs, values, generatedReport);
                      const therapistEmails = lcswConfig?.emergencyContact?.phone 
                        ? [] // We'll use the emergency contact if available
                        : [];
                      const success = await shareViaEmail(emailData, therapistEmails);
                      if (!success) {
                        alert("Could not open email. Please copy the report and send manually.");
                      }
                    }}
                    className="px-4 sm:px-6 py-2 bg-yellow-warm text-navy-primary rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:opacity-90"
                  >
                    {isWebShareAvailable() ? '📧 Share' : '📧 Email'}
                </button>
                </div>
              </div>
              <div className="whitespace-pre-wrap font-sans text-text-primary dark:text-white leading-relaxed text-sm sm:text-base lg:text-lg">
                {generatedReport}
              </div>
           </div>
           <p className="text-center text-text-tertiary dark:text-text-tertiary text-xs font-medium">These reports are generated on-device using local AI for your personal review. All processing happens on your device for privacy.</p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; }
      `}</style>
    </div>
  );
};

export default ReportView;
