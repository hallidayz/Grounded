
import React, { useState, useMemo } from 'react';
import { LogEntry, ValueItem } from '../types';
import { generateHumanReports } from '../services/aiService';

interface ReportViewProps {
  logs: LogEntry[];
  values: ValueItem[];
}

const ReportView: React.FC<ReportViewProps> = ({ logs, values }) => {
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
      // UPDATED: Now awaiting the asynchronous call to generateHumanReports which uses Gemini.
      const report = await generateHumanReports(filteredLogs, values);
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
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Synthesis</h2>
          <p className="text-slate-500 text-lg">Human-first insights for professional sharing.</p>
        </div>
        {mode === 'generate' && (
          <button onClick={() => setMode('review')} className="text-indigo-600 font-black uppercase text-[10px] tracking-widest hover:underline">
            ← Edit Selection
          </button>
        )}
      </div>

      {mode === 'review' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select your records</h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">{selectedLogIds.size} Ready</span>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {sortedLogs.length === 0 && (
                 <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200 text-slate-400">
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
                    className={`w-full text-left bg-white p-8 rounded-[32px] border-2 transition-all flex gap-6 ${isSelected ? 'border-indigo-500 shadow-xl' : 'border-slate-50 opacity-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                      {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</span>
                        <span className="text-2xl">{log.mood}</span>
                      </div>
                      <p className="text-lg font-black text-slate-900">{val?.name}</p>
                      <p className="text-slate-600 mt-3 italic leading-relaxed">"{log.note}"</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl sticky top-24 space-y-8">
               <div className="space-y-4">
                 <p className="text-sm font-bold text-slate-900">Synthesis Engine</p>
                 <p className="text-xs text-slate-500 leading-relaxed">This will generate a natural-language report in SOAP, DAP, and BIRP formats simultaneously. Perfect for review with your therapist.</p>
               </div>
              <button
                onClick={handleGenerate}
                disabled={loading || selectedLogIds.size === 0}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-20"
              >
                {loading ? 'Synthesizing...' : 'Generate All'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-pop">
           <div className="bg-white p-12 rounded-[56px] shadow-2xl border border-indigo-50 max-w-4xl mx-auto prose prose-slate">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Confidential Clinical Summary</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedReport);
                    alert("All formats copied to clipboard!");
                  }}
                  className="px-6 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100"
                >
                  Copy All Formats
                </button>
              </div>
              <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-lg">
                {generatedReport}
              </div>
           </div>
           <p className="text-center text-slate-400 text-xs font-medium">These reports are generated using GenAI synthesis for your personal review.</p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ReportView;
