import React, { useState, useEffect, useRef } from 'react';
import { LCSWConfig, AppSettings, ReminderFrequency } from '../types';
import EmailScheduleComponent from './EmailSchedule';
import AIDiagnostics from './AIDiagnostics';
import { hapticFeedback } from '../utils/animations';
import { sendNtfyNotification, generateRandomTopic, isValidTopic } from '../services/ntfyService';
import { ALL_VALUES } from '../constants';
import { requestPermission, hasPermission, sendNotification } from '../services/notifications';
import { getModelStatus, areModelsLoaded, getSelectedModel, setSelectedModel, getAllModelConfigs, initializeModels } from '../services/aiService';
import { AIModelType } from '../types';

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
  
  // Collapsible state
  const [crisisDetectionExpanded, setCrisisDetectionExpanded] = useState(false);
  const [automaticCrisisExpanded, setAutomaticCrisisExpanded] = useState(false);
  const [customPhrasesExpanded, setCustomPhrasesExpanded] = useState(false);
  
  // Tooltip state
  const [hoveredProtocol, setHoveredProtocol] = useState<string | null>(null);
  const [touchedProtocol, setTouchedProtocol] = useState<string | null>(null);
  const protocolsContainerRef = useRef<HTMLDivElement>(null);
  
  // Accountability Engine state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [nextPulseInfo, setNextPulseInfo] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  
  // AI Model status
  const [modelStatus, setModelStatus] = useState<{ loaded: boolean; loading: boolean; moodTracker: boolean; counselingCoach: boolean } | null>(null);
  const [updatingModel, setUpdatingModel] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState<AIModelType>(settings?.aiModel || 'distilbert');
  
  // Sync selected model with settings when they change
  useEffect(() => {
    if (settings?.aiModel) {
      setSelectedAIModel(settings.aiModel);
      setSelectedModel(settings.aiModel);
    }
  }, [settings?.aiModel]);

  // Update permission state on mount
  useEffect(() => {
    if (hasPermission()) {
      setNotifPermission('granted');
    } else {
      setNotifPermission('default');
    }
  }, []);
  
  // Update model status
  useEffect(() => {
    const updateModelStatus = () => {
      try {
        const status = getModelStatus();
        setModelStatus(status);
      } catch (error) {
        console.warn('Could not get model status:', error);
      }
    };
    
    updateModelStatus();
    // Update status every 2 seconds to show real-time loading state
    const interval = setInterval(updateModelStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Dismiss tooltip when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        touchedProtocol &&
        protocolsContainerRef.current &&
        !protocolsContainerRef.current.contains(event.target as Node)
      ) {
        setTouchedProtocol(null);
      }
    };
    
    if (touchedProtocol) {
      // Add listeners for both mouse and touch events
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [touchedProtocol]);

  const protocolOptions: ('CBT' | 'DBT' | 'ACT' | 'EMDR' | 'Other')[] = ['CBT', 'DBT', 'ACT', 'EMDR', 'Other'];
  
  // Protocol descriptions
  const protocolDescriptions: Record<string, string> = {
    'CBT': 'Cognitive Behavioral Therapy: Focuses on identifying and changing negative thought patterns and behaviors.',
    'DBT': 'Dialectical Behavior Therapy: Combines cognitive-behavioral techniques with mindfulness and acceptance strategies.',
    'ACT': 'Acceptance and Commitment Therapy: Emphasizes accepting difficult thoughts and feelings while committing to values-based actions.',
    'EMDR': 'Eye Movement Desensitization and Reprocessing: Uses bilateral stimulation to process traumatic memories and reduce distress.',
    'Other': 'Other therapeutic approaches or custom protocols specific to your treatment plan.'
  };

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

  // Accountability Engine handlers
  useEffect(() => {
    if (!settings?.reminders) return;
    
    const updatePulsePreview = () => {
      if (!settings.reminders.enabled) {
        setNextPulseInfo('Disabled');
        return;
      }

      const now = new Date();
      const currentHour = now.getHours();
      const frequency = settings.reminders.frequency || 'daily';
      
      switch (frequency) {
        case 'hourly':
          if (currentHour >= 8 && currentHour < 20) {
            setNextPulseInfo(`Hourly: ${currentHour + 1}:00`);
          } else {
            setNextPulseInfo('Hourly: 8:00 AM');
          }
          break;
        case 'daily':
          setNextPulseInfo(`Daily: ${settings.reminders.time}`);
          break;
        case 'weekly':
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const targetDay = settings.reminders.dayOfWeek ?? 0;
          const dayName = days[targetDay];
          setNextPulseInfo(`Weekly: ${dayName} at ${settings.reminders.time}`);
          break;
        case 'monthly':
          const day = settings.reminders.dayOfMonth ?? 1;
          setNextPulseInfo(`Monthly: Day ${day} at ${settings.reminders.time}`);
          break;
        default:
          setNextPulseInfo(`Daily: ${settings.reminders.time}`);
          break;
      }
    };

    updatePulsePreview();
    const interval = setInterval(updatePulsePreview, 60000);
    return () => clearInterval(interval);
  }, [settings?.reminders]);

  const handleRequestPermission = async () => {
    const permission = await requestPermission();
    setNotifPermission(permission);
  };

  const toggleReminders = () => {
    if (!settings || !onUpdateSettings) return;
    if (notifPermission !== 'granted') {
      handleRequestPermission();
    }
    onUpdateSettings({
      ...settings,
      reminders: { ...settings.reminders, enabled: !settings.reminders.enabled }
    });
  };

  const handleFrequencyChange = (frequency: ReminderFrequency) => {
    if (!settings || !onUpdateSettings) return;
    onUpdateSettings({
      ...settings,
      reminders: { ...settings.reminders, frequency }
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings || !onUpdateSettings) return;
    onUpdateSettings({
      ...settings,
      reminders: { ...settings.reminders, time: e.target.value }
    });
  };

  const handleDayOfWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!settings || !onUpdateSettings) return;
    onUpdateSettings({
      ...settings,
      reminders: { ...settings.reminders, dayOfWeek: parseInt(e.target.value) }
    });
  };

  const handleDayOfMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings || !onUpdateSettings) return;
    const day = parseInt(e.target.value);
    if (day >= 1 && day <= 31) {
      onUpdateSettings({
        ...settings,
        reminders: { ...settings.reminders, dayOfMonth: day }
      });
    }
  };

  const handleCalendarToggle = async () => {
    if (!settings || !onUpdateSettings) return;
    if (!settings.reminders.useDeviceCalendar) {
      try {
        if ('calendar' in navigator && 'requestPermission' in navigator.calendar) {
          const permission = await (navigator.calendar as any).requestPermission();
          if (permission === 'granted') {
            onUpdateSettings({
              ...settings,
              reminders: { ...settings.reminders, useDeviceCalendar: true }
            });
          }
        } else {
          const now = new Date();
          const [hours, minutes] = settings.reminders.time.split(':').map(Number);
          const eventDate = new Date();
          eventDate.setHours(hours, minutes, 0, 0);
          const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Grounded Reflection Reminder&dates=${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=Time to reflect on your values`;
          window.open(googleCalendarUrl, '_blank');
          onUpdateSettings({
            ...settings,
            reminders: { ...settings.reminders, useDeviceCalendar: true }
          });
        }
      } catch (error) {
        console.error('Calendar access error:', error);
        alert('Could not access calendar. You can manually add reminders to your calendar.');
      }
    } else {
      onUpdateSettings({
        ...settings,
        reminders: { ...settings.reminders, useDeviceCalendar: false }
      });
    }
  };

  const handleNtfyToggle = () => {
    if (!settings || !onUpdateSettings) return;
    if (!settings.reminders.useNtfyPush) {
      const topic = settings.reminders.ntfyTopic || generateRandomTopic();
      onUpdateSettings({
        ...settings,
        reminders: { 
          ...settings.reminders, 
          useNtfyPush: true,
          ntfyTopic: topic
        }
      });
    } else {
      onUpdateSettings({
        ...settings,
        reminders: { ...settings.reminders, useNtfyPush: false }
      });
    }
  };

  const handleResetTopic = () => {
    if (!settings || !onUpdateSettings) return;
    const newTopic = generateRandomTopic();
    onUpdateSettings({
      ...settings,
      reminders: { ...settings.reminders, ntfyTopic: newTopic }
    });
    setTestStatus('idle');
  };

  const handleNtfyTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings || !onUpdateSettings) return;
    const topic = e.target.value.trim();
    if (isValidTopic(topic) || topic === '') {
      onUpdateSettings({
        ...settings,
        reminders: { ...settings.reminders, ntfyTopic: topic }
      });
    }
  };

  const handleTestNtfy = async () => {
    if (!settings || !onUpdateSettings) return;
    if (!settings.reminders.ntfyTopic) {
      const newTopic = generateRandomTopic();
      onUpdateSettings({
        ...settings,
        reminders: { ...settings.reminders, ntfyTopic: newTopic }
      });
      setTimeout(() => handleTestNtfy(), 100);
      return;
    }
    
    setTestStatus('sending');
    
    try {
      const testMessage = `💛 Test notification from Grounded! If you received this, push notifications are working perfectly!`;
      
      if (hasPermission()) {
        await sendNotification('Grounded Test', {
          body: testMessage,
          icon: '/favicon.ico'
        });
      }
      
      const success = await sendNtfyNotification(
        testMessage,
        'Grounded Test',
        {
          topic: settings.reminders.ntfyTopic,
          server: settings.reminders.ntfyServer
        }
      );
      
      if (success) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
        setTimeout(() => setTestStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Test notification error:', error);
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-bg-primary w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-text-primary dark:text-white">Configuration</h2>
              <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">Configure therapy integration settings</p>
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

          <div className="space-y-6">
            {/* Treatment Protocols */}
            <div>
              <label className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3 block">
                Treatment Protocols
              </label>
              <div 
                ref={protocolsContainerRef}
                className="flex flex-wrap gap-2 relative"
              >
                {protocolOptions.map(protocol => {
                  const isHovered = hoveredProtocol === protocol;
                  const isTouched = touchedProtocol === protocol;
                  const showTooltip = isHovered || isTouched;
                  
                  return (
                    <div
                      key={protocol}
                      className="relative"
                      onMouseEnter={() => setHoveredProtocol(protocol)}
                      onMouseLeave={() => {
                        setHoveredProtocol(null);
                        // Don't clear touched on mouse leave - let user dismiss manually on mobile
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        hapticFeedback('light');
                        // Toggle tooltip: if already showing, hide it; otherwise show it
                        if (touchedProtocol === protocol) {
                          setTouchedProtocol(null);
                        } else {
                          setTouchedProtocol(protocol);
                        }
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProtocol(protocol);
                          // On mobile, toggle tooltip visibility on click
                          if ('ontouchstart' in window) {
                            if (touchedProtocol === protocol) {
                              setTouchedProtocol(null);
                            } else {
                              setTouchedProtocol(protocol);
                            }
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative z-10 ${
                          protocols.includes(protocol)
                            ? 'bg-navy-primary text-white shadow-sm'
                            : 'bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary border border-border-soft dark:border-dark-border'
                        }`}
                      >
                        {protocol}
                      </button>
                      
                      {/* Tooltip - Persistent on mobile */}
                      {showTooltip && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 w-64 sm:w-72">
                          <div className="bg-navy-dark dark:bg-dark-bg-tertiary text-white dark:text-white rounded-xl p-3 shadow-2xl border border-navy-light/30 dark:border-dark-border animate-fade-in">
                            <p className="text-xs sm:text-sm sm:text-xs leading-relaxed font-medium">
                              {protocolDescriptions[protocol]}
                            </p>
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                              <div className="w-2 h-2 bg-navy-dark dark:bg-dark-bg-tertiary rotate-45 border-r border-b border-navy-light/30 dark:border-dark-border"></div>
                            </div>
                            {/* Close button for mobile (when tooltip is shown via touch) */}
                            {isTouched && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTouchedProtocol(null);
                                }}
                                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 dark:bg-white/20 active:bg-white/30 dark:active:bg-white/30 text-white dark:text-white transition-colors touch-target"
                                aria-label="Close tooltip"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Crisis Phrases - Collapsible */}
            <div>
              <button
                onClick={() => setCrisisDetectionExpanded(!crisisDetectionExpanded)}
                className="w-full flex items-center justify-between text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3 p-2 hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary rounded-lg transition-colors"
              >
                <span>Crisis Detection</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${crisisDetectionExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {crisisDetectionExpanded && (
                <div className="space-y-4">
                  {/* Automatic Crisis Detection - Collapsible */}
                  <div>
                    <button
                      onClick={() => setAutomaticCrisisExpanded(!automaticCrisisExpanded)}
                      className="w-full flex items-center justify-between p-4 bg-navy-light/10 dark:bg-navy-light/20 rounded-2xl border border-navy-light/30 dark:border-navy-light/50 hover:bg-navy-light/15 dark:hover:bg-navy-light/25 transition-colors"
                    >
                      <p className="text-xs font-bold text-navy-primary dark:text-navy-light">
                        🔒 Automatic Crisis Detection (Non-Editable)
                      </p>
                      <svg 
                        className={`w-4 h-4 text-navy-primary dark:text-navy-light transition-transform ${automaticCrisisExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {automaticCrisisExpanded && (
                      <div className="p-4 bg-navy-light/5 dark:bg-navy-light/10 rounded-xl mt-2 border border-navy-light/20 dark:border-navy-light/30">
                        <p className="text-xs text-navy-dark dark:text-navy-light leading-relaxed mb-2">
                          The app uses <strong>comprehensive, hardcoded crisis detection</strong> that monitors for over 100+ phrases across 8 categories including direct suicide statements, self-harm language, planning indicators, and immediate danger signals. These detection phrases <strong>cannot be modified or disabled</strong> to ensure consistent safety monitoring.
                        </p>
                        <p className="text-xs text-navy-primary dark:text-navy-light italic">
                          When crisis language is detected, the app immediately stops normal responses and displays emergency resources, crisis hotlines (988), and encourages contacting professional help or emergency services.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Additional Custom Phrases - Collapsible */}
                  <div>
                    <button
                      onClick={() => setCustomPhrasesExpanded(!customPhrasesExpanded)}
                      className="w-full flex items-center justify-between p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-2xl border border-border-soft dark:border-dark-border hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
                    >
                      <p className="text-xs font-bold text-text-primary dark:text-white">
                        Additional Custom Phrases (Optional)
                      </p>
                      <svg 
                        className={`w-4 h-4 text-text-primary dark:text-white transition-transform ${customPhrasesExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {customPhrasesExpanded && (
                      <div className="p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl mt-2 border border-border-soft dark:border-dark-border">
                        <p className="text-xs text-text-secondary dark:text-text-secondary mb-2">
                          You can add custom phrases here, but note that the comprehensive hardcoded detection will still be active. Custom phrases are in addition to, not replacements for, the built-in safety monitoring.
                        </p>
                        <textarea
                          value={crisisPhrases}
                          onChange={(e) => setCrisisPhrases(e.target.value)}
                          placeholder="Add any additional phrases specific to your practice (optional)&#10;Note: Built-in crisis detection remains active"
                          className="w-full p-4 rounded-xl bg-white dark:bg-dark-bg-tertiary border border-border-soft dark:border-dark-border focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white min-h-[100px] resize-none text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact - Collapsible */}
            <details className="group">
              <summary className="cursor-pointer text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3 p-2 hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary rounded-lg transition-colors list-none flex items-center justify-between">
                <span>Emergency Contact</span>
                <svg 
                  className="w-4 h-4 transition-transform group-open:rotate-180" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="space-y-3 mt-3">
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Therapist Name"
                  className="w-full p-4 rounded-2xl bg-bg-secondary dark:bg-dark-bg-secondary border-none focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white"
                />
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full p-4 rounded-2xl bg-bg-secondary dark:bg-dark-bg-secondary border-none focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white"
                />
                <textarea
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="Additional notes (e.g., 'Available 24/7', 'Text preferred')"
                  className="w-full p-4 rounded-2xl bg-bg-secondary dark:bg-dark-bg-secondary border-none focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white min-h-[80px] resize-none text-sm"
                />
              </div>
            </details>

            {/* Custom Homework/Worksheets - Collapsible */}
            <details className="group">
              <summary className="cursor-pointer text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3 p-2 hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary rounded-lg transition-colors list-none flex items-center justify-between">
                <span>Custom Homework/Worksheets</span>
                <svg 
                  className="w-4 h-4 transition-transform group-open:rotate-180" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 space-y-3">
                <p className="text-xs text-text-secondary dark:text-text-secondary">
                  Custom prompts, worksheets, or links your therapist wants you to focus on. One per line. Links will be clickable.
                </p>
                <textarea
                  value={customPrompts}
                  onChange={(e) => setCustomPrompts(e.target.value)}
                  placeholder="Practice mindfulness for 5 minutes daily&#10;Complete thought record worksheet&#10;https://example.com/worksheet.pdf&#10;Journal about triggers"
                  className="w-full p-4 rounded-2xl bg-bg-secondary dark:bg-dark-bg-secondary border border-border-soft dark:border-dark-border focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white min-h-[100px] resize-none text-sm"
                />
                {customPrompts && (
                  <div className="p-3 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl">
                    <p className="text-xs font-bold text-text-primary dark:text-white mb-2">Preview:</p>
                    <div className="space-y-1 text-xs text-text-primary dark:text-white">
                      {customPrompts.split('\n').filter(line => line.trim()).map((line, idx) => {
                        const isUrl = /^https?:\/\//.test(line.trim());
                        return (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-text-tertiary">•</span>
                            {isUrl ? (
                              <a 
                                href={line.trim()} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-navy-primary dark:text-navy-light hover:underline break-all"
                              >
                                {line.trim()}
                              </a>
                            ) : (
                              <span>{line.trim()}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </details>

            {/* Allow Recommendations */}
            <div className="flex items-center justify-between p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-2xl border border-border-soft dark:border-dark-border">
              <div className="flex-1">
                <label className="text-xs font-black text-text-primary dark:text-white block mb-1">
                  Allow Structured Recommendations
                </label>
                <p className="text-xs text-text-secondary dark:text-text-secondary">
                  AI can suggest structured actions aligned with your treatment plan
                </p>
              </div>
              <button
                onClick={() => setAllowRecommendations(!allowRecommendations)}
                className={`w-14 h-8 rounded-full transition-all relative flex-shrink-0 ${
                  allowRecommendations ? 'bg-navy-primary' : 'bg-border-soft dark:bg-dark-bg-primary'
                }`}
                aria-label={allowRecommendations ? 'Disable recommendations' : 'Enable recommendations'}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                  allowRecommendations ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Email Summaries - Collapsible */}
            {settings && onUpdateSettings && (
              <details className="group border-t border-border-soft dark:border-dark-border pt-6">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-1 block">
                        Email Summaries
                      </label>
                      <p className="text-xs text-text-secondary dark:text-text-secondary">
                        Schedule automatic reports to your therapist
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings.emailSchedule?.enabled && (
                        <span className="px-2 py-1 bg-calm-sage/20 dark:bg-calm-sage/20 text-calm-sage dark:text-calm-sage rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest">
                          Active
                        </span>
                      )}
                      <svg 
                        className="w-4 h-4 text-text-primary dark:text-white transition-transform group-open:rotate-180" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </summary>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowEmailSchedule(true)}
                    className="w-full px-4 py-3 bg-navy-primary text-white dark:text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 border border-navy-primary"
                  >
                    Configure Email Summaries
                  </button>
                  {settings.emailSchedule?.enabled && (
                    <div className="p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-border-soft dark:border-dark-border">
                      <p className="text-xs text-text-primary dark:text-white mb-1">
                        <strong>Active:</strong> {settings.emailSchedule.frequency} at {settings.emailSchedule.time}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-text-secondary">
                        Recipients: {settings.emailSchedule.recipientEmails.length} email(s)
                      </p>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Growth and Progress (Accountability Engine) - Collapsible */}
            {settings && onUpdateSettings && (
              <details className="group border-t border-border-soft dark:border-dark-border pt-6" open={false}>
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-1 block">
                        Growth and Progress
                      </label>
                      <p className="text-xs text-text-secondary dark:text-text-secondary">
                        Keep your North Star in sight throughout the day
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          toggleReminders();
                        }}
                        /* PREV: bg-yellow-warm */
                        className={`w-14 h-8 rounded-full transition-all relative ${settings.reminders.enabled ? 'bg-brand dark:bg-brand-light' : 'bg-border-soft dark:bg-dark-bg-primary'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.reminders.enabled ? 'right-1' : 'left-1'}`} />
                      </button>
                      <svg 
                        className="w-4 h-4 text-text-primary dark:text-white transition-transform group-open:rotate-180" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </summary>
                <div className={`space-y-6 transition-all duration-500 ${settings.reminders.enabled ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none'}`}>
                  {/* Frequency Selector */}
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block">
                      {(settings.reminders.frequency || 'daily').charAt(0).toUpperCase() + (settings.reminders.frequency || 'daily').slice(1)} Reflection Reminder
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['hourly', 'daily', 'weekly', 'monthly'] as ReminderFrequency[]).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => handleFrequencyChange(freq)}
                          className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                            (settings.reminders.frequency || 'daily') === freq
                              /* PREV: bg-yellow-warm text-text-primary ... hover:bg-yellow-warm/20 */
                              ? 'bg-brand dark:bg-brand-light text-white dark:text-navy-dark shadow-lg scale-105'
                              : 'bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/60 dark:text-white/60 hover:bg-brand/10 dark:hover:bg-brand/20'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time and Schedule Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {((settings.reminders.frequency || 'daily') === 'daily' || (settings.reminders.frequency || 'daily') === 'weekly' || (settings.reminders.frequency || 'daily') === 'monthly') && (
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block">
                          Time
                        </label>
                        <input 
                          type="time" 
                          value={settings.reminders.time}
                          onChange={handleTimeChange}
                          /* PREV: focus:ring-yellow-warm */
                          className="w-full bg-bg-secondary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 rounded-xl p-3 font-black text-text-primary dark:text-white focus:ring-2 focus:ring-brand dark:focus:ring-brand-light transition-all outline-none"
                        />
                      </div>
                    )}

                    {(settings.reminders.frequency || 'daily') === 'weekly' && (
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block">
                          Day of Week
                        </label>
                        <select
                          value={settings.reminders.dayOfWeek ?? 0}
                          onChange={handleDayOfWeekChange}
                          /* PREV: focus:ring-yellow-warm */
                          className="w-full bg-bg-secondary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 rounded-xl p-3 font-black text-text-primary dark:text-white focus:ring-2 focus:ring-brand dark:focus:ring-brand-light transition-all outline-none"
                        >
                          <option value={0}>Sunday</option>
                          <option value={1}>Monday</option>
                          <option value={2}>Tuesday</option>
                          <option value={3}>Wednesday</option>
                          <option value={4}>Thursday</option>
                          <option value={5}>Friday</option>
                          <option value={6}>Saturday</option>
                        </select>
                      </div>
                    )}

                    {(settings.reminders.frequency || 'daily') === 'monthly' && (
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block">
                          Day of Month (1-31)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={settings.reminders.dayOfMonth ?? 1}
                          onChange={handleDayOfMonthChange}
                          /* PREV: focus:ring-yellow-warm */
                          className="w-full bg-bg-secondary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 rounded-xl p-3 font-black text-text-primary dark:text-white focus:ring-2 focus:ring-brand dark:focus:ring-brand-light transition-all outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Device Calendar Integration */}
                  <div className="bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-xl p-4 border border-border-soft dark:border-dark-border/30">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-black text-text-primary dark:text-white uppercase tracking-widest">
                          Device Calendar
                        </p>
                        <p className="text-xs text-text-primary/60 dark:text-white/60">
                          Add reminders to your device's calendar app
                        </p>
                      </div>
                      <button
                        onClick={handleCalendarToggle}
                        /* PREV: bg-yellow-warm */
                        className={`w-14 h-8 rounded-full transition-all relative ${
                          settings.reminders.useDeviceCalendar
                            ? 'bg-brand dark:bg-brand-light'
                            : 'bg-border-soft dark:bg-dark-bg-primary'
                        }`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                          settings.reminders.useDeviceCalendar ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Ntfy.sh Push Notifications */}
                  <div className="bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-xl p-4 border border-border-soft dark:border-dark-border/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-black text-text-primary dark:text-white uppercase tracking-widest">
                          Push Notifications (ntfy.sh)
                        </p>
                        <p className="text-xs text-text-primary/60 dark:text-white/60">
                          Secure push notifications to your device
                        </p>
                      </div>
                      <button
                        onClick={handleNtfyToggle}
                        /* PREV: bg-yellow-warm */
                        className={`w-14 h-8 rounded-full transition-all relative ${settings.reminders.useNtfyPush ? 'bg-brand dark:bg-brand-light' : 'bg-border-soft dark:bg-dark-bg-primary'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.reminders.useNtfyPush ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    
                    {settings.reminders.useNtfyPush && (
                      <div className="space-y-4 pt-3 border-t border-border-soft dark:border-dark-border/30">
                        {/* Topic Display */}
                        {/* PREV: border-yellow-warm/30 */}
                        <div className="bg-white dark:bg-dark-bg-primary rounded-xl p-4 border-2 border-brand/20 dark:border-brand/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs sm:text-sm font-black text-text-primary dark:text-white uppercase tracking-widest">
                              Your Subscription Topic
                            </p>
                            <button
                              onClick={handleResetTopic}
                              /* PREV: hover:bg-yellow-warm/20 */
                              className="px-2 py-1 bg-border-soft dark:bg-dark-bg-secondary text-text-primary dark:text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-brand/10 dark:hover:bg-brand/20 transition-all"
                              title="Generate new topic"
                            >
                              🔄 Reset
                            </button>
                          </div>
                          <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-3 border border-border-soft dark:border-dark-border/30">
                            {/* PREV: text-navy-primary dark:text-yellow-warm */}
                            <code className="text-sm font-black text-navy-primary dark:text-brand-light break-all">
                              {settings.reminders.ntfyTopic || 'Loading...'}
                            </code>
                          </div>
                          <p className="text-xs sm:text-sm text-text-secondary dark:text-white/70 leading-relaxed">
                            📱 <strong>Quick Setup:</strong> Open the ntfy app on your device and subscribe to this topic. That's it!
                          </p>
                        </div>

                        {/* Test Button */}
                        <button
                          onClick={handleTestNtfy}
                          disabled={testStatus === 'sending'}
                          /* PREV: bg-yellow-warm */
                          className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all shadow-md ${
                            testStatus === 'success' 
                              ? 'bg-calm-sage text-white' 
                              : testStatus === 'error'
                              ? 'bg-warm-coral text-white'
                              : testStatus === 'sending'
                              ? 'bg-border-soft dark:bg-dark-bg-tertiary text-text-primary dark:text-white opacity-50 cursor-not-allowed'
                              : 'bg-brand dark:bg-brand-light text-white dark:text-navy-dark hover:opacity-90'
                          }`}
                        >
                          {testStatus === 'sending' && '⏳ Sending...'}
                          {testStatus === 'success' && '✅ Sent! Check your device'}
                          {testStatus === 'error' && '❌ Failed. Check your topic'}
                          {testStatus === 'idle' && '🔔 Test Notification'}
                        </button>

                        {/* Advanced Options - Collapsible */}
                        <details className="group">
                          <summary className="cursor-pointer text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest hover:text-text-primary dark:hover:text-white transition-colors">
                            ⚙️ Advanced Options
                          </summary>
                          <div className="mt-3 space-y-3 pt-3 border-t border-border-soft dark:border-dark-border/30">
                            <div className="space-y-2">
                              <label className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block">
                                Custom Topic (Optional)
                              </label>
                              <input
                                type="text"
                                value={settings.reminders.ntfyTopic || ''}
                                onChange={handleNtfyTopicChange}
                                placeholder="grounded-abc123xyz"
                                /* PREV: focus:ring-yellow-warm */
                                className="w-full p-2 rounded-lg bg-white dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border/30 text-xs font-medium text-text-primary dark:text-white focus:ring-2 focus:ring-brand dark:focus:ring-brand-light transition-all outline-none"
                              />
                              <p className="text-xs text-text-primary/50 dark:text-white/50">
                                Use only letters, numbers, dashes, and underscores
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block">
                                Custom Server (Optional)
                              </label>
                              <input
                                type="text"
                                value={settings.reminders.ntfyServer || ''}
                                onChange={(e) => onUpdateSettings({
                                  ...settings,
                                  reminders: { ...settings.reminders, ntfyServer: e.target.value.trim() || undefined }
                                })}
                                placeholder="https://ntfy.sh (default)"
                                /* PREV: focus:ring-yellow-warm */
                                className="w-full p-2 rounded-lg bg-white dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border/30 text-xs font-medium text-text-primary dark:text-white focus:ring-2 focus:ring-brand dark:focus:ring-brand-light transition-all outline-none"
                              />
                              <p className="text-xs text-text-primary/50 dark:text-white/50">
                                Leave empty to use the free public server
                              </p>
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>

                  {/* Next Reminder Preview */}
                  {/* PREV: bg-yellow-warm/10 ... border-yellow-warm/30 */}
                  <div className="bg-brand/5 dark:bg-brand/10 rounded-xl p-4 border border-brand/20 dark:border-brand/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-black text-text-primary dark:text-white uppercase tracking-widest">
                        Next Reminder
                      </span>
                      {/* PREV: text-yellow-warm */}
                      <span className="text-sm font-black text-brand dark:text-brand-light animate-pulse">
                        {nextPulseInfo}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full space-y-3">
                    {notifPermission !== 'granted' ? (
                      <button 
                        onClick={requestPermission}
                        /* PREV: bg-yellow-warm/20 ... text-yellow-warm ... hover:bg-yellow-warm/30 */
                        className="w-full px-6 py-4 bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-brand/20 dark:hover:bg-brand/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Enable Browser Permissions
                      </button>
                    ) : (
                      <div className="px-6 py-4 bg-calm-sage/20 dark:bg-calm-sage/20 text-calm-sage dark:text-calm-sage rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Nudge Engine Active
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-text-tertiary dark:text-text-tertiary font-medium italic text-center">
                    Reminders trigger via system notifications while this tab is open. Keep the app open for notifications to work.
                  </p>
                </div>
              </details>
            )}

            {/* AI Model - Collapsible */}
            <details className="group border-t border-border-soft dark:border-dark-border pt-6">
              <summary className="cursor-pointer text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3 p-2 hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary rounded-lg transition-colors list-none flex items-center justify-between">
                <span>AI Model</span>
                <svg 
                  className="w-4 h-4 transition-transform group-open:rotate-180" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 space-y-4">
                <p className="text-xs text-text-secondary dark:text-text-secondary">
                  Update the on-device AI model for better guidance and encouragement. Models are downloaded and cached on your device for privacy.
                </p>
                
                {/* AI Diagnostics Component */}
                <AIDiagnostics />
                
                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary dark:text-white">
                    Select AI Model:
                  </label>
                  <select
                    value={selectedAIModel}
                    onChange={async (e) => {
                      const newModel = e.target.value as AIModelType;
                      setSelectedAIModel(newModel);
                      
                      // Update settings
                      if (onUpdateSettings && settings) {
                        onUpdateSettings({
                          ...settings,
                          aiModel: newModel
                        });
                      }
                      
                      // Reload models with new selection
                      setUpdatingModel(true);
                      try {
                        setSelectedModel(newModel);
                        const success = await initializeModels(true, newModel);
                        
                        setTimeout(() => {
                          const status = getModelStatus();
                          setModelStatus(status);
                        }, 1000);
                        
                        if (success) {
                          console.log(`✅ Switched to ${getAllModelConfigs()[newModel].name}`);
                        }
                      } catch (error) {
                        console.error('Model switch error:', error);
                      } finally {
                        setUpdatingModel(false);
                      }
                    }}
                    disabled={updatingModel || modelStatus?.loading}
                    className="w-full px-4 py-3 rounded-xl text-xs font-medium bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-navy-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {Object.entries(getAllModelConfigs()).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.name} - {config.description} ({config.size})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs sm:text-sm text-text-tertiary dark:text-text-tertiary">
                    {getAllModelConfigs()[selectedAIModel].description}. Models are cached in your browser for instant loading.
                  </p>
                </div>
                
                {/* Model Status Display */}
                {modelStatus && (
                  <div className="p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-border-soft dark:border-dark-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary dark:text-text-secondary">Model Status:</span>
                      <span className={`font-semibold ${modelStatus.loaded ? 'text-green-600 dark:text-green-400' : modelStatus.loading ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                        {modelStatus.loaded ? '✓ Loaded' : modelStatus.loading ? '⏳ Loading...' : '✗ Not Available'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-text-tertiary dark:text-text-tertiary">Mood Tracker:</span>
                        <span className={modelStatus.moodTracker ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {modelStatus.moodTracker ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-tertiary dark:text-text-tertiary">Counseling Coach:</span>
                        <span className={modelStatus.counselingCoach ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {modelStatus.counselingCoach ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                    {!modelStatus.loaded && !modelStatus.loading && (
                      <p className="text-xs sm:text-sm text-text-tertiary dark:text-text-tertiary mt-2">
                        {modelStatus.errorCategory === 'network' 
                          ? 'AI models unavailable: Check your internet connection. The app will use rule-based responses until models can be downloaded.'
                          : modelStatus.errorCategory === 'memory'
                          ? 'AI models unavailable: Insufficient device memory. The app will use rule-based responses. All features remain fully functional.'
                          : modelStatus.errorCategory === 'wasm'
                          ? 'AI models unavailable: WebAssembly not supported. Please use a modern browser. The app will use rule-based responses.'
                          : 'AI models are loading or unavailable. The app will use rule-based responses. All features remain fully functional.'}
                      </p>
                    )}
                  </div>
                )}
                
                <button
                  onClick={async () => {
                    if (confirm('This will clear and re-download the AI model. This may take a few minutes and requires internet connection. Continue?')) {
                      setUpdatingModel(true);
                      try {
                        const { initializeModels } = await import('../services/aiService');
                        const success = await initializeModels(true); // Force reload
                        
                        // Update status after loading
                        setTimeout(() => {
                          const status = getModelStatus();
                          setModelStatus(status);
                        }, 1000);
                        
                        if (success) {
                          alert('✅ Model update complete! The new model has been downloaded and cached on your device. AI features are now available.');
                        } else {
                          const status = getModelStatus();
                          let message = 'Model update failed. The app will continue using rule-based responses.';
                          if (!status.moodTracker && !status.counselingCoach) {
                            message += '\n\nThis is likely a browser compatibility issue with ONNX Runtime. The app is fully functional with rule-based responses.';
                          } else if (!status.moodTracker || !status.counselingCoach) {
                            message += `\n\nPartial loading: ${status.moodTracker ? 'Mood tracker ✓' : 'Mood tracker ✗'}, ${status.counselingCoach ? 'Counseling coach ✓' : 'Counseling coach ✗'}`;
                          }
                          alert(message);
                        }
                      } catch (error: unknown) {
                        console.error('Model update error:', error);
                        const errorMsg = error?.message || String(error);
                        let message = 'Error updating model. ';
                        if (errorMsg.includes('registerBackend') || errorMsg.includes('ort-web')) {
                          message += 'This appears to be a browser compatibility issue with ONNX Runtime. The app will continue using rule-based responses, which are fully functional.';
                        } else {
                          message += 'Please check your internet connection and try again.';
                        }
                        alert(message);
                      } finally {
                        setUpdatingModel(false);
                      }
                    }
                  }}
                  disabled={updatingModel || modelStatus?.loading}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border ${
                    updatingModel || modelStatus?.loading
                      ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                      : 'bg-navy-primary text-white dark:text-white hover:opacity-90 border-navy-primary'
                  }`}
                >
                  {updatingModel ? '⏳ Updating...' : modelStatus?.loading ? '⏳ Loading...' : 'Update AI Model'}
                </button>
                <p className="text-xs sm:text-sm text-text-tertiary dark:text-text-tertiary text-center">
                  Recommended: DistilBERT (faster, specialized for emotion analysis)
                </p>
                {!modelStatus?.loaded && !modelStatus?.loading && (
                  <p className="text-xs sm:text-sm text-text-tertiary dark:text-text-tertiary text-center italic">
                    Note: If models fail to load, this is typically a browser compatibility issue. The app remains fully functional with rule-based responses.
                  </p>
                )}
              </div>
            </details>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-4 bg-navy-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 shadow-sm"
            >
              Save Configuration
            </button>
          </div>

          <div className="pt-4 border-t border-border-soft dark:border-dark-border">
            <p className="text-xs text-text-tertiary dark:text-text-tertiary text-center">
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

