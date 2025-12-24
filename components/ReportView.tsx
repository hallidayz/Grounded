
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
      // Generate report using on-device AI with LCSW configuration
      const report = await generateHumanReports(filteredLogs, values, lcswConfig);
      setGeneratedReport(report);
      setMode('generate');
    } catch (error) {
      console.error("Report synthesis failed:", error);
      alert("Something went wrong while synthesizing your journey. Please try again.");
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
          <h2 className="text-2xl sm:text-3xl font-black text-authority-navy dark:text-pure-foundation tracking-tight">Clinical Synthesis</h2>
          <p className="text-authority-navy/60 dark:text-pure-foundation/60 text-sm sm:text-lg mt-1">Human-first insights for professional sharing.</p>
        </div>
        {mode === 'generate' && (
          <button onClick={() => setMode('review')} className="text-brand-accent font-black uppercase text-[10px] tracking-widest hover:underline">
            ← Edit Selection
          </button>
        )}
      </div>

      {mode === 'review' ? (
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[10px] font-black text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest">Select your records</h3>
              <span className="text-[10px] font-bold text-brand-accent bg-brand-accent/20 dark:bg-brand-accent/30 px-2 sm:px-3 py-1 rounded-full uppercase">{selectedLogIds.size} Ready</span>
            </div>
            <div className="space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {sortedLogs.length === 0 && (
                 <div className="text-center py-16 sm:py-24 bg-white dark:bg-executive-depth rounded-2xl sm:rounded-[40px] border border-dashed border-slate-200 dark:border-creative-depth/30 text-authority-navy/50 dark:text-pure-foundation/50">
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
                    className={`w-full text-left bg-white dark:bg-executive-depth p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] border-2 transition-all flex gap-3 sm:gap-6 ${isSelected ? 'border-brand-accent shadow-xl' : 'border-slate-100 dark:border-creative-depth/30 opacity-50'}`}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1 ${isSelected ? 'bg-brand-accent border-brand-accent' : 'border-slate-200 dark:border-creative-depth/50'}`}>
                      {isSelected && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-authority-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between mb-2">
                        <span className="text-[9px] sm:text-[10px] font-black text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</span>
                        <span className="text-xl sm:text-2xl">{log.mood}</span>
                      </div>
                      <p className="text-base sm:text-lg font-black text-authority-navy dark:text-pure-foundation truncate">{val?.name}</p>
                      <p className="text-authority-navy/70 dark:text-pure-foundation/70 mt-2 sm:mt-3 italic leading-relaxed text-sm sm:text-base line-clamp-2">"{log.note}"</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-executive-depth p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[48px] border border-slate-100 dark:border-creative-depth/30 shadow-2xl sticky top-20 sm:top-24 space-y-6 sm:space-y-8">
               <div className="space-y-3 sm:space-y-4">
                 <p className="text-sm font-bold text-authority-navy dark:text-pure-foundation">Synthesis Engine</p>
                 <p className="text-xs text-authority-navy/60 dark:text-pure-foundation/60 leading-relaxed">This will generate a natural-language report in SOAP, DAP, and BIRP formats simultaneously. Perfect for review with your therapist.</p>
               </div>
              <button
                onClick={handleGenerate}
                disabled={loading || selectedLogIds.size === 0}
                className="w-full py-4 sm:py-5 bg-authority-navy dark:bg-creative-depth text-white dark:text-pure-foundation rounded-2xl sm:rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-20 text-[9px] sm:text-[10px]"
              >
                {loading ? 'Synthesizing...' : 'Generate All'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8 animate-pop">
           <div className="bg-white dark:bg-executive-depth p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-[56px] shadow-2xl border border-brand-accent/20 dark:border-brand-accent/30 max-w-4xl mx-auto prose prose-slate dark:prose-invert">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-slate-100 dark:border-creative-depth/30">
                <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em]">Confidential Clinical Summary</p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedReport);
                      alert("All formats copied to clipboard!");
                    }}
                    className="px-4 sm:px-6 py-2 bg-brand-accent/20 dark:bg-brand-accent/30 text-brand-accent rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent/30 dark:hover:bg-brand-accent/40"
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
                    className="px-4 sm:px-6 py-2 bg-brand-accent text-authority-navy rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:opacity-90"
                  >
                    {isWebShareAvailable() ? '📧 Share' : '📧 Email'}
                  </button>
                </div>
              </div>
              <div className="whitespace-pre-wrap font-sans text-authority-navy dark:text-pure-foundation leading-relaxed text-sm sm:text-base lg:text-lg">
                {generatedReport}
              </div>
           </div>
           <p className="text-center text-authority-navy/50 dark:text-pure-foundation/50 text-xs font-medium">These reports are generated on-device using local AI for your personal review. All processing happens on your device for privacy.</p>
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
