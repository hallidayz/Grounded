
import React, { useState } from 'react';
import DebugLogComponent from './DebugLog';
import DatabaseViewer from './DatabaseViewer';

interface HelpOverlayProps {
  onClose: () => void;
}

const HelpOverlay: React.FC<HelpOverlayProps> = ({ onClose }) => {
  const [showDebugLog, setShowDebugLog] = useState(false);
  const [showDatabaseViewer, setShowDatabaseViewer] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-dark/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-dark-bg-primary w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-pop relative border border-border-soft dark:border-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-10 space-y-8 max-h-[90vh] overflow-y-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-text-primary dark:text-white tracking-tight">How to navigate</h2>
            <p className="text-text-secondary dark:text-text-secondary font-medium">Mastering Grounded in 3 steps.</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-navy-primary dark:bg-navy-primary flex items-center justify-center text-white font-black shrink-0 shadow-lg">1</div>
              <div>
                <h4 className="font-black text-text-primary dark:text-white text-lg">Define & Rank</h4>
                <p className="text-text-secondary dark:text-text-secondary text-sm leading-relaxed">Pick up to 10 values in the <b>Values</b> tab. Rank them by dragging. Your top value becomes your "North Star" for the Dashboard guidance.</p>
              </div>
            </div>

            <div className="flex gap-6">
              {/* PREV: bg-yellow-warm ... text-navy-primary */}
              <div className="w-12 h-12 rounded-2xl bg-brand dark:bg-brand-light flex items-center justify-center text-white dark:text-navy-dark font-black shrink-0 shadow-lg">2</div>
              <div>
                <h4 className="font-black text-text-primary dark:text-white text-lg">Embody Daily</h4>
                <p className="text-text-secondary dark:text-text-secondary text-sm leading-relaxed">In the <b>Dashboard</b>, open a value to reflect on your progress. Log a win or set a "Next Aim" (micro-goal) to build momentum.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-calm-sage dark:bg-calm-sage flex items-center justify-center text-white dark:text-navy-primary font-black shrink-0 shadow-lg">3</div>
              <div>
                <h4 className="font-black text-text-primary dark:text-white text-lg">Synthesize</h4>
                <p className="text-text-secondary dark:text-text-secondary text-sm leading-relaxed">Use <b>Reports</b> to generate clinical-style summaries (SOAP/DAP) of your journey to share with a therapist or for personal growth audits.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-soft dark:border-dark-border space-y-4">
            <h3 className="text-lg font-black text-text-primary dark:text-white">Tips & Best Practices</h3>
            <div className="space-y-3">
              <div className="bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl flex items-start gap-4">
                <div className="text-2xl mt-1">💡</div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest">Pro Tip</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed font-medium">Head to <b>Settings</b> to enable "Growth and Progress" nudges—system notifications that keep your North Star top-of-mind.</p>
                </div>
              </div>
              <div className="bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl flex items-start gap-4">
                <div className="text-2xl mt-1">📱</div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest">Daily Practice</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed font-medium">Check your Dashboard daily to log wins and set micro-goals. Small consistent actions build lasting change.</p>
                </div>
              </div>
              <div className="bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl flex items-start gap-4">
                <div className="text-2xl mt-1">📊</div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest">Therapy Integration</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed font-medium">Use the <b>Reports</b> feature to generate summaries you can share with your therapist during sessions.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-soft dark:border-dark-border space-y-4">
            <h3 className="text-lg font-black text-text-primary dark:text-white">AI Model Information</h3>
            <div className="bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl space-y-3">
              <p className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">On-Device AI Processing</p>
              <div className="space-y-2 text-xs text-text-secondary dark:text-text-secondary leading-relaxed">
                <p>
                  <strong>Privacy First:</strong> All AI processing happens entirely on your device. No data is sent to external servers.
                </p>
                <p>
                  <strong>Fast Loading:</strong> AI models begin downloading immediately when the app starts, so they're ready when you need them.
                </p>
                <p>
                  <strong>Offline Capable:</strong> Once downloaded, models are cached locally for instant loading and offline use.
                </p>
                <p>
                  <strong>Progress Tracking:</strong> Watch the progress bar during first launch to see model download status.
                </p>
                <p>
                  <strong>Fallback Mode:</strong> If models fail to load, the app continues with rule-based responses. Core functionality remains available.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-soft dark:border-dark-border space-y-4">
            <h3 className="text-lg font-black text-text-primary dark:text-white">Support & Troubleshooting</h3>
            
            {/* Debug Log - Prominent */}
            {/* PREV: bg-yellow-warm/10 ... border-yellow-warm/30 */}
            <div className="bg-brand/10 dark:bg-brand/20 p-6 rounded-3xl border-2 border-brand/30 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔧</div>
                <div className="flex-1">
                  <p className="text-sm font-black text-text-primary dark:text-white mb-1">
                    Experiencing Issues?
                  </p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed mb-3">
                    Generate a debug log with diagnostic information. Debug logging starts automatically when the app launches.
                  </p>
                  <button
                    onClick={() => setShowDebugLog(true)}
                    className="w-full px-4 py-3 bg-navy-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Debug Log
                  </button>
                  <button
                    onClick={() => setShowDatabaseViewer(true)}
                    className="w-full mt-2 px-4 py-2 bg-transparent text-navy-primary dark:text-white border-2 border-navy-primary/10 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-navy-primary/5 dark:hover:bg-white/5 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    View Database
                  </button>
                </div>
              </div>
            </div>

            {/* Email Support */}
            <div className="bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl space-y-2">
              <p className="text-sm text-text-secondary dark:text-text-secondary leading-relaxed">
                Need help or have questions? We're here to assist you.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {/* PREV: text-navy-primary dark:text-yellow-warm */}
                <svg className="w-5 h-5 text-navy-primary dark:text-brand-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a 
                  href="mailto:ac.minds.ai@gmail.com?subject=Grounded App Support"
                  /* PREV: text-navy-primary dark:text-yellow-warm */
                  className="text-sm font-bold text-navy-primary dark:text-brand-light hover:underline"
                >
                  ac.minds.ai@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-soft dark:border-dark-border space-y-4">
            <h3 className="text-lg font-black text-text-primary dark:text-white">License</h3>
            <div className="bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl space-y-3">
              <p className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest">Apache License 2.0</p>
              <div className="space-y-2 text-xs text-text-secondary dark:text-text-secondary leading-relaxed">
                <p>
                  Copyright {new Date().getFullYear()} AC MiNDS
                </p>
                <p>
                  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at:
                </p>
                <a 
                  href="http://www.apache.org/licenses/LICENSE-2.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  /* PREV: text-navy-primary dark:text-yellow-warm */
                  className="text-navy-primary dark:text-brand-light hover:underline break-all"
                >
                  http://www.apache.org/licenses/LICENSE-2.0
                </a>
                <p>
                  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
             <button 
               onClick={onClose}
               className="w-full py-5 bg-navy-primary dark:bg-navy-primary text-white dark:text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
             >
               Got it, Let's grow
             </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
      {showDebugLog && <DebugLogComponent onClose={() => setShowDebugLog(false)} />}
      {showDatabaseViewer && <DatabaseViewer onClose={() => setShowDatabaseViewer(false)} />}
    </div>
  );
};

export default HelpOverlay;
