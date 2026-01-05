import React, { useState, useEffect } from 'react';
import { generateDebugLog, formatDebugLogForEmail, createEmailWithDebugLog, clearDebugLog, clearLogEntriesByLevel, clearLogEntry } from '../services/debugLog';
import type { DebugLog } from '../services/debugLog';

interface DebugLogProps {
  onClose: () => void;
}

const DebugLogComponent: React.FC<DebugLogProps> = ({ onClose }) => {
  const [log, setLog] = useState<DebugLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['errors', 'warnings']));

  useEffect(() => {
    // Generate debug log (debug logging is already initialized in App.tsx)
    generateDebugLog()
      .then((debugLog) => {
        setLog(debugLog);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to generate debug log:', error);
        setLoading(false);
        setLog(null);
      });
  }, []);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleCopy = async () => {
    if (!log) return;
    
    const logText = formatDebugLogForEmail(log);
    try {
      await navigator.clipboard.writeText(logText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard. Please use the email button instead.');
    }
  };

  const handleEmail = () => {
    if (!log) return;
    
    const emailLink = createEmailWithDebugLog(log);
    window.location.href = emailLink;
    setEmailed(true);
  };

  const handleClear = () => {
    if (window.confirm("Warning: This will permanently delete all captured debug logs. Are you sure?")) {
      clearDebugLog();
      setLoading(true);
      generateDebugLog().then((debugLog) => {
        setLog(debugLog);
        setLoading(false);
        setCopied(false);
        setEmailed(false);
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-dark-bg-primary w-full max-w-2xl rounded-[40px] shadow-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-primary mx-auto mb-4"></div>
            <p className="text-text-secondary dark:text-text-secondary">Generating debug log...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-dark-bg-primary w-full max-w-2xl rounded-[40px] shadow-2xl p-8">
          <div className="text-center">
            <p className="text-text-secondary dark:text-text-secondary">Failed to generate debug log.</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 bg-navy-primary text-white rounded-xl font-black uppercase tracking-widest"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-bg-primary w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-soft dark:border-dark-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-text-primary dark:text-white">Debug Log</h2>
            <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">
              Diagnostic information for troubleshooting
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* System Information */}
          <Section
            title="System Information"
            expanded={expandedSections.has('system')}
            onToggle={() => toggleSection('system')}
          >
            <div className="space-y-2 text-sm">
              <InfoRow label="App Version" value={log.appVersion} />
              <InfoRow label="Platform" value={log.platform} />
              <InfoRow label="Browser" value={`${log.browserInfo.name} ${log.browserInfo.version}`} />
              <InfoRow label="Engine" value={log.browserInfo.engine} />
              <InfoRow label="Language" value={log.language} />
              <InfoRow label="Timezone" value={log.timezone} />
              <InfoRow label="Screen" value={log.screenResolution} />
            </div>
          </Section>

          {/* Browser Compatibility */}
          <Section
            title="Browser Compatibility"
            expanded={expandedSections.has('compatibility')}
            onToggle={() => toggleSection('compatibility')}
          >
            <div className="space-y-2 text-sm">
              <StatusRow label="SharedArrayBuffer" value={log.compatibility.sharedArrayBuffer} />
              <StatusRow label="Cross-Origin Isolated" value={log.compatibility.crossOriginIsolated} />
              <StatusRow label="WebGPU" value={log.compatibility.webGPU} />
              <StatusRow label="WebAssembly" value={log.compatibility.webAssembly} />
              <InfoRow label="Estimated Memory" value={`${log.compatibility.estimatedMemory} MB`} />
              <InfoRow label="Device" value={log.compatibility.device} />
              <InfoRow label="Browser" value={log.compatibility.browser} />
            </div>
          </Section>

          {/* AI Model Status */}
          <Section
            title="AI Model Status"
            expanded={expandedSections.has('ai')}
            onToggle={() => toggleSection('ai')}
          >
            <div className="space-y-2 text-sm">
              <StatusRow label="Models Loaded" value={log.aiModelStatus.loaded} />
              <InfoRow label="Loading" value={log.aiModelStatus.loading ? 'Yes' : 'No'} />
              <StatusRow label="Mood Tracker" value={log.aiModelStatus.moodTracker} />
              <StatusRow label="Counseling Coach" value={log.aiModelStatus.counselingCoach} />
            </div>
          </Section>

          {/* Storage */}
          <Section
            title="Storage"
            expanded={expandedSections.has('storage')}
            onToggle={() => toggleSection('storage')}
          >
            <div className="space-y-2 text-sm">
              <StatusRow label="LocalStorage" value={log.localStorage.available} />
              <InfoRow label="Keys" value={log.localStorage.keys.join(', ') || 'None'} />
              <StatusRow label="IndexedDB" value={log.indexedDB.available} />
              <InfoRow label="Databases" value={log.indexedDB.databases.join(', ') || 'None'} />
            </div>
          </Section>

          {/* Service Worker */}
          <Section
            title="Service Worker"
            expanded={expandedSections.has('sw')}
            onToggle={() => toggleSection('sw')}
          >
            <div className="space-y-2 text-sm">
              <StatusRow label="Available" value={log.serviceWorker.available} />
              <StatusRow label="Registered" value={log.serviceWorker.registered} />
              {log.serviceWorker.scope && (
                <InfoRow label="Scope" value={log.serviceWorker.scope} />
              )}
            </div>
          </Section>

          {/* Network */}
          <Section
            title="Network"
            expanded={expandedSections.has('network')}
            onToggle={() => toggleSection('network')}
          >
            <div className="space-y-2 text-sm">
              <StatusRow label="Online" value={log.networkStatus.online} />
              {log.networkStatus.connectionType && (
                <InfoRow label="Connection" value={log.networkStatus.connectionType} />
              )}
            </div>
          </Section>

          {/* Errors */}
          {log.errors.length > 0 && (
            <Section
              title={`Errors (${log.errors.length})`}
              expanded={expandedSections.has('errors')}
              onToggle={() => toggleSection('errors')}
            >
              <div className="space-y-3 text-sm">
                {log.errors.map((error, index) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="font-semibold text-red-800 dark:text-red-200">{error.message}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error.timestamp}</p>
                    {error.stack && (
                      <pre className="text-xs text-red-600 dark:text-red-400 mt-2 whitespace-pre-wrap break-all">
                        {error.stack.split('\n').slice(0, 3).join('\n')}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Warnings */}
          {log.warnings.length > 0 && (
            <Section
              title={`Warnings (${log.warnings.length})`}
              expanded={expandedSections.has('warnings')}
              onToggle={() => toggleSection('warnings')}
            >
              <div className="space-y-3 text-sm">
                {log.warnings.map((warning, index) => (
                  <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-800 dark:text-yellow-200">{warning.message}</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{warning.timestamp}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (clearLogEntry(warning.timestamp, warning.message, 'warning')) {
                          // Regenerate log to update display
                          generateDebugLog().then((debugLog) => {
                            setLog(debugLog);
                          });
                        }
                      }}
                      className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 px-2 py-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors flex-shrink-0"
                      title="Clear this warning"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border-soft dark:border-dark-border space-y-3">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary"
            >
              {copied ? '✓ Copied!' : 'Copy Log'}
            </button>
            <button
              onClick={handleEmail}
              className="flex-1 px-4 py-3 bg-navy-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90"
            >
              📧 Email Support
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              🗑️ Clear All
            </button>
            {log.warnings.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Clear all ${log.warnings.length} warning(s)?`)) {
                    clearLogEntriesByLevel('warning');
                    generateDebugLog().then((debugLog) => {
                      setLog(debugLog);
                    });
                  }
                }}
                className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
              >
                ⚠️ Clear Warnings
              </button>
            )}
          </div>
          <p className="text-xs text-text-tertiary dark:text-text-tertiary text-center">
            Click "Email Support" to open your email client with the debug log attached
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper Components
interface SectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, expanded, onToggle, children }) => (
  <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-border-soft dark:border-dark-border overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
    >
      <span className="text-sm font-black text-text-primary dark:text-white uppercase tracking-widest">
        {title}
      </span>
      <svg
        className={`w-5 h-5 text-text-tertiary dark:text-text-tertiary transition-transform ${expanded ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {expanded && <div className="px-4 py-3 border-t border-border-soft dark:border-dark-border">{children}</div>}
  </div>
);

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-text-secondary dark:text-text-secondary">{label}:</span>
    <span className="font-semibold text-text-primary dark:text-white">{value}</span>
  </div>
);

interface StatusRowProps {
  label: string;
  value: boolean;
}

const StatusRow: React.FC<StatusRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-text-secondary dark:text-text-secondary">{label}:</span>
    <span className={`font-semibold ${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {value ? '✓' : '✗'}
    </span>
  </div>
);

export default DebugLogComponent;

