import React, { useState } from 'react';
import { LCSWConfig, AppSettings } from '../types';
import EmailScheduleComponent from './EmailSchedule';

interface LCSWConfigProps {
  config: LCSWConfig | undefined;
  onUpdate: (config: LCSWConfig) => void;
  onClose: () => void;
  settings?: AppSettings;
  onUpdateSettings?: (settings: AppSettings) => void;
}

const LCSWConfigComponent: React.FC<LCSWConfigProps> = ({ config, onUpdate, onClose, settings, onUpdateSettings }) => {
  const [protocols, setProtocols] = useState<string[]>(config?.protocols || []);
  const [crisisPhrases, setCrisisPhrases] = useState<string>(config?.crisisPhrases?.join('\n') || '');
  const [emergencyName, setEmergencyName] = useState(config?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(config?.emergencyContact?.phone || '');
  const [emergencyNotes, setEmergencyNotes] = useState(config?.emergencyContact?.notes || '');
  const [customPrompts, setCustomPrompts] = useState<string>(config?.customPrompts?.join('\n') || '');
  const [allowRecommendations, setAllowRecommendations] = useState(config?.allowStructuredRecommendations ?? true);
  const [showEmailSchedule, setShowEmailSchedule] = useState(false);

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

            {/* Crisis Phrases - Non-editable notice */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                Crisis Detection
              </label>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 mb-4">
                <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
                  🔒 Automatic Crisis Detection (Non-Editable)
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  The app uses <strong>comprehensive, hardcoded crisis detection</strong> that monitors for over 100+ phrases across 8 categories including direct suicide statements, self-harm language, planning indicators, and immediate danger signals. These detection phrases <strong>cannot be modified or disabled</strong> to ensure consistent safety monitoring.
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 italic">
                  When crisis language is detected, the app immediately stops normal responses and displays emergency resources, crisis hotlines (988), and encourages contacting professional help or emergency services.
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Additional Custom Phrases (Optional)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  You can add custom phrases here, but note that the comprehensive hardcoded detection will still be active. Custom phrases are in addition to, not replacements for, the built-in safety monitoring.
                </p>
                <textarea
                  value={crisisPhrases}
                  onChange={(e) => setCrisisPhrases(e.target.value)}
                  placeholder="Add any additional phrases specific to your practice (optional)&#10;Note: Built-in crisis detection remains active"
                  className="w-full p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none text-slate-700 dark:text-slate-200 min-h-[100px] resize-none text-sm"
                />
              </div>
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

            {/* Email Summaries */}
            {settings && onUpdateSettings && (
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      Email Summaries
                    </label>
                    <p className="text-xs text-slate-500">
                      Schedule automatic reports to your therapist
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmailSchedule(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700"
                  >
                    Configure
                  </button>
                </div>
                {settings.emailSchedule?.enabled && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-700">
                      <strong>Active:</strong> {settings.emailSchedule.frequency} at {settings.emailSchedule.time}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Recipients: {settings.emailSchedule.recipientEmails.length} email(s)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* AI Model */}
            <div className="border-t border-slate-200 pt-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                AI Model
              </label>
              <p className="text-xs text-slate-500 mb-4">
                Update the on-device psychology-centric assistant
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-700 mb-2">
                    <strong>Current Model:</strong> DistilBERT (Text Classification)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    A tiny, on-device, psychology-centric assistant that avoids wild speculation. Models are quantized for mobile devices.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm('This will clear and re-download the AI model. This may take a few minutes and requires internet connection. Continue?')) {
                      try {
                        const { initializeModels } = await import('../services/aiService');
                        const success = await initializeModels(true); // Force reload
                        if (success) {
                          alert('Model update complete! The new model has been downloaded and cached on your device.');
                        } else {
                          alert('Model update failed. The app will continue using rule-based responses. This may be due to browser compatibility or network issues. Please check your internet connection and try again.');
                        }
                      } catch (error) {
                        console.error('Model update error:', error);
                        alert('Error updating model. Please try again later.');
                      }
                    }
                  }}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700"
                >
                  Update AI Model
                </button>
                <p className="text-[9px] text-slate-400 text-center">
                  Recommended: MiniCPM-0.5B or TinyLlama-1.1B (quantized for mobile)
                </p>
              </div>
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

      {showEmailSchedule && settings && onUpdateSettings && (
        <EmailScheduleComponent
          schedule={settings.emailSchedule}
          onUpdate={(schedule) => onUpdateSettings({ ...settings, emailSchedule: schedule })}
          onClose={() => setShowEmailSchedule(false)}
        />
      )}
    </div>
  );
};

export default LCSWConfigComponent;

