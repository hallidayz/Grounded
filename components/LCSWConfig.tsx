import React, { useState } from 'react';
import { LCSWConfig } from '../types';

interface LCSWConfigProps {
  config: LCSWConfig | undefined;
  onUpdate: (config: LCSWConfig) => void;
  onClose: () => void;
}

const LCSWConfigComponent: React.FC<LCSWConfigProps> = ({ config, onUpdate, onClose }) => {
  const [protocols, setProtocols] = useState<string[]>(config?.protocols || []);
  const [crisisPhrases, setCrisisPhrases] = useState<string>(config?.crisisPhrases?.join('\n') || '');
  const [emergencyName, setEmergencyName] = useState(config?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(config?.emergencyContact?.phone || '');
  const [emergencyNotes, setEmergencyNotes] = useState(config?.emergencyContact?.notes || '');
  const [customPrompts, setCustomPrompts] = useState<string>(config?.customPrompts?.join('\n') || '');
  const [allowRecommendations, setAllowRecommendations] = useState(config?.allowStructuredRecommendations ?? true);

  const protocolOptions: ('CBT' | 'DBT' | 'ACT' | 'EMDR' | 'Other')[] = ['CBT', 'DBT', 'ACT', 'EMDR', 'Other'];

  const handleSave = () => {
    const newConfig: LCSWConfig = {
      protocols: protocols as ('CBT' | 'DBT' | 'ACT' | 'EMDR' | 'Other')[],
      crisisPhrases: crisisPhrases.split('\n').filter(p => p.trim().length > 0),
      emergencyContact: emergencyName || emergencyPhone ? {
        name: emergencyName,
        phone: emergencyPhone,
        notes: emergencyNotes || undefined
      } : undefined,
      customPrompts: customPrompts.split('\n').filter(p => p.trim().length > 0),
      allowStructuredRecommendations: allowRecommendations
    };
    onUpdate(newConfig);
    onClose();
  };

  const toggleProtocol = (protocol: string) => {
    setProtocols(prev => 
      prev.includes(protocol) 
        ? prev.filter(p => p !== protocol)
        : [...prev, protocol]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Configuration</h2>
              <p className="text-sm text-slate-500 mt-1">Configure therapy integration settings</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Treatment Protocols */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                Treatment Protocols
              </label>
              <div className="flex flex-wrap gap-2">
                {protocolOptions.map(protocol => (
                  <button
                    key={protocol}
                    onClick={() => toggleProtocol(protocol)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      protocols.includes(protocol)
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {protocol}
                  </button>
                ))}
              </div>
            </div>

            {/* Crisis Phrases */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                Crisis Detection Phrases
              </label>
              <p className="text-xs text-slate-500 mb-2">
                One phrase per line. When detected, the app will show crisis resources instead of AI responses.
              </p>
              <textarea
                value={crisisPhrases}
                onChange={(e) => setCrisisPhrases(e.target.value)}
                placeholder="suicide&#10;kill myself&#10;end my life&#10;self harm"
                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 min-h-[120px] resize-none text-sm"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                Emergency Contact
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Therapist Name"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700"
                />
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700"
                />
                <textarea
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="Additional notes (e.g., 'Available 24/7', 'Text preferred')"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 min-h-[80px] resize-none text-sm"
                />
              </div>
            </div>

            {/* Custom Prompts */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                Custom Homework/Worksheets
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Custom prompts or worksheets your therapist wants you to focus on. One per line.
              </p>
              <textarea
                value={customPrompts}
                onChange={(e) => setCustomPrompts(e.target.value)}
                placeholder="Practice mindfulness for 5 minutes daily&#10;Complete thought record worksheet&#10;Journal about triggers"
                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 min-h-[100px] resize-none text-sm"
              />
            </div>

            {/* Allow Recommendations */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <label className="text-xs font-black text-slate-900 block mb-1">
                  Allow Structured Recommendations
                </label>
                <p className="text-xs text-slate-500">
                  AI can suggest structured actions aligned with your treatment plan
                </p>
              </div>
              <button
                onClick={() => setAllowRecommendations(!allowRecommendations)}
                className={`w-16 h-8 rounded-full transition-all relative ${
                  allowRecommendations ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                  allowRecommendations ? 'left-9' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-sm"
            >
              Save Configuration
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              This configuration helps the app support your therapy integration. All AI processing happens on your device for privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LCSWConfigComponent;

