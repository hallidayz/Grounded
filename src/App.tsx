import React, { useState, useEffect, useRef } from 'react';
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
import type { EnergyLevel, ConversationState } from './types';

const BREATHING_PATTERNS = {
  '10s': { 
    pattern: [4, 2, 4], 
    cycles: 1, 
    label: '10 seconds',
    isAmygdalaHijack: true,
    message: 'Just this breath. You are safe in this moment.'
  },
  '2min': { 
    pattern: [40, 30, 20, 20, 10], 
    cycles: 1, 
    label: '2 minutes',
    isFiveFourThreeTwoOne: true,
    message: 'Your senses are your anchor to the present.'
  },
  '5min': { 
    pattern: [60, 60, 120, 60], 
    cycles: 1, 
    label: '5 minutes',
    isRainMethod: true,
    message: 'This is a moment of difficulty. Experiencing difficult things is a part of life. May I be kind to myself in this moment.'
  },
};

function BreathingExercise({ 
  energy, 
  onComplete 
}: { 
  energy: EnergyLevel; 
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'see' | 'feel' | 'hear' | 'smell' | 'taste' | 'recognize' | 'allow' | 'investigate' | 'nurture'>('inhale');
  const [cycle, setCycle] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [currentScale, setCurrentScale] = useState(0.3);
  const [sensoryStage, setSensoryStage] = useState(0);
  const [bubbles, setBubbles] = useState<Array<{id: number; x: number; y: number; size: number; speed: number; color: string}>>([]);
  const [poppedBubbles, setPoppedBubbles] = useState(0);
  const bubbleIdRef = useRef(0);
  
  const config = BREATHING_PATTERNS[energy];
  const isAmygdalaMode = config.isAmygdalaHijack;
  const isFiveFourThreeTwoOne = config.isFiveFourThreeTwoOne;
  const isRainMethod = config.isRainMethod;
  const totalCycles = config.cycles;
  const [inhale, hold1, exhale] = config.pattern;

  const sensoryStages = [
    { phase: 'see', icon: '👁️', label: '5 things you see', duration: 40, countLabel: '5' },
    { phase: 'feel', icon: '✋', label: '4 things you feel', duration: 30, countLabel: '4' },
    { phase: 'hear', icon: '👂', label: '3 things you hear', duration: 20, countLabel: '3' },
    { phase: 'smell', icon: '👃', label: '2 things you smell', duration: 20, countLabel: '2' },
    { phase: 'taste', icon: '👄', label: '1 thing you taste', duration: 10, countLabel: '1' },
  ];

  const rainStages = [
    { phase: 'recognize', label: 'Recognize', instruction: 'Name what you\'re feeling (e.g., "I am feeling anxious")', duration: 60 },
    { phase: 'allow', label: 'Allow', instruction: 'Let this feeling exist. Don\'t try to fix it.', duration: 60 },
    { phase: 'investigate', label: 'Investigate', instruction: 'Where is this in your body? What is it saying?', duration: 120 },
    { phase: 'nurture', label: 'Nurture', instruction: '"I am doing my best with a hard moment."', duration: 60 },
  ];

  const bubbleColors = [
    'rgba(168, 230, 207, 0.6)',
    'rgba(132, 197, 164, 0.5)',
    'rgba(127, 179, 213, 0.5)',
    'rgba(180, 200, 180, 0.5)',
    'rgba(160, 180, 170, 0.5)',
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;

    const playHaptic = () => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    };

    const runPhase = async () => {
      if (isAmygdalaMode) {
        for (let c = 0; c < 1; c++) {
          setPhase('inhale');
          setCurrentScale(0.3);
          setCountdown(inhale);
          playHaptic();
          await new Promise(resolve => setTimeout(resolve, 100));
          setCurrentScale(2.2);
          await new Promise(resolve => setTimeout(resolve, inhale * 1000 - 100));
          
          setPhase('hold');
          setCurrentScale(2.3);
          setCountdown(hold1);
          playHaptic();
          await new Promise(resolve => setTimeout(resolve, hold1 * 1000));
          
          setPhase('exhale');
          setCurrentScale(0.3);
          setCountdown(exhale);
          playHaptic();
          await new Promise(resolve => setTimeout(resolve, exhale * 1000));
        }
        } else if (isFiveFourThreeTwoOne) {
        for (let i = 0; i < sensoryStages.length; i++) {
          const stage = sensoryStages[i];
          setPhase(stage.phase as any);
          setSensoryStage(i);
          setCountdown(stage.duration);
          playHaptic();
          
          for (let t = stage.duration; t > 0; t--) {
            setCountdown(t);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } else if (isRainMethod) {
        const bubbleInterval = setInterval(() => {
          if (bubbles.length < 10) {
            bubbleIdRef.current += 1;
            const newBubble = {
              id: bubbleIdRef.current,
              x: Math.random() * 80 + 10,
              y: 110,
              size: Math.random() * 25 + 15,
              speed: Math.random() * 0.5 + 0.4,
              color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
            };
            setBubbles(prev => [...prev, newBubble]);
          }
        }, 1200);

        for (let i = 0; i < rainStages.length; i++) {
          const stage = rainStages[i];
          setPhase(stage.phase as any);
          setSensoryStage(i);
          setCountdown(stage.duration);
          playHaptic();
          
          for (let t = stage.duration; t > 0; t--) {
            setBubbles(prev => prev.map(b => ({...b, y: b.y - b.speed})));
            setCountdown(t);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        clearInterval(bubbleInterval);
      } else {
        const phases = [
          { name: 'inhale' as const, duration: inhale, text: 'Breathe in' },
          { name: 'hold' as const, duration: hold1, text: 'Hold' },
          { name: 'exhale' as const, duration: exhale, text: 'Breathe out' },
        ];

        for (let c = cycle; c < totalCycles; c++) {
          for (let i = 0; i < phases.length; i++) {
            setPhase(phases[i].name);
            setCountdown(phases[i].duration);
            playHaptic();

            await new Promise(resolve => setTimeout(resolve, phases[i].duration * 1000));
          }
          setCycle(c + 1);
        }
      }

      onComplete();
    };

    runPhase();
  }, [energy, isReducedMotion, isAmygdalaMode, isFiveFourThreeTwoOne, inhale, hold1, exhale, totalCycles, cycle]);

  if (isReducedMotion) {
    return (
      <div style={styles.breathingContainer}>
        <div style={styles.breathingReducedMotion}>
          <p style={styles.breathingInstruction}>
            {phase === 'inhale' ? 'Inhale' : phase === 'exhale' ? 'Exhale' : 'Hold'}
          </p>
          <div style={styles.breathingStaticRing}>
            <span style={styles.breathingCount}>{countdown}</span>
          </div>
        </div>
        <button style={styles.skipBreathingButton} onClick={onComplete}>
          Skip
        </button>
      </div>
    );
  }

  if (isAmygdalaMode) {
    const ease = phase === 'inhale' ? 'ease-out' : phase === 'exhale' ? 'ease-in' : 'linear';
    const glow = phase === 'hold' ? '0 0 80px rgba(132, 197, 164, 0.8)' : '0 0 40px rgba(132, 197, 164, 0.5)';
    const opacity = phase === 'exhale' ? 0.5 : 1;
    
    const getCircleColor = () => {
      if (phase === 'inhale') return 'radial-gradient(circle, #a8e6cf, #84c5a4)';
      if (phase === 'hold') return 'radial-gradient(circle, #84c5a4, #5ea88c)';
      return 'radial-gradient(circle, #7fb3d5, #5a9bc4)';
    };

    return (
      <div style={styles.breathingContainer}>
        <h2 style={styles.amygdalaTitle}>10 seconds</h2>
        <p style={styles.amygdalaMessage}>{config.message}</p>
        
        <div style={styles.amygdalaCircleWrapper}>
          <div 
            style={{
              ...styles.amygdalaCircle,
              transform: `scale(${currentScale})`,
              background: getCircleColor(),
              boxShadow: glow,
              opacity: opacity,
              transition: `transform ${phase === 'inhale' ? inhale : phase === 'hold' ? hold1 : exhale}s ${ease}, background 0.5s, box-shadow 0.5s, opacity 0.5s`,
            }}
          />
          <span style={styles.amygdalaCount}>{countdown}</span>
        </div>
        
        <p style={styles.amygdalaPhaseText}>
          {phase === 'inhale' ? 'In' : phase === 'hold' ? 'Hold' : phase === 'exhale' ? 'Out' : ''}
        </p>

        <div style={styles.amygdalaButtons}>
          <button style={styles.amygdalaButtonSecondary} onClick={() => {
            setPhase('inhale');
            setCurrentScale(0.3);
            setCountdown(inhale);
            setCycle(0);
          }}>
            Again
          </button>
          <button style={styles.amygdalaButtonPrimary} onClick={onComplete}>
            Done
          </button>
        </div>
      </div>
    );
  }

  if (isFiveFourThreeTwoOne) {
    const currentStage = sensoryStages[sensoryStage];
    const elapsedTime = sensoryStages.slice(0, sensoryStage).reduce((acc, s) => acc + s.duration, 0) + (currentStage.duration - countdown);
    const remainingTime = 120 - elapsedTime;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const stageProgress = (elapsedTime / 120) * 100;

    return (
      <div style={styles.breathingContainer}>
        <h2 style={styles.fiveFourTitle}>2 minutes</h2>
        <p style={styles.fiveFourMessage}>{config.message}</p>
        
        <div style={styles.fiveFourTimer}>{timeString}</div>
        
        <div style={styles.fiveFourProgressBar}>
          <div style={{...styles.fiveFourProgressFill, width: `${stageProgress}%`}} />
        </div>
        
        <div style={styles.fiveFourIconsContainer}>
          {sensoryStages.map((stage, index) => (
            <div 
              key={stage.phase}
              style={{
                ...styles.fiveFourIcon,
                opacity: index === sensoryStage ? 1 : index < sensoryStage ? 0.3 : 0.1,
                transform: index === sensoryStage ? 'scale(1.2)' : 'scale(1)',
                transition: 'opacity 0.5s, transform 0.3s',
              }}
            >
              <span style={styles.fiveFourIconEmoji}>{stage.icon}</span>
              <span style={styles.fiveFourIconLabel}>
                {index < sensoryStage ? '✓' : stage.countLabel}
              </span>
            </div>
          ))}
        </div>
        
        <div style={styles.fiveFourInstructionContainer}>
          <p style={styles.fiveFourInstruction}>
            {currentStage.label}
          </p>
          <p style={styles.fiveFourCountdown}>{countdown}</p>
        </div>

        <div style={styles.amygdalaButtons}>
          <button style={styles.amygdalaButtonSecondary} onClick={() => {
            setSensoryStage(0);
            setCountdown(sensoryStages[0].duration);
            setCycle(0);
            setBubbles([]);
            setPoppedBubbles(0);
          }}>
            Again
          </button>
          <button style={styles.amygdalaButtonPrimary} onClick={onComplete}>
            Done
          </button>
        </div>
      </div>
    );
  }

  if (isRainMethod) {
    const currentStage = rainStages[sensoryStage];
    const elapsedTime = rainStages.slice(0, sensoryStage).reduce((acc, s) => acc + s.duration, 0) + (currentStage.duration - countdown);
    const remainingTime = 300 - elapsedTime;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const stageProgress = (elapsedTime / 300) * 100;

    const popBubble = (id: number) => {
      setBubbles(prev => prev.filter(b => b.id !== id));
      setPoppedBubbles(prev => prev + 1);
      if (navigator.vibrate) navigator.vibrate(30);
    };

    return (
      <div style={styles.rainContainer}>
        <h2 style={styles.rainTitle}>5 minutes</h2>
        <p style={styles.rainMessage}>{config.message}</p>
        
        <div style={styles.rainTimer}>{timeString}</div>
        
        <div style={styles.rainProgressBar}>
          <div style={{...styles.rainProgressFill, width: `${stageProgress}%`}} />
        </div>
        
        <div style={styles.rainStageLabel}>{currentStage.label}</div>
        
        <div style={styles.rainBubblesContainer}>
          {bubbles.map(bubble => (
            <div
              key={bubble.id}
              onClick={() => popBubble(bubble.id)}
              style={{
                ...styles.rainBubble,
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
                background: bubble.color,
                borderRadius: '50%',
              }}
            />
          ))}
        </div>
        
        <p style={styles.rainInstruction}>{currentStage.instruction}</p>
        <p style={styles.rainCountdown}>{countdown}</p>

        <div style={styles.amygdalaButtons}>
          <button style={styles.amygdalaButtonSecondary} onClick={() => {
            setSensoryStage(0);
            setCountdown(rainStages[0].duration);
            setCycle(0);
            setBubbles([]);
            setPoppedBubbles(0);
            bubbleIdRef.current = 0;
          }}>
            Again
          </button>
          <button style={styles.amygdalaButtonPrimary} onClick={onComplete}>
            Done
          </button>
        </div>
      </div>
    );
  }

  const scale = phase === 'inhale' ? 1.5 : phase === 'hold' && cycle % 2 === 0 ? 1.55 : 1;
  const ease = phase === 'inhale' ? 'ease-out' : phase === 'exhale' ? 'ease-in' : 'linear';

  const getPhaseColor = () => {
    if (phase === 'inhale') return '#a8e6cf';
    if (phase === 'hold') return '#84c5a4';
    if (phase === 'exhale') return '#7fb3d5';
    return '#95a5a6';
  };

  return (
    <div style={styles.breathingContainer}>
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        style={{ position: 'absolute', left: -9999 }}
        id="breath-announce"
      >
        {phase === 'inhale' ? `Inhale for ${countdown} seconds` : 
         phase === 'exhale' ? `Exhale for ${countdown} seconds` : 
         `Hold for ${countdown} seconds`}
      </div>

      <h2 style={styles.breathingTitle}>{config.label}</h2>
      
      <div style={styles.breathingCircleWrapper}>
        <div 
          style={{
            ...styles.breathingCircle,
            transform: `scale(${scale})`,
            background: `radial-gradient(circle, ${getPhaseColor()}, ${getPhaseColor()}88)`,
            boxShadow: phase === 'hold' && cycle % 2 === 0 
              ? '0 0 60px rgba(168, 230, 207, 0.7)' 
              : '0 0 40px rgba(168, 230, 207, 0.5)',
            transition: `transform ${countdown}s ${ease}, background 0.5s, box-shadow 0.5s`,
          }}
          aria-label={`Breathing guide: ${phase}`}
        >
          <span style={styles.breathingPhaseText}>
            {phase === 'inhale' ? 'In' : phase === 'exhale' ? 'Out' : phase === 'hold' ? 'Hold' : 'Rest'}
          </span>
          <span style={styles.breathingCount}>{countdown}</span>
        </div>
      </div>

      <p style={styles.breathingCycleText}>
        Cycle {Math.min(cycle + 1, totalCycles)} of {totalCycles}
      </p>

      <button style={styles.skipBreathingButton} onClick={onComplete}>
        Skip to conversation
      </button>
    </div>
  );
}

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkWebGPU = async () => {
      if (!navigator.gpu) {
        setIsWebGPUSupported(false);
        return;
      }
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          setIsWebGPUSupported(false);
        }
      } catch {
        setIsWebGPUSupported(false);
      }
    };
    checkWebGPU();
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

  const handleEnergySelect = (energy: EnergyLevel) => {
    setSelectedEnergy(energy);
    setPendingUserInput('');
    setBreathingPhase('inhale');
    setBreathingCycle(0);
    setView('breathing');
  };

  const handleWelcomeInput = () => {
    if (!pendingUserInput.trim()) return;
    const energy: EnergyLevel = '2min';
    setSelectedEnergy(energy);
    setBreathingPhase('inhale');
    setBreathingCycle(0);
    setView('breathing');
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

  const renderBottomNav = () => {
    if (view === 'loading') return null;
    const navItems = [
      { view: 'welcome', icon: '🏠', label: 'Home' },
      { view: 'crisis-resources', icon: '🚨', label: 'Crisis' },
      { view: 'values', icon: '❤️', label: 'My Values' },
      { view: 'settings', icon: '⚙️', label: 'Personalize' },
    ];
    return (
      <nav style={styles.bottomNav}>
        {navItems.map(item => (
          <button
            key={item.view}
            style={{...styles.bottomNavItem, ...(view === item.view ? styles.bottomNavActive : {})}}
            onClick={() => setView(item.view as AppView)}
          >
            <span style={styles.bottomNavIcon}>{item.icon}</span>
            <span style={styles.bottomNavLabel}>{item.label}</span>
          </button>
        ))}
        <button style={styles.themeNavButton} onClick={toggleTheme} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
          <span style={styles.themeNavIcon}>{isDarkMode ? '☀️' : '🌙'}</span>
        </button>
      </nav>
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

  const renderValues = () => (
    <div style={styles.container}>
      <div style={styles.settingsHeader}>
        <button style={styles.backButton} onClick={() => setView('welcome')}>
          ← Back
        </button>
        <h2 style={styles.title}>Your Values</h2>
      </div>
      <p style={styles.valuesIntro}>What matters most to you?</p>
      <div style={styles.valuesGrid}>
        {[
          { icon: '❤️', label: 'Compassion', desc: 'For yourself & others' },
          { icon: '🌱', label: 'Growth', desc: 'Learning & improving' },
          { icon: '🤝', label: 'Connection', desc: 'Relationships' },
          { icon: '🎯', label: 'Presence', desc: 'Being here now' },
          { icon: '🛡️', label: 'Safety', desc: 'Feeling secure' },
          { icon: '✨', label: 'Authenticity', desc: 'Being true to yourself' },
          { icon: '🌊', label: 'Flow', desc: 'Natural rhythm' },
          { icon: '🧘', label: 'Peace', desc: 'Inner calm' },
        ].map(value => (
          <button key={value.label} style={styles.valueCard}>
            <span style={styles.valueIcon}>{value.icon}</span>
            <span style={styles.valueLabel}>{value.label}</span>
            <span style={styles.valueDesc}>{value.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );

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
        <p style={styles.welcomeSubtitle}>Small moments, big difference</p>
        <h2 style={styles.welcomeHeading}>Pause. What's moving through you?</h2>
      </div>
      <div style={styles.optionsGrid}>
        {COPY.energy.options.map(option => (
          <button key={option.energy} style={styles.optionCard} onClick={() => handleEnergySelect(option.energy)}>
            <span style={styles.optionIcon}>{option.icon}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={styles.optionLabel}>{option.label}</span>
              <span style={styles.optionDescription}>{option.description}</span>
            </div>
          </button>
        ))}
      </div>
      <p style={styles.welcomeInputLabel}>Or share what's on your mind:</p>
      <div style={styles.welcomeInputContainer}>
        <textarea
          ref={textareaRef}
          style={{...styles.welcomeInput, height: 'auto', minHeight: '48px', resize: 'none'}}
          placeholder="Type here..."
          value={pendingUserInput}
          rows={inputRows}
          onChange={(e: any) => {
            const value = e.target.value;
            setPendingUserInput(value);
            const lines = value.split('\n').length;
            setInputRows(Math.min(Math.max(lines, 1), 4));
          }}
        />
        <button 
          style={{...styles.welcomeSendButton, opacity: pendingUserInput.trim() ? 1 : 0.5}} 
          onClick={handleWelcomeInput}
          disabled={!pendingUserInput.trim()}
          aria-label="Submit what's on your mind"
        >
          →
        </button>
      </div>
      {moments > 0 && <p style={styles.momentsCount}>{moments} moments</p>}
    </div>
  );

  const renderBreathing = () => (
    <div style={styles.breathingWrapper}>
      {selectedEnergy && (
        <BreathingExercise energy={selectedEnergy} onComplete={handleBreathingComplete} />
      )}
    </div>
  );

  const renderConversation = () => {
    const nodeData = conversationState ? getConversationNode(conversationState.node) : null;
    const quickReplies = nodeData && 'quickReplies' in nodeData ? nodeData.quickReplies : undefined;
    return (
      <div style={styles.conversationContainer}>
        <div style={styles.conversationHeader}>
          <button style={styles.backButton} onClick={() => setView('welcome')}>
            ← Energy
          </button>
          <span style={styles.energyBadge}>{selectedEnergy}</span>
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
        <div style={styles.inputContainer}>
          <input
            type="text"
            style={styles.input}
            placeholder="Type your response..."
            value={userInput}
            onChange={(e: any) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={aiLoading}
          />
          <button style={styles.sendButton} onClick={() => handleSendMessage()} disabled={aiLoading || !userInput.trim()}>
            →
          </button>
        </div>
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
       {!isWebGPUSupported && renderUnsupportedBrowser()}
       {view === 'loading' && renderLoading()}
       {view === 'terms' && renderTerms()}
       {view === 'settings' && renderSettings()}
       {view === 'values' && renderValues()}
       {view === 'welcome' && renderWelcome()}
       {view === 'breathing' && renderBreathing()}
       {view === 'conversation' && renderConversation()}
       {view === 'crisis-resources' && renderCrisisResources()}
       {view === 'complete' && renderComplete()}
       {renderBottomNav()}
       {renderThemeToggle()}
     </div>
   );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--bg-primary, #fafaf9)',
    color: 'var(--text-primary, #1b3448)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    paddingBottom: '80px',
  },
  container: {
    flex: 1,
    padding: '20px',
    paddingBottom: '100px',
    maxWidth: '500px',
    margin: '0 auto',
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
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '12px',
    textAlign: 'center',
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
    padding: '8px 12px',
    fontSize: '14px',
    opacity: 0.6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
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
    gap: '12px',
    marginBottom: '24px',
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
    padding: '20px',
    paddingBottom: '100px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  welcomeLogoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
    marginTop: '20px',
  },
  logoImage: {
    width: '100px',
    height: '100px',
    borderRadius: '20px',
    marginBottom: '16px',
    objectFit: 'contain',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px',
    textAlign: 'center',
  },
   welcomeSubtitle: {
    fontSize: '16px',
    opacity: 0.7,
    textAlign: 'center',
  },
  welcomeHeading: {
    fontSize: '24px',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: '16px',
    marginBottom: '24px',
    color: 'var(--text-primary, #1b3448)',
   },
   optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  optionCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    border: 'none',
    minHeight: '60px',
    justifyContent: 'flex-start',
    gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  optionIcon: {
    fontSize: '24px',
    display: 'block',
  },
  optionLabel: {
    fontSize: '16px',
    fontWeight: '600',
    display: 'block',
    color: 'var(--text-primary, #1b3448)',
  },
  optionDescription: {
    fontSize: '13px',
    opacity: 0.6,
    display: 'block',
    color: 'var(--text-secondary, #4a5568)',
  },
  welcomeInputContainer: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
   },
   welcomeInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '16px',
    outline: 'none',
    backgroundColor: 'var(--bg-secondary, #f8f7f4)',
    fontFamily: 'inherit',
    lineHeight: '1.4',
   },
   welcomeSendButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary, #2c5282)',
    color: '#ffffff',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeInputLabel: {
    fontSize: '14px',
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: '12px',
  },
  conversationContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 80px)',
    maxHeight: 'calc(100vh - 80px)',
  },
  conversationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
  },
  energyBadge: {
    fontSize: '12px',
    padding: '4px 12px',
    backgroundColor: 'rgba(2, 41, 91, 0.1)',
    borderRadius: '20px',
  },
  messagesContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '16px 20px',
    scrollBehavior: 'smooth',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '14px 18px',
    borderRadius: '20px',
    marginBottom: '12px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2c5282',
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
    backgroundColor: 'var(--bg-card, rgba(255,255,255,0.95))',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
    paddingTop: '12px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderTop: '1px solid var(--border, rgba(0,0,0,0.1))',
    zIndex: 100,
   },
   bottomNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    minWidth: '64px',
    minHeight: '48px',
    opacity: 0.6,
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
  amygdalaTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary, #1b3448)',
    textAlign: 'center',
    marginBottom: '4px',
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
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary, #1b3448)',
    zIndex: 1,
  },
  amygdalaPhaseText: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary, #1b3448)',
    textTransform: 'capitalize',
    marginTop: '8px',
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
};
