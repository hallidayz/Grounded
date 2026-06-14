import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COPY, getConversationNode } from './copy';
import { continueConversation, generateWelcomeMessage } from './services/aiService';
import { 
  hasAgreedToTerms, 
  agreeToTerms, 
  clearAllData,
  TERMS_OF_SERVICE,
  PRIVACY_POLICY,
  TERMS_VERSION
} from './services/settings';
import { chatDB, type ChatSession } from './services/chatDB';
import {
  getSelections,
  toggleSelection,
  initAiSync,
} from './services/valuesService';
import { VALUES_CATALOG, VALUES_CATEGORY_ORDER } from './data/valuesCatalog';
import type { EnergyLevel, ConversationState, AppView } from './types';
import EnergyCheckIn from './components/EnergyCheckIn';
import SessionEngine from './components/SessionEngine';
import { MASTER_SESSIONS } from './copy';

// Helper function to map energy levels to session keys
function getSessionKeyFromEnergy(energy: EnergyLevel | null): string | null {
  if (!energy) return null;
  
  // Map existing energy selections to session keys
  if (energy === '10s-reset') return '10s-reset';
  if (energy === '10s-anchor') return '10s-anchor';
  if (energy === '10s-hum') return '10s-hum';
  if (energy === '2min') return '2min-grounding'; // Default to grounding
  if (energy === '5min') return '5min-rain'; // Default to RAIN method
  
  // Check if it's already a valid session key
  if (MASTER_SESSIONS[energy]) return energy;
  
  return null;
}

// BreathingExercise has been replaced by SessionEngine
// The entire function was removed in favor of unified SessionEngine component

export default function App() {
  const [view, setView] = useState<AppView>('loading');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [moments, setMoments] = useState(0);
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [pendingUserInput, setPendingUserInput] = useState<string>('');
  const [inputRows, setInputRows] = useState(1);
  const [isWebGPUSupported, setIsWebGPUSupported] = useState(true);
  const [selectedTenSecondBreaker, setSelectedTenSecondBreaker] = useState<EnergyLevel>('10s-reset');
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [datesWithSessions, setDatesWithSessions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // ============================================
  // TESTING ONLY: Device Selector State
  // TODO: Remove this section before production
  // ============================================
  // ============================================
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [valuesVersion, setValuesVersion] = useState(0);

  useEffect(() => {
    initAiSync();
  }, []);

  useEffect(() => {
    const checkWebGPU = async () => {
      const gpu = (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
      if (!gpu) {
        setIsWebGPUSupported(false);
        return;
      }
      try {
        const adapter = await gpu.requestAdapter();
        if (!adapter) {
          setIsWebGPUSupported(false);
        }
      } catch {
        setIsWebGPUSupported(false);
      }
    };
    checkWebGPU();
    
    // Initialize database and verify it's working
    const initDB = async () => {
      try {
        // Test database by trying to get session count
        const count = await chatDB.getSessionCount();
        console.log('[App] Database initialized. Existing sessions:', count);
      } catch (error) {
        console.error('[App] Database initialization error:', error);
      }
    };
    initDB();
  }, []);

  useEffect(() => {
    const savedMoments = localStorage.getItem('grounded_moments');
    if (savedMoments) {
      try {
        const parsed = JSON.parse(savedMoments);
        setMoments(Array.isArray(parsed) ? parsed.length : 0);
      } catch { setMoments(0); }
    }
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    setHasAcceptedTerms(hasAgreedToTerms());
  }, []);

  useEffect(() => {
    async function initAI() {
      try {
        const msg = await generateWelcomeMessage();
        setAiMessage(msg);
        setView(hasAcceptedTerms ? 'welcome' : 'terms');
      } catch {
        setAiMessage(COPY.welcome.subtitle);
        setView(hasAcceptedTerms ? 'welcome' : 'terms');
      }
    }
    initAI();
  }, [hasAcceptedTerms]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Auto-save conversation when it has messages (debounced)
  useEffect(() => {
    if (conversationHistory.length >= 2 && view === 'conversation' && conversationState) {
      // Debounce auto-save to avoid too frequent saves
      const saveTimer = setTimeout(async () => {
        try {
          const sessionId = await chatDB.saveSession(conversationHistory, selectedEnergy || undefined);
          console.log('[App] Auto-saved session:', sessionId);
          // Reload sessions list if on sessions view
          if ((view as string) === 'sessions') {
            await loadSavedSessions();
          }
        } catch (err) {
          console.error('[App] Auto-save failed:', err);
        }
      }, 2000); // Save 2 seconds after last message
      
      return () => clearTimeout(saveTimer);
    }
  }, [conversationHistory.length, view, conversationState, selectedEnergy]); // Use length to avoid re-saving on content changes


  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAcceptTerms = () => {
    agreeToTerms();
    setHasAcceptedTerms(true);
    setView('welcome');
  };

  const handleEnergySelect = (energy: string) => {
    if (energy === '10s') {
      setSelectedEnergy(selectedTenSecondBreaker);
    } else {
      setSelectedEnergy(energy as EnergyLevel);
    }
    setPendingUserInput('');
    setBreathingPhase('inhale');
    setBreathingCycle(0);
    setView('breathing');
  };

  const handleWelcomeInput = async () => {
    if (!pendingUserInput.trim()) return;
    setConversationHistory([{ role: 'user', content: pendingUserInput }]);
    setAiLoading(true);
    setView('conversation');
    
    const energy: EnergyLevel = 'custom';
    setSelectedEnergy(energy);
    setConversationState({ node: 'welcome', energy, depth: 0 });
    
    try {
      const result = await continueConversation(
        { node: 'welcome', energy, depth: 0 },
        pendingUserInput
      );
      setAiMessage(result.message);
      setConversationState(result.state);
      setTimeout(() => {
        setConversationHistory(prev => [...prev, { role: 'assistant', content: result.message }]);
      }, 300);
    } catch {
      setConversationHistory(prev => [...prev, { role: 'assistant', content: "I'm still here. Take your time." }]);
    }
    setAiLoading(false);
  };

  const handleBreathingComplete = async () => {
    setConversationState({ node: 'welcome', energy: selectedEnergy!, depth: 0 });
    
    if (pendingUserInput.trim()) {
      setConversationHistory([{ role: 'user', content: pendingUserInput }]);
      setAiLoading(true);
      setView('conversation');
      
      try {
        const result = await continueConversation(
          { node: 'welcome', energy: selectedEnergy!, depth: 0 },
          pendingUserInput
        );
        setAiMessage(result.message);
        setConversationState(result.state);
        setTimeout(() => {
          setConversationHistory(prev => [...prev, { role: 'assistant', content: result.message }]);
        }, 300);
      } catch {
        setConversationHistory(prev => [...prev, { role: 'assistant', content: "I'm still here. Take your time." }]);
      }
      setAiLoading(false);
    } else {
      setView('welcome');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleSendMessage = async (quickReply?: string) => {
    if (!conversationState) return;
    const input = quickReply || userInput.trim();
    if (!input && !quickReply) return;
    setUserInput('');
    setAiLoading(true);
    const userMessage = input;
    setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    try {
      const result = await continueConversation(conversationState, userMessage, quickReply);
      setAiMessage(result.message);
      setConversationState(result.state);
      setTimeout(() => {
        setConversationHistory(prev => [...prev, { role: 'assistant', content: result.message }]);
      }, 300);
    } catch {
      setConversationHistory(prev => [...prev, { role: 'assistant', content: "I'm still here. Take your time." }]);
    }
    setAiLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleComplete = () => {
    const updated = moments + 1;
    setMoments(updated);
    localStorage.setItem('grounded_moments', JSON.stringify(new Array(updated).fill({})));
    setView('complete');
  };

  const handleNewSession = () => {
    setConversationHistory([]);
    setUserInput('');
    setAiMessage('');
    setConversationState(null);
    setSelectedEnergy(null);
    setView('welcome');
    generateWelcomeMessage().then(msg => setAiMessage(msg));
  };

  const handleClearData = () => {
    if (confirm('Delete all history? This cannot be undone.')) {
      clearAllData();
      setMoments(0);
      alert('All data cleared.');
    }
  };

  const handleSaveSession = async () => {
    if (conversationHistory.length === 0) {
      alert('No messages to save.');
      return;
    }
    try {
      const sessionId = await chatDB.saveSession(
        conversationHistory,
        selectedEnergy || undefined
      );
      console.log('[App] Session saved with ID:', sessionId);
      // Reload sessions list if we're on the sessions view
      if (view === 'sessions') {
        await loadSavedSessions();
      }
      // Reload sessions list to show the new session
      await loadSavedSessions();
      alert('Chat saved locally.');
    } catch (error) {
      console.error('[App] Error saving session:', error);
      alert(`Failed to save chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleShareSession = async () => {
    if (conversationHistory.length === 0) {
      alert('No messages to share.');
      return;
    }
    try {
      await chatDB.shareSession(conversationState?.energy || 'custom');
    } catch (error: any) {
      if (error.message === 'Copied to clipboard') {
        alert('Chat copied to clipboard.');
      } else {
        alert('Failed to share chat.');
      }
    }
  };

  useEffect(() => {
    if (selectedDate) {
      chatDB.getSessionsByDate(selectedDate).then(setSavedSessions);
    }
  }, [selectedDate]);

  const loadSavedSessions = async () => {
    const dates = await chatDB.getDatesWithSessions();
    setDatesWithSessions(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  };

  const handleViewSessions = async () => {
    await loadSavedSessions();
    if (selectedDate) {
      await chatDB.getSessionsByDate(selectedDate).then(setSavedSessions);
    }
    setView('sessions');
  };

  const renderHelp = () => (
    <div className="app-stage" style={styles.helpContainer}>
      <div style={styles.settingsHeader}>
        <h2 style={styles.title}>How to Use Grounded</h2>
      </div>
      
      <div style={styles.helpSection}>
        <div style={styles.helpItem}>
          <div style={styles.helpIcon}>🧘</div>
          <div style={styles.helpContent}>
            <h3 style={styles.helpTitle}>1. Choose Your Energy</h3>
            <p style={styles.helpText}>
              Select how you're feeling: Heavy, Neutral, or Light. Each option 
              provides a different breathing exercise tailored to your current state.
            </p>
          </div>
        </div>

        <div style={styles.helpItem}>
          <div style={styles.helpIcon}>💨</div>
          <div style={styles.helpContent}>
            <h3 style={styles.helpTitle}>2. Follow the Exercise</h3>
            <p style={styles.helpText}>
              A calming animation will guide you through breathing. 
              Follow along at your own pace. This helps ground you before our chat.
            </p>
          </div>
        </div>

        <div style={styles.helpItem}>
          <div style={styles.helpIcon}>💬</div>
          <div style={styles.helpContent}>
            <h3 style={styles.helpTitle}>3. Chat Through It</h3>
            <p style={styles.helpText}>
              Share what's on your mind. Our AI listens without judgment 
              and helps you work through difficult emotions privately.
            </p>
          </div>
        </div>

        <div style={styles.helpItem}>
          <div style={styles.helpIcon}>💾</div>
          <div style={styles.helpContent}>
            <h3 style={styles.helpTitle}>4. Save or Share</h3>
            <p style={styles.helpText}>
              Save your chat for later reference, or share it with someone 
              you trust. All data stays on your device—nothing is sent to servers.
            </p>
          </div>
        </div>

        <div style={styles.helpItem}>
          <div style={styles.helpIcon}>🌙</div>
          <div style={styles.helpContent}>
            <h3 style={styles.helpTitle}>5. Dark Mode</h3>
            <p style={styles.helpText}>
              Tap the sun/moon icon to switch themes. Perfect for 
              nighttime use when you need extra calm.
            </p>
          </div>
        </div>

        <div style={styles.helpItem}>
          <div style={styles.helpIcon}>🚨</div>
          <div style={styles.helpContent}>
            <h3 style={styles.helpTitle}>Crisis Resources</h3>
            <p style={styles.helpText}>
              If you're in crisis, the Crisis tab provides immediate 
              access to hotlines and support resources.
            </p>
          </div>
        </div>
      </div>

      <div style={styles.helpFooter}>
        <p style={styles.helpFooterText}>
          💡 Grounded runs entirely on your device. Your conversations 
          are never seen by anyone else.
        </p>
      </div>
    </div>
  );

  const renderSessions = () => {
    const sessionsForDate = savedSessions.filter(s => s.dateString === selectedDate);

    return (
      <div style={styles.container}>
        <div style={styles.settingsHeader}>
          <button style={styles.backButton} onClick={() => setView('welcome')}>
            ← Back
          </button>
          <h2 style={styles.title}>Chat History</h2>
        </div>
        
        {datesWithSessions.length === 0 ? (
          <p style={styles.subtitle}>No saved chats yet.</p>
        ) : (
          <>
            <div style={styles.dateSelector}>
              {datesWithSessions.map(date => (
                <button
                  key={date}
                  style={{
                    ...styles.dateButton,
                    ...(date === selectedDate ? styles.dateButtonActive : {})
                  }}
                  onClick={() => setSelectedDate(date)}
                >
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </button>
              ))}
            </div>
            
            <div style={styles.sessionsList}>
              {sessionsForDate.map(session => (
                <div key={session.id} style={styles.sessionCard}>
                  <div style={styles.sessionHeader}>
                    <span style={styles.sessionTime}>{session.timeString}</span>
                    <span style={styles.sessionTitle}>{session.title}</span>
                  </div>
                  <p style={styles.sessionPreview}>
                    {session.messages[session.messages.length - 1]?.content.slice(0, 60)}...
                  </p>
                  <div style={styles.sessionActions}>
                    <button 
                      style={styles.sessionAction}
                      onClick={() => {
                        setConversationHistory(session.messages.map(m => ({role: m.role, content: m.content})));
                        setView('conversation');
                      }}
                    >
                      Continue
                    </button>
                    <button 
                      style={styles.sessionAction}
                      onClick={() => {
                        if (confirm('Delete this chat?')) {
                          chatDB.deleteSession(session.id).then(loadSavedSessions);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const [headerHover, setHeaderHover] = useState<'theme' | 'settings' | null>(null);

  const renderHeader = () => {
    if (view === 'loading' || view === 'terms') return null;
    return (
      <header style={styles.appHeader}>
        <div style={styles.headerLeft}>
          <img src="/ac-minds-logo.png" alt="AC Minds" style={styles.headerLogo} />
          <div style={styles.headerTitleContainer}>
            <h1 style={styles.headerTitle}>Grounded</h1>
            <p style={styles.headerTagline}>Small moments, big difference</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button 
            style={{
              ...styles.headerIconButton,
              ...(headerHover === 'theme' ? styles.headerIconButtonHover : {}),
            }}
            onClick={toggleTheme} 
            onMouseEnter={() => setHeaderHover('theme')}
            onMouseLeave={() => setHeaderHover(null)}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span style={styles.headerIcon}>{isDarkMode ? '☀️' : '🌙'}</span>
          </button>
          <button 
            style={{
              ...styles.headerIconButton,
              ...(headerHover === 'settings' ? styles.headerIconButtonHover : {}),
            }}
            onClick={() => setView('settings')}
            onMouseEnter={() => setHeaderHover('settings')}
            onMouseLeave={() => setHeaderHover(null)}
            aria-label="Settings"
          >
            <span style={styles.headerIcon}>⚙️</span>
          </button>
        </div>
      </header>
    );
  };

  const renderBottomNav = () => {
    if (view === 'loading' || view === 'terms') return null;
    const navItems = [
      { view: 'welcome', icon: '🏠', label: 'Home' },
      { view: 'help', icon: '❓', label: 'Help' },
      { view: 'sessions', icon: '📚', label: 'History' },
      { view: 'crisis-resources', icon: '🚨', label: 'Crisis' },
    ];
    return (
      <nav style={styles.bottomNav}>
        {navItems.map(item => (
          <button
            key={item.view}
            style={{
              ...styles.bottomNavItem, 
              ...(view === item.view ? styles.bottomNavActive : {}),
              ...(hoveredNav === item.view ? styles.bottomNavItemHover : {}),
            }}
            onClick={() => setView(item.view as AppView)}
            onMouseEnter={() => setHoveredNav(item.view)}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <span style={styles.bottomNavIcon}>{item.icon}</span>
            <span style={styles.bottomNavLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    );
  };

  const renderFooterInput = () => {
    // Only show footer input on welcome and conversation views
    if (view !== 'welcome' && view !== 'conversation') return null;
    
    if (view === 'conversation') {
      return (
        <div style={styles.footerInputContainer}>
          <input
            type="text"
            style={styles.footerInput}
            placeholder="Type your response..."
            value={userInput}
            onChange={(e: any) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={aiLoading}
          />
          <button 
            style={styles.footerSendButton} 
            onClick={() => handleSendMessage()} 
            disabled={aiLoading || !userInput.trim()}
          >
            →
          </button>
        </div>
      );
    }
    
    // Welcome view footer input
    return (
      <div style={styles.footerInputContainer}>
        <textarea
          ref={textareaRef}
          style={styles.footerTextarea}
          placeholder="Share your thoughts..."
          value={pendingUserInput}
          rows={inputRows}
          onChange={(e: any) => {
            const value = e.target.value;
            setPendingUserInput(value);
            const lines = value.split('\n').length;
            setInputRows(Math.min(Math.max(lines, 1), 4));
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (pendingUserInput.trim()) {
                handleWelcomeInput();
              }
            }
          }}
        />
        <button 
          style={{...styles.footerSendButton, opacity: pendingUserInput.trim() ? 1 : 0.5}} 
          onClick={handleWelcomeInput}
          disabled={!pendingUserInput.trim()}
          aria-label="Submit what's on your mind"
        >
          →
        </button>
      </div>
    );
  };

  const renderThemeToggle = () => null;

  const renderLoading = () => (
    <div style={styles.container}>
      <div style={styles.loadingContent}>
        <div style={styles.loadingSpinner} />
        <h2 style={styles.title}>Preparing your space</h2>
        <p style={styles.subtitle}>Downloading AI model...</p>
        <p style={styles.loadingNote}>First time only. Future visits faster.</p>
      </div>
    </div>
  );

  const renderUnsupportedBrowser = () => (
    <div style={styles.container}>
      <div style={styles.settingsHeader}>
        <h2 style={styles.title}>Browser Not Supported</h2>
      </div>
      <div style={styles.unsupportedContent}>
        <p style={styles.unsupportedText}>
          Grounded uses WebGPU for privacy-first, offline AI conversations. Safari doesn't support WebGPU yet.
        </p>
        <div style={styles.browserOptions}>
          <h3 style={styles.browserOptionsTitle}>Try one of these:</h3>
          <a href="https://www.google.com/chrome/" style={styles.browserButton} target="_blank" rel="noopener">
            Chrome
          </a>
          <a href="https://www.microsoft.com/edge" style={styles.browserButton} target="_blank" rel="noopener">
            Edge
          </a>
          <a href="https://www.mozilla.org/firefox/" style={styles.browserButton} target="_blank" rel="noopener">
            Firefox (may work)
          </a>
        </div>
        <p style={styles.unsupportedNote}>
          Or come back on a desktop browser with Chrome or Edge.
        </p>
      </div>
    </div>
  );

  const renderTerms = () => (
    <div style={styles.termsContainer}>
      <div style={styles.termsHeader}>
        <button style={styles.backButton} onClick={() => { setShowFullTerms(false); if (hasAcceptedTerms) setView('welcome'); }}>
          ← Back
        </button>
        <h2 style={styles.title}>Terms & Privacy</h2>
      </div>
      <div style={styles.termsScroll}>
        {!showFullTerms ? (
          <div style={styles.termsSummary}>
            <button style={styles.termsCard} onClick={() => setShowFullTerms(true)}>
              <h3 style={styles.termsCardTitle}>🔒 Your Privacy</h3>
              <p style={styles.termsCardText}>AI runs locally. No data leaves your device.</p>
            </button>
            <button style={styles.termsCard} onClick={() => setShowFullTerms(true)}>
              <h3 style={styles.termsCardTitle}>🧠 AI Support</h3>
              <p style={styles.termsCardText}>TinyLlama runs on your device for privacy.</p>
            </button>
            <button style={styles.termsCard} onClick={() => setShowFullTerms(true)}>
              <h3 style={styles.termsCardTitle}>🚨 Emergency</h3>
              <p style={styles.termsCardText}>Call 988 for immediate help.</p>
            </button>
          </div>
        ) : (
          <div style={styles.termsFull}>
            <h3 style={styles.termsSectionTitle}>Terms of Service</h3>
            <pre style={styles.termsPre}>{TERMS_OF_SERVICE}</pre>
            <h3 style={styles.termsSectionTitle}>Privacy Policy</h3>
            <pre style={styles.termsPre}>{PRIVACY_POLICY}</pre>
          </div>
        )}
      </div>
      {!showFullTerms && (
        <button style={styles.primaryButton} onClick={handleAcceptTerms}>
          I Agree — Continue
        </button>
      )}
    </div>
  );

  const renderSettings = () => (
    <div style={styles.container}>
      <div style={styles.settingsHeader}>
        <button style={styles.backButton} onClick={() => setView('welcome')}>
          ← Back
        </button>
        <h2 style={styles.title}>Settings</h2>
      </div>
      <button style={styles.settingsItem} onClick={() => setView('terms')}>
        <span style={styles.settingsIcon}>📋</span>
        <span style={styles.settingsText}>Terms & Privacy</span>
      </button>
      <button style={styles.settingsItem} onClick={() => setView('values')}>
        <span style={styles.settingsIcon}>💎</span>
        <span style={styles.settingsText}>Your Values</span>
      </button>
      <div style={styles.settingsInfo}>
        <p style={styles.settingsVersion}>Version {TERMS_VERSION}</p>
        <p style={styles.settingsInfoText}>All data stored locally</p>
      </div>
      <button style={{...styles.settingsItem, ...styles.dangerItem}} onClick={handleClearData}>
        <span style={styles.settingsIcon}>🗑️</span>
        <span style={styles.settingsText}>Clear All Data</span>
      </button>
    </div>
  );

  const renderValues = () => {
    const { selections } = getSelections();
    const selectedSet = new Set(selections.map((s) => s.value));

    const handleToggle = (category: string, value: string) => {
      toggleSelection(category, value);
      setValuesVersion((v) => v + 1);
    };

    return (
      <div style={styles.container}>
        <div style={styles.settingsHeader}>
          <button style={styles.backButton} onClick={() => setView('welcome')}>
            ← Back
          </button>
          <h2 style={styles.title}>Your Values</h2>
        </div>
        <p style={styles.valuesIntro}>What matters most to you? Tap to select or deselect.</p>
        {selections.length > 0 && (
          <div style={styles.valuesSummary}>
            <h3 style={styles.valuesSummaryTitle}>Your selections ({selections.length})</h3>
            <p style={styles.valuesSummaryList}>
              {selections.map((s) => s.value).join(', ')}
            </p>
          </div>
        )}
        <div style={styles.valuesByCategory}>
          {VALUES_CATEGORY_ORDER.map((category) => {
            const values = VALUES_CATALOG[category];
            if (!values || typeof values !== 'object') return null;
            return (
              <div key={category} style={styles.valuesCategoryBlock}>
                <h3 style={styles.valuesCategoryTitle}>{category}</h3>
                <div style={styles.valuesCardList}>
                  {Object.entries(values).map(([valueName, description]) => {
                    const isSelected = selectedSet.has(valueName);
                    return (
                      <button
                        key={valueName}
                        type="button"
                        style={{
                          ...styles.valueCardWithDesc,
                          ...(isSelected ? styles.valueCardSelected : {}),
                        }}
                        onClick={() => handleToggle(category, valueName)}
                        aria-pressed={isSelected}
                        aria-label={`${valueName}: ${isSelected ? 'selected' : 'not selected'}`}
                      >
                        <span style={styles.valueCardName}>
                          {isSelected ? '✓ ' : ''}{valueName}
                        </span>
                        <span style={styles.valueCardDesc}>{description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCrisisResources = () => (
    <div style={styles.container}>
      <div style={styles.settingsHeader}>
        <button style={styles.backButton} onClick={() => setView('welcome')}>
          ← Back
        </button>
        <h2 style={styles.title}>Crisis Resources</h2>
      </div>
      <div style={styles.crisisUrgent}>
        <h3 style={styles.crisisUrgentTitle}>🚨 In Immediate Danger</h3>
        <p style={styles.crisisUrgentText}>Call 911 or go to nearest emergency room.</p>
      </div>
      <h3 style={styles.crisisSectionTitle}>📞 Crisis Hotlines</h3>
      {[
        { name: '988 Suicide & Crisis Lifeline', desc: 'Call or text 988 (US)', phone: 'tel:988' },
        { name: 'Crisis Text Line', desc: 'Text HOME to 741741', phone: 'sms:741741&body=HOME' },
        { name: 'The Trevor Project', desc: 'LGBTQ+ support', phone: 'tel:1-866-488-7386' },
        { name: 'Veterans Crisis Line', desc: 'Call 988, press 1', phone: 'tel:988' },
      ].map(item => (
        <div key={item.name} style={styles.crisisCard}>
          <div style={styles.crisisCardInfo}>
            <strong style={styles.crisisCardName}>{item.name}</strong>
            <span style={styles.crisisCardDesc}>{item.desc}</span>
          </div>
          <a href={item.phone} style={styles.crisisCallButton}>Call</a>
        </div>
      ))}
      <h3 style={styles.crisisSectionTitle}>🌍 International</h3>
      <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener" style={styles.crisisLink}>IASP Crisis Centres →</a>
      <a href="https://befrienders.org/" target="_blank" rel="noopener" style={styles.crisisLink}>Befrienders Worldwide →</a>
    </div>
  );

  const renderWelcome = () => (
    <div style={styles.welcomeContainer}>
      <div style={styles.welcomeLogoSection}>
        <img src="/ac-minds-logo.png" alt="AC Minds" style={styles.logoImage} />
        <h1 style={styles.welcomeTitle}>Grounded</h1>
      </div>
      
      <EnergyCheckIn
        onComplete={() => {
          // Return to welcome view (already there, but could reset state if needed)
        }}
        onReturnHome={() => {
          // Already on home/welcome view
        }}
      />

      {moments > 0 && <p style={styles.momentsCount}>{moments} moments</p>}
    </div>
  );

  const renderBreathing = () => {
    const sessionKey = getSessionKeyFromEnergy(selectedEnergy);
    if (!sessionKey) {
      return (
        <div style={styles.breathingWrapper}>
          <p>Please select an exercise to begin.</p>
        </div>
      );
    }
    return (
      <div style={styles.breathingWrapper}>
        <SessionEngine sessionKey={sessionKey} onComplete={handleBreathingComplete} />
      </div>
    );
  };

  const renderConversation = () => {
    const nodeData = conversationState ? getConversationNode(conversationState.node) : null;
    const quickReplies = nodeData && 'quickReplies' in nodeData ? nodeData.quickReplies : undefined;
    return (
      <div style={styles.conversationContainer}>
        <div style={styles.conversationHeader}>
          <button style={styles.backButton} onClick={() => {
            setPendingUserInput('');
            setView('welcome');
          }}>
            ← Back
          </button>
          <button style={styles.newChatButton} onClick={handleNewSession}>
            + New Chat
          </button>
        </div>
        <div style={styles.conversationHeading}>
          This is your safe and private space to chat through it.
        </div>
        <div style={styles.chatActions}>
          <button style={styles.chatActionButton} onClick={handleSaveSession}>
            💾 Save
          </button>
          <button style={styles.chatActionButton} onClick={handleShareSession}>
            📤 Share
          </button>
          <button style={styles.chatActionButton} onClick={() => setView('sessions')}>
            📚 History
          </button>
        </div>
        <div style={styles.messagesContainer}>
          {conversationHistory.map((msg, index) => (
            <div key={index} style={{...styles.messageBubble, ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage)}}>
              {msg.content}
            </div>
          ))}
          {aiLoading && (
            <div style={styles.typingIndicator}>
              <span>● ● ●</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {quickReplies && quickReplies.length > 0 && (
          <div style={styles.quickReplies}>
            {quickReplies.map(reply => (
              <button key={reply} style={styles.quickReplyButton} onClick={() => handleSendMessage(reply)} disabled={aiLoading}>
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderComplete = () => (
    <div style={styles.container}>
      <h2 style={styles.title}>Thank you</h2>
      <p style={styles.subtitle}>{COPY.completion.subtitle}</p>
      <button style={styles.primaryButton} onClick={handleNewSession}>
        New session
      </button>
    </div>
  );

    return (
      <div style={styles.app}>
        {renderHeader()}
        {!isWebGPUSupported && renderUnsupportedBrowser()}
        {view === 'loading' && renderLoading()}
        {view === 'terms' && renderTerms()}
        {view === 'settings' && renderSettings()}
        {view === 'values' && renderValues()}
        {view === 'welcome' && renderWelcome()}
        {view === 'breathing' && renderBreathing()}
        {view === 'conversation' && renderConversation()}
        {view === 'crisis-resources' && renderCrisisResources()}
        {view === 'help' && renderHelp()}
        {view === 'sessions' && renderSessions()}
        {view === 'complete' && renderComplete()}
        {renderFooterInput()}
        {renderBottomNav()}
        {renderThemeToggle()}
      </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
  appHeader: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderBottom: '1px solid var(--border, rgba(0,0,0,0.1))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  headerTitleContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.1rem',
  },
  headerTagline: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary, #666)',
    margin: 0,
    fontStyle: 'italic',
    lineHeight: '1.2',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerLogo: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'contain',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary, #1b3448)',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerIconButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'background-color 0.2s ease',
  },
  headerIconButtonHover: {
    backgroundColor: 'var(--bg-secondary, #f8f7f4)',
  },
  headerIcon: {
    fontSize: '20px',
  },
  footerInputContainer: {
    position: 'fixed' as const,
    bottom: `calc(80px + env(safe-area-inset-bottom))`, // Above navigation (60px nav + 20px spacing)
    left: 0,
    right: 0,
    padding: '12px 16px',
    paddingBottom: `calc(12px + env(safe-area-inset-bottom))`,
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderTop: '1px solid var(--border, rgba(0,0,0,0.1))',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    zIndex: 999,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
  },
  footerInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid var(--border-color, #e0e0e0)',
    borderRadius: '24px',
    outline: 'none',
    backgroundColor: 'var(--bg-secondary, #f8f7f4)',
    color: 'var(--text-primary, #1a1a1a)',
    fontFamily: 'inherit',
    maxHeight: '120px',
  },
  footerTextarea: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid var(--border-color, #e0e0e0)',
    borderRadius: '24px',
    outline: 'none',
    backgroundColor: 'var(--bg-secondary, #f8f7f4)',
    color: 'var(--text-primary, #1a1a1a)',
    fontFamily: 'inherit',
    resize: 'none' as const,
    minHeight: '48px',
    maxHeight: '120px',
    lineHeight: '1.5',
  },
  footerSendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color, #02295b)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    flexShrink: 0,
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  },
  app: {
    minHeight: '100svh',
    width: '100%',
    maxWidth: '100vw',
    backgroundColor: 'var(--bg-primary, #fafaf9)',
    color: 'var(--text-primary, #1b3448)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    paddingTop: '60px',
    paddingBottom: '160px', // Space for bottom nav (80px) + footer input (80px)
    overflowX: 'hidden',
    boxSizing: 'border-box' as const,
  },
  container: {
    flex: 1,
    padding: '20px',
    paddingBottom: '100px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  helpContainer: {
    width: '100%',
    maxWidth: '100%',
    minHeight: 'calc(100svh - 60px)', // Account for header
    maxHeight: 'calc(100svh - 60px)', // Fit within viewport
    paddingTop: 'calc(60px + env(safe-area-inset-top))', // Header height + safe area
    paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', // Navigation + safe area
    paddingLeft: 'max(20px, env(safe-area-inset-left))',
    paddingRight: 'max(20px, env(safe-area-inset-right))',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  loadingContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '60vh',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '3px solid var(--border, #e5e3df)',
    borderTopColor: '#2c5282',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '24px',
  },
  title: {
    fontSize: 'clamp(20px, 4vw, 28px)', // Responsive title
    fontWeight: '700',
    marginBottom: 'clamp(8px, 2vw, 12px)', // Responsive margin
    textAlign: 'center',
    color: 'var(--text-primary, #1b3448)',
  },
  subtitle: {
    fontSize: '16px',
    opacity: 0.7,
    textAlign: 'center',
  },
   loadingNote: {
    fontSize: '12px',
    opacity: 0.5,
    marginTop: '16px',
  },
  unsupportedContent: {
    padding: '20px',
    textAlign: 'center',
  },
  unsupportedText: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '32px',
    color: 'var(--text-primary, #1b3448)',
  },
  browserOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  browserOptionsTitle: {
    fontSize: '14px',
    opacity: 0.7,
    marginBottom: '8px',
  },
  browserButton: {
    display: 'block',
    padding: '14px 20px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    textDecoration: 'none',
    color: '#1b3448',
    fontWeight: '500',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  unsupportedNote: {
    fontSize: '14px',
    opacity: 0.6,
  },
  termsContainer: {
    padding: '20px',
    paddingBottom: '100px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  termsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  backButton: {
    padding: '12px 16px',
    fontSize: '18px',
    fontWeight: '500',
    opacity: 0.8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-primary, #1a1a1a)',
    transition: 'opacity 0.2s ease',
  },
  backButtonHover: {
    opacity: 1,
  },
  termsScroll: {
    maxHeight: 'calc(100vh - 200px)',
    overflow: 'auto',
  },
  termsSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  termsCard: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    border: 'none',
  },
  termsCardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block',
  },
  termsCardText: {
    fontSize: '14px',
    opacity: 0.7,
    lineHeight: 1.6,
    margin: 0,
  },
  termsSectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
    marginTop: '24px',
    display: 'block',
  },
  termsPre: {
    whiteSpace: 'pre-wrap',
    fontSize: '13px',
    opacity: 0.7,
    backgroundColor: 'var(--bg-card, #ffffff)',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    lineHeight: 1.7,
    overflow: 'auto',
  },
  primaryButton: {
    display: 'block',
    width: '100%',
    padding: '16px 48px',
    marginTop: '24px',
    fontSize: '18px',
    fontWeight: '600',
    backgroundColor: 'var(--primary, #2c5282)',
    color: '#ffffff',
    borderRadius: '30px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
  },
  settingsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(8px, 2vw, 12px)', // Responsive gap
    marginBottom: 'clamp(16px, 3vw, 24px)', // Responsive margin
    flexShrink: 0, // Prevent header from shrinking
  },
  settingsItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    marginBottom: '8px',
    fontSize: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'left',
  },
  settingsIcon: {
    fontSize: '20px',
  },
  settingsText: {
    fontSize: '16px',
  },
  dangerItem: {
    color: '#c53030',
  },
  settingsInfo: {
    marginTop: '24px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  settingsVersion: {
    fontSize: '12px',
    opacity: 0.5,
    display: 'block',
    margin: 0,
  },
  settingsInfoText: {
    fontSize: '12px',
    opacity: 0.5,
    display: 'block',
    margin: 0,
  },
  valuesIntro: {
    fontSize: '16px',
    opacity: 0.7,
    marginBottom: '24px',
    textAlign: 'center',
    lineHeight: 1.6,
    display: 'block',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  valueCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 16px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'center',
  },
  valueIcon: {
    fontSize: '32px',
    marginBottom: '8px',
    display: 'block',
  },
  valueLabel: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '4px',
    display: 'block',
  },
  valueDesc: {
    fontSize: '12px',
    opacity: 0.6,
    textAlign: 'center',
    display: 'block',
  },
  valuesSummary: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.05))',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  valuesSummaryTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '6px',
    display: 'block',
    color: 'var(--text-primary, #1b3448)',
  },
  valuesSummaryList: {
    fontSize: '13px',
    opacity: 0.85,
    margin: 0,
    lineHeight: 1.4,
    color: 'var(--text-primary, #1b3448)',
  },
  valuesByCategory: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  valuesCategoryBlock: {
    marginBottom: '8px',
  },
  valuesCategoryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    display: 'block',
    color: 'var(--text-primary, #1b3448)',
  },
  valuesCardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  valueCardWithDesc: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '14px 16px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    border: '2px solid transparent',
    textAlign: 'left',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  valueCardSelected: {
    borderColor: 'var(--primary-color, #02295b)',
    backgroundColor: 'rgba(2, 41, 91, 0.06)',
  },
  valueCardName: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '4px',
    display: 'block',
    color: 'var(--text-primary, #1b3448)',
  },
  valueCardDesc: {
    fontSize: '12px',
    opacity: 0.75,
    lineHeight: 1.4,
    display: 'block',
    color: 'var(--text-secondary, #4a5568)',
  },
  crisisUrgent: {
    padding: '16px',
    backgroundColor: 'rgba(197, 48, 48, 0.1)',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  crisisUrgentTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block',
  },
  crisisUrgentText: {
    fontSize: '14px',
    opacity: 0.8,
    margin: 0,
  },
  crisisSectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    marginTop: '8px',
    display: 'block',
  },
  crisisCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    marginBottom: '8px',
  },
  crisisCardInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  crisisCardName: {
    fontSize: '15px',
    fontWeight: '600',
    display: 'block',
  },
  crisisCardDesc: {
    fontSize: '13px',
    opacity: 0.6,
    display: 'block',
  },
  crisisCallButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--primary, #2c5282)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  crisisLink: {
    display: 'block',
    padding: '14px 16px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    marginBottom: '8px',
    color: 'var(--primary, #2c5282)',
    textDecoration: 'none',
    fontSize: '14px',
  },
   welcomeContainer: {
     padding: '12px',
     paddingBottom: '20px',
     maxWidth: '500px',
     margin: '0 auto',
   },
   welcomeLogoSection: {
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
     marginBottom: '12px',
     marginTop: '8px',
   },
   logoImage: {
     display: 'none', // Logo now in header
   },
   welcomeTitle: {
     display: 'none', // Title now in header
   },
    welcomeSubtitle: {
     fontSize: '14px',
     opacity: 0.7,
     textAlign: 'center',
   },
   welcomeHeading: {
     fontSize: '18px',
     fontWeight: '600',
     textAlign: 'center',
     marginTop: '8px',
     marginBottom: '12px',
     color: 'var(--text-primary, #1b3448)',
    },
    optionsGrid: {
     display: 'flex',
     flexDirection: 'column',
     gap: '8px',
     marginBottom: '12px',
   },
   optionCard: {
     display: 'flex',
     flexDirection: 'row',
     alignItems: 'center',
     padding: '12px 16px',
     backgroundColor: 'var(--bg-card, #ffffff)',
     borderRadius: '12px',
     boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
     cursor: 'pointer',
     border: 'none',
     minHeight: '52px',
     justifyContent: 'flex-start',
     gap: '12px',
     transition: 'transform 0.2s, box-shadow 0.2s',
   },
   optionIcon: {
     fontSize: '20px',
     display: 'block',
   },
   optionLabel: {
     fontSize: '15px',
     fontWeight: '600',
     display: 'block',
     color: 'var(--text-primary, #1b3448)',
   },
   optionDescription: {
     fontSize: '12px',
     opacity: 0.6,
     display: 'block',
     color: 'var(--text-secondary, #4a5568)',
   },
   energyLevelBadge: {
     fontSize: '9px',
     padding: '3px 8px',
     borderRadius: '10px',
     fontWeight: '600',
     textTransform: 'capitalize',
   },
   welcomeInputContainer: {
     display: 'flex',
     gap: '8px',
     padding: '12px',
     backgroundColor: 'var(--bg-card, #ffffff)',
     borderRadius: '12px',
     boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    welcomeInput: {
     flex: 1,
     padding: '10px 12px',
     fontSize: '15px',
     border: '1px solid rgba(0,0,0,0.1)',
     borderRadius: '12px',
     outline: 'none',
     backgroundColor: 'var(--bg-secondary, #f8f7f4)',
     fontFamily: 'inherit',
     lineHeight: '1.4',
    },
    welcomeSendButton: {
     width: '40px',
     height: '40px',
     borderRadius: '50%',
     backgroundColor: 'var(--primary, #2c5282)',
     color: '#ffffff',
     border: 'none',
     fontSize: '18px',
     cursor: 'pointer',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
   },
    welcomeInputLabel: {
      fontSize: '12px',
      opacity: 0.6,
      textAlign: 'center',
      marginBottom: '8px',
    },
    circuitBreakerSelector: {
      marginBottom: '12px',
    },
    circuitBreakerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    circuitBreakerLabel: {
      fontSize: '14px',
      fontWeight: '700',
      color: 'var(--text-primary, #1b3448)',
    },
    circuitBreakerEnergyBadge: {
      fontSize: '10px',
      padding: '2px 8px',
      borderRadius: '10px',
      backgroundColor: '#fef3c7',
      color: '#d97706',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    circuitBreakerOptions: {
      display: 'flex',
      gap: '6px',
      justifyContent: 'center',
    },
    circuitBreakerOption: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '6px 4px',
      backgroundColor: 'var(--bg-card, #ffffff)',
      borderRadius: '10px',
      borderWidth: '2px',
      borderStyle: 'solid',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      flex: 1,
      maxWidth: '72px',
    },
    circuitBreakerOptionSelected: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      transform: 'translateY(-1px)',
    },
    circuitBreakerVisual: {
      fontSize: '16px',
      marginBottom: '2px',
    },
    circuitBreakerName: {
      fontSize: '8px',
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 1.2,
      color: 'var(--text-primary, #1b3448)',
    },
    circuitBreakerEnergy: {
      fontSize: '7px',
      fontWeight: '700',
      marginTop: '2px',
    },
     circuitBreakerSubtext: {
       fontSize: '11px',
       opacity: 0.8,
       textAlign: 'center',
       marginTop: '8px',
       marginBottom: '4px',
       lineHeight: 1.4,
       color: 'var(--text-secondary, #4a5568)',
       padding: '0 12px',
     },
   conversationContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 200px)', // Account for header (60px) + footer input (80px) + bottom nav (60px)
    maxHeight: 'calc(100vh - 200px)',
    overflow: 'hidden',
  },
  conversationHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border, rgba(0,0,0,0.1))',
  },
  newChatButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '20px',
    backgroundColor: 'var(--primary, #2c5282)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
  },
  conversationHeading: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-secondary, #4a5568)',
    textAlign: 'center',
    padding: '12px 20px',
    margin: '0 16px',
    lineHeight: 1.4,
    fontStyle: 'italic',
  },
  energyBadge: {
    fontSize: '12px',
    padding: '4px 12px',
    backgroundColor: 'rgba(2, 41, 91, 0.1)',
    borderRadius: '20px',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px 20px',
    scrollBehavior: 'smooth',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '14px 18px',
    borderRadius: '20px',
    marginBottom: '12px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'var(--primary, #2c5282)',
    color: '#ffffff',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'var(--bg-card, #ffffff)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    color: 'var(--text-primary, #1b3448)',
  },
  typingIndicator: {
    padding: '12px 16px',
    alignSelf: 'flex-start',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '20px',
    marginBottom: '12px',
    opacity: 0.5,
  },
  quickReplies: {
    display: 'flex',
    gap: '8px',
    padding: '12px 20px',
    overflowX: 'auto',
    borderTop: '1px solid rgba(0,0,0,0.1)',
    scrollBehavior: 'smooth',
  },
  quickReplyButton: {
    padding: '10px 16px',
    backgroundColor: 'rgba(2, 41, 91, 0.08)',
    borderRadius: '20px',
    flexShrink: 0,
    cursor: 'pointer',
    border: 'none',
    fontSize: '14px',
    color: 'var(--primary, #2c5282)',
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '12px 20px',
    borderTop: '1px solid rgba(0,0,0,0.1)',
    backgroundColor: 'inherit',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    borderRadius: '25px',
    border: 'none',
    backgroundColor: 'var(--bg-card, #ffffff)',
    fontSize: '16px',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sendButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary, #2c5282)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
   bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '500px',
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 'max(20px, env(safe-area-inset-bottom))', // Increased for thumb reachability
    paddingTop: '16px', // Increased for thumb reachability
    paddingLeft: '12px', // Increased for thumb reachability
    paddingRight: '12px', // Increased for thumb reachability
    borderTop: '1px solid var(--border, rgba(0,0,0,0.1))',
    zIndex: 100,
   },
   bottomNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px', // Increased gap
    padding: '12px 20px', // Increased padding for thumb reachability
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    minWidth: '72px', // Increased for thumb reachability
    minHeight: '56px', // Increased for thumb reachability (44px minimum + padding)
    opacity: 0.6,
    borderRadius: '12px', // Added for better touch target
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
   },
   bottomNavItemHover: {
    backgroundColor: 'var(--bg-secondary, rgba(248, 247, 244, 0.5))',
    opacity: 0.8,
   },
   bottomNavActive: {
    opacity: 1,
   },
   bottomNavIcon: {
    fontSize: '24px',
    display: 'block',
   },
   bottomNavLabel: {
    fontSize: '11px',
    fontWeight: '500',
    opacity: 0.7,
    color: 'var(--text-secondary, #4a5568)',
   },
   themeNavButton: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-card, rgba(255,255,255,0.9))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    border: 'none',
    marginLeft: '4px',
    padding: '6px',
    color: 'var(--text-primary, #1b3448)',
  },
   themeNavIcon: {
    fontSize: '22px',
  },
  breathingWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    padding: '20px',
  },
  breathingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  breathingTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--text-primary, #1b3448)',
    textAlign: 'center',
  },
  breathingCircleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
  },
  breathingCircle: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    willChange: 'transform',
  },
  breathingPhaseText: {
    fontSize: '20px',
    fontWeight: '500',
    color: 'var(--text-primary, #1b3448)',
    marginBottom: '4px',
    textTransform: 'capitalize',
  },
  breathingCount: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-primary, #1b3448)',
  },
  breathingCycleText: {
    fontSize: '14px',
    opacity: 0.6,
    color: 'var(--text-secondary, #1b3448)',
  },
  breathingReducedMotion: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
  },
  breathingStaticRing: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #a8e6cf, #84c5a4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 40px rgba(168, 230, 207, 0.5)',
  },
  breathingInstruction: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-primary, #1b3448)',
    textAlign: 'center',
  },
  skipBreathingButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary, #1b3448)',
    backgroundColor: 'transparent',
    border: '1px solid var(--border, rgba(27, 52, 72, 0.3))',
    borderRadius: '20px',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'background-color 0.2s',
  },
  amygdalaContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    paddingBottom: '100px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  amygdalaContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  countdownRingWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '24px',
    marginBottom: '24px',
  },
  amygdalaTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary, #1b3448)',
    textAlign: 'center',
    marginBottom: '8px',
  },
  amygdalaMessage: {
    fontSize: '14px',
    color: 'var(--text-secondary, #1b3448)',
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: '280px',
    lineHeight: 1.4,
    marginBottom: '16px',
  },
  amygdalaCircleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '240px',
    height: '240px',
  },
  amygdalaCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    position: 'absolute',
  },
  amygdalaCount: {
    fontSize: '48px',
    fontWeight: '300',
    fontStyle: 'italic',
    color: 'var(--text-primary, #1b3448)',
    position: 'absolute',
    fontFamily: 'Georgia, serif',
  },
  amygdalaPhaseContainer: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  amygdalaPhaseText: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-primary, #1b3448)',
    marginBottom: '8px',
  },
  amygdalaSubtext: {
    fontSize: '14px',
    color: 'var(--text-secondary, #1b3448)',
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: '280px',
    lineHeight: 1.4,
  },
  amygdalaButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  amygdalaButtonPrimary: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: 'var(--primary, #2c5282)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  amygdalaButtonSecondary: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: 'transparent',
    color: 'var(--text-primary, #1b3448)',
    border: '1px solid var(--border, rgba(27, 52, 72, 0.3))',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  fiveFourTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary, #1b3448)',
    textAlign: 'center',
    marginBottom: '4px',
  },
  fiveFourMessage: {
    fontSize: '14px',
    color: 'var(--text-secondary, #1b3448)',
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: '280px',
    lineHeight: 1.4,
    marginBottom: '8px',
  },
  fiveFourTimer: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--timer-on-bubbles, #ffffff)',
    textShadow: '0 0 0 2px var(--timer-outline-on-bubbles, #2c5282)',
    marginBottom: '8px',
    fontVariantNumeric: 'tabular-nums',
  },
  fiveFourProgressBar: {
    width: '100%',
    maxWidth: '280px',
    height: '4px',
    backgroundColor: 'var(--border, rgba(27, 52, 72, 0.2))',
    borderRadius: '2px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  fiveFourProgressFill: {
    height: '100%',
    backgroundColor: 'var(--primary, #2c5282)',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  fiveFourIconsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '280px',
    marginBottom: '16px',
  },
  fiveFourIcon: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  fiveFourIconEmoji: {
    fontSize: '20px',
  },
  fiveFourIconLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-primary, #1b3448)',
  },
  fiveFourInstructionContainer: {
    textAlign: 'center',
    marginBottom: '12px',
  },
  fiveFourInstruction: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary, #1b3448)',
    marginBottom: '4px',
  },
  fiveFourCountdown: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--timer-on-bubbles, #ffffff)',
    textShadow: '0 0 0 2px var(--timer-outline-on-bubbles, #2c5282)',
   },
  rainContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
    minHeight: 'calc(100vh - 160px)',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: '24px',
  },
  rainTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary, #1b3448)',
    textAlign: 'center',
  },
  rainMessage: {
    fontSize: '14px',
    color: 'var(--text-secondary, #1b3448)',
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: '280px',
    lineHeight: 1.4,
    marginBottom: '8px',
    fontStyle: 'italic',
   },
    rainTimer: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--timer-on-bubbles, #ffffff)',
    textShadow: '0 0 0 2px var(--timer-outline-on-bubbles, #2c5282)',
    marginBottom: '8px',
    fontVariantNumeric: 'tabular-nums',
  },
  rainProgressBar: {
    width: '100%',
    maxWidth: '280px',
    height: '4px',
    backgroundColor: 'var(--border, rgba(27, 52, 72, 0.2))',
    borderRadius: '2px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  rainProgressFill: {
    height: '100%',
    backgroundColor: 'var(--primary, #2c5282)',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  rainStageLabel: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-primary, #1b3448)',
    marginBottom: '8px',
  },
  rainBubblesContainer: {
    position: 'absolute',
    top: '180px',
    left: 0,
    width: '100%',
    height: '180px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  rainBubble: {
    position: 'absolute',
    borderRadius: '50%',
    cursor: 'pointer',
    pointerEvents: 'auto',
    opacity: 0.7,
    transition: 'transform 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  rainInstruction: {
    fontSize: '14px',
    color: 'var(--text-primary, #1b3448)',
    textAlign: 'center',
    maxWidth: '240px',
    lineHeight: 1.5,
    marginTop: '8px',
    zIndex: 1,
  },
  rainCountdown: {
    fontSize: '48px',
    fontWeight: '700',
    color: 'var(--timer-on-bubbles, #ffffff)',
    textShadow: '0 0 0 2px var(--timer-outline-on-bubbles, #2c5282)',
    zIndex: 1,
   },
   chatActions: {
    display: 'flex',
    gap: '8px',
    padding: '8px 20px',
    borderBottom: '1px solid var(--border, rgba(0,0,0,0.1))',
   },
   chatActionButton: {
    padding: '8px 16px',
    fontSize: '13px',
    borderRadius: '16px',
    backgroundColor: 'var(--bg-card, rgba(255,255,255,0.8))',
    border: '1px solid var(--border, rgba(0,0,0,0.1))',
    cursor: 'pointer',
    color: 'var(--text-primary, #1b3448)',
   },
   dateSelector: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    padding: '12px 0',
    marginBottom: '16px',
    scrollBehavior: 'smooth',
   },
   dateButton: {
    padding: '8px 12px',
    fontSize: '13px',
    borderRadius: '16px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '1px solid var(--border, rgba(0,0,0,0.1))',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    color: 'var(--text-primary, #1b3448)',
   },
   dateButtonActive: {
    backgroundColor: 'var(--primary, #2c5282)',
    color: '#ffffff',
    borderColor: 'var(--primary, #2c5282)',
   },
   sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
   },
   sessionCard: {
    padding: '16px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
   },
   sessionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
   },
   sessionTime: {
    fontSize: '12px',
    padding: '4px 8px',
    backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.05))',
    borderRadius: '8px',
    color: 'var(--text-secondary, #4a5568)',
   },
   sessionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary, #1b3448)',
   },
   sessionPreview: {
    fontSize: '13px',
    color: 'var(--text-secondary, #4a5568)',
    marginBottom: '12px',
    lineHeight: 1.4,
   },
   sessionActions: {
    display: 'flex',
    gap: '8px',
   },
    sessionAction: {
     padding: '8px 16px',
     fontSize: '12px',
     borderRadius: '12px',
     backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.05))',
     border: 'none',
     cursor: 'pointer',
     color: 'var(--text-primary, #1b3448)',
    },
    helpSection: {
     display: 'flex',
     flexDirection: 'column',
     gap: 'clamp(12px, 2vw, 20px)', // Responsive gap
     flex: 1,
     overflowY: 'auto' as const,
    },
    helpItem: {
     display: 'flex',
     gap: 'clamp(12px, 2vw, 16px)', // Responsive gap
     padding: 'clamp(12px, 2vw, 16px)', // Responsive padding
     backgroundColor: 'var(--bg-card, #ffffff)',
     borderRadius: 'clamp(12px, 2vw, 16px)', // Responsive border radius
     boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
     flexShrink: 0, // Prevent items from shrinking
    },
    helpIcon: {
     fontSize: 'clamp(24px, 4vw, 32px)', // Responsive icon size
     width: 'clamp(40px, 6vw, 48px)', // Responsive width
     height: 'clamp(40px, 6vw, 48px)', // Responsive height
     minWidth: 'clamp(40px, 6vw, 48px)', // Prevent shrinking
     minHeight: 'clamp(40px, 6vw, 48px)', // Prevent shrinking
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.05))',
     borderRadius: 'clamp(10px, 2vw, 12px)', // Responsive border radius
     flexShrink: 0, // Prevent icon from shrinking
    },
    helpContent: {
     flex: 1,
    },
    helpTitle: {
     fontSize: 'clamp(14px, 2.5vw, 16px)', // Responsive title
     fontWeight: '600',
     color: 'var(--text-primary, #1b3448)',
     marginBottom: 'clamp(6px, 1vw, 8px)', // Responsive margin
    },
    helpText: {
     fontSize: 'clamp(13px, 2vw, 14px)', // Responsive text
     color: 'var(--text-secondary, #4a5568)',
     lineHeight: 1.5,
    },
    helpFooter: {
     marginTop: 'clamp(16px, 3vw, 24px)', // Responsive margin
     padding: 'clamp(12px, 2vw, 16px)', // Responsive padding
     backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.05))',
     borderRadius: 'clamp(10px, 2vw, 12px)', // Responsive border radius
     flexShrink: 0, // Prevent footer from shrinking
    },
    helpFooterText: {
      fontSize: 'clamp(12px, 2vw, 13px)', // Responsive text
      color: 'var(--text-secondary, #4a5568)',
      textAlign: 'center',
      lineHeight: 1.5,
     },
     tenSecondBreakersGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px',
     },
      tenSecondBreakerCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        borderRadius: '16px',
        borderWidth: '2px',
        borderStyle: 'solid',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
      },
     tenSecondBreakerIcon: {
      fontSize: '32px',
      marginBottom: '12px',
     },
     tenSecondBreakerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--text-primary, #1b3448)',
      marginBottom: '8px',
     },
     tenSecondBreakerSubtext: {
      fontSize: '14px',
      color: 'var(--text-secondary, #4a5568)',
      lineHeight: 1.4,
     },
};
