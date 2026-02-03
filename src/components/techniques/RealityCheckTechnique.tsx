import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';
import { getRealityCheckSuggestions, getRealityCheckVerdict, type RealityCheckAISuggestion, type RealityCheckVerdict } from '../../services/aiService';

type GameStage = 'collect' | 'ai-arguments' | 'verdict';
type Role = 'prosecutor' | 'defense' | 'judge';

const RealityCheckTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
}) => {
  // Game state
  const [thought, setThought] = useState('');
  const [caseName, setCaseName] = useState<string | null>(null);
  const [stage, setStage] = useState<GameStage>('collect');
  const [currentRole, setCurrentRole] = useState<Role>('prosecutor');
  const [clarityPoints, setClarityPoints] = useState(0);
  
  // Evidence state
  const [evidenceFor, setEvidenceFor] = useState<string[]>([]);
  const [evidenceAgainst, setEvidenceAgainst] = useState<string[]>([]);
  const [currentEvidence, setCurrentEvidence] = useState('');
  const [evidenceType, setEvidenceType] = useState<'for' | 'against'>('for');
  
  // AI state
  const [aiSuggestions, setAiSuggestions] = useState<RealityCheckAISuggestion | null>(null);
  const [verdict, setVerdict] = useState<RealityCheckVerdict | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [usedExamples, setUsedExamples] = useState<Set<string>>(new Set());
  
  // Verdict state
  const [balancedThought, setBalancedThought] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('realityCheck_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.thought) setThought(parsed.thought);
        if (parsed.caseName) setCaseName(parsed.caseName);
        if (parsed.stage) setStage(parsed.stage);
        if (parsed.evidenceFor) setEvidenceFor(parsed.evidenceFor);
        if (parsed.evidenceAgainst) setEvidenceAgainst(parsed.evidenceAgainst);
        if (parsed.clarityPoints) setClarityPoints(parsed.clarityPoints);
        if (parsed.balancedThought) setBalancedThought(parsed.balancedThought);
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (thought || evidenceFor.length > 0 || evidenceAgainst.length > 0) {
      const state = {
        thought,
        caseName,
        stage,
        evidenceFor,
        evidenceAgainst,
        clarityPoints,
        balancedThought,
      };
      localStorage.setItem('realityCheck_state', JSON.stringify(state));
    }
  }, [thought, caseName, stage, evidenceFor, evidenceAgainst, clarityPoints, balancedThought]);

  // Generate case name when thought is entered
  useEffect(() => {
    if (thought.trim() && !caseName) {
      const thoughtPreview = thought.length > 30 ? thought.substring(0, 30) + '...' : thought;
      setCaseName(`The Case of "${thoughtPreview}"`);
    }
  }, [thought, caseName]);

  // Manual stage advancement - removed auto-advance for better user control

  const fetchAISuggestions = useCallback(async () => {
    if (!thought.trim() || aiLoading) return;
    
    setAiLoading(true);
    setAiError(null);
    try {
      const suggestions = await getRealityCheckSuggestions(thought, evidenceFor, evidenceAgainst);
      setAiSuggestions(suggestions);
      setAiError(null);
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
      setAiError('Unable to load suggestions right now. You can continue adding evidence manually.');
      // Don't block progression - allow user to continue
    } finally {
      setAiLoading(false);
    }
  }, [thought, evidenceFor, evidenceAgainst]);

  const fetchVerdict = useCallback(async () => {
    if (!thought.trim()) return;
    
    setAiLoading(true);
    setAiError(null);
    try {
      const verdictData = await getRealityCheckVerdict(thought, evidenceFor, evidenceAgainst);
      setVerdict(verdictData);
      setAiError(null);
    } catch (error) {
      console.error('Failed to fetch verdict:', error);
      setAiError('Unable to generate suggestions right now. You can write your own balanced thought.');
      // Provide fallback encouragement
      setVerdict({
        balancedThoughts: [],
        encouragement: 'You just practiced examining a thought instead of automatically believing it. That\'s a big skill.',
      });
    } finally {
      setAiLoading(false);
    }
  }, [thought, evidenceFor, evidenceAgainst]);

  const handleAddEvidence = () => {
    if (!currentEvidence.trim()) return;

    const evidence = currentEvidence.trim();
    if (evidenceType === 'for') {
      setEvidenceFor((prev) => [...prev, evidence]);
      if (currentRole === 'prosecutor') {
        setClarityPoints((prev) => prev + 1);
      }
    } else {
      setEvidenceAgainst((prev) => [...prev, evidence]);
      if (currentRole === 'defense') {
        setClarityPoints((prev) => prev + 1);
      }
    }

    setCurrentEvidence('');
    
    // Switch roles after adding evidence
    if (evidenceType === 'for' && evidenceFor.length === 0) {
      setCurrentRole('defense');
      setEvidenceType('against');
    } else if (evidenceType === 'against' && evidenceAgainst.length === 0) {
      setCurrentRole('prosecutor');
      setEvidenceType('for');
    } else {
      // Alternate roles
      setCurrentRole((prev) => prev === 'prosecutor' ? 'defense' : 'prosecutor');
      setEvidenceType((prev) => prev === 'for' ? 'against' : 'for');
    }
  };

  const handleDeleteEvidence = (index: number, type: 'for' | 'against') => {
    if (type === 'for') {
      setEvidenceFor((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEvidenceAgainst((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUseExample = (example: string, type: 'for' | 'against') => {
    if (usedExamples.has(example)) return;
    
    const adapted = example.replace(/^Example: /i, '').trim();
    if (type === 'for') {
      setEvidenceFor((prev) => [...prev, adapted]);
    } else {
      setEvidenceAgainst((prev) => [...prev, adapted]);
    }
    setUsedExamples((prev) => new Set([...prev, example]));
    setClarityPoints((prev) => prev + 1);
  };

  const handleComplete = () => {
    if (balancedThought.trim()) {
      setShowCompletion(true);
      setCurrentRole('judge');
      // Clear saved state on completion
      localStorage.removeItem('realityCheck_state');
    }
  };

  const handleReset = () => {
    setThought('');
    setCaseName(null);
    setStage('collect');
    setCurrentRole('prosecutor');
    setClarityPoints(0);
    setEvidenceFor([]);
    setEvidenceAgainst([]);
    setCurrentEvidence('');
    setEvidenceType('for');
    setAiSuggestions(null);
    setVerdict(null);
    setBalancedThought('');
    setShowCompletion(false);
    setUsedExamples(new Set());
    localStorage.removeItem('realityCheck_state');
  };

  const getProgress = (): number => {
    if (stage === 'collect') {
      const totalNeeded = 2; // Need at least 1 for and 1 against
      const collected = (evidenceFor.length > 0 ? 1 : 0) + (evidenceAgainst.length > 0 ? 1 : 0);
      return (collected / totalNeeded) * 33;
    } else if (stage === 'ai-arguments') {
      return 66;
    } else {
      return 100;
    }
  };

  const getMicroChallenge = (): string | null => {
    if (stage !== 'collect') return null;
    
    if (evidenceFor.length === 0 && currentRole === 'prosecutor') {
      return 'Find 1 piece of evidence that supports this thought from the last week.';
    }
    if (evidenceAgainst.length === 0 && currentRole === 'defense') {
      return 'Now find 1 thing that doesn\'t fit this story at all.';
    }
    if (evidenceFor.length > 0 && evidenceAgainst.length > 0) {
      return 'Great! Keep adding evidence to build a complete picture.';
    }
    return null;
  };

  const getRoleInfo = (role: Role) => {
    switch (role) {
      case 'prosecutor':
        return { icon: '⚖️', label: 'Prosecutor', color: '#dc2626', description: 'Building the case FOR the thought' };
      case 'defense':
        return { icon: '🛡️', label: 'Defense', color: '#2563eb', description: 'Building the case AGAINST the thought' };
      case 'judge':
        return { icon: '⚖️', label: 'Judge', color: '#059669', description: 'Finding a balanced perspective' };
    }
  };

  const roleInfo = getRoleInfo(currentRole);
  const balance = evidenceFor.length - evidenceAgainst.length;
  const rotation = Math.max(-15, Math.min(15, balance * 3));

  return (
    <div style={styles.container}>
      {/* Case Header */}
      {caseName && (
        <div style={styles.caseHeader}>
          <h3 style={styles.caseName}>{caseName}</h3>
        </div>
      )}

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <motion.div
            style={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${getProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div style={styles.progressStages}>
          <span style={{ ...styles.progressStage, ...(stage === 'collect' ? styles.progressStageActive : {}) }}>
            Collect Evidence
          </span>
          <span style={{ ...styles.progressStage, ...(stage === 'ai-arguments' ? styles.progressStageActive : {}) }}>
            AI Arguments
          </span>
          <span style={{ ...styles.progressStage, ...(stage === 'verdict' ? styles.progressStageActive : {}) }}>
            Verdict
          </span>
        </div>
      </div>

      {/* Clarity Points Badge */}
      {clarityPoints > 0 && (
        <div style={styles.badgeContainer}>
          <span style={styles.badge}>✨ {clarityPoints} Clarity Point{clarityPoints !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Stage 1: Collect Evidence */}
      {stage === 'collect' && (
        <>
          {!thought.trim() ? (
            <div style={styles.questionSection}>
              <label style={styles.label}>What is the thought you want to examine?</label>
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="Type your thought here..."
                style={styles.textarea}
              />
            </div>
          ) : (
            <>
              {/* Role Card */}
              <motion.div
                style={{
                  ...styles.roleCard,
                  borderColor: roleInfo.color,
                  backgroundColor: `${roleInfo.color}15`,
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div style={styles.roleIcon}>{roleInfo.icon}</div>
                <h4 style={styles.roleLabel}>{roleInfo.label}</h4>
                <p style={styles.roleDescription}>{roleInfo.description}</p>
              </motion.div>

              {/* Micro Challenge */}
              {getMicroChallenge() && (
                <div style={styles.challengeCard}>
                  <p style={styles.challengeText}>{getMicroChallenge()}</p>
                </div>
              )}

              {/* Scale Visual */}
              <div style={styles.scaleContainer}>
                <motion.div
                  style={styles.scale}
                  animate={{
                    rotate: rotation,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                  }}
                >
                  <div style={styles.scaleLeft}>
                    <span style={styles.scaleLabel}>For</span>
                    <span style={styles.scaleCount}>{evidenceFor.length}</span>
                  </div>
                  <div style={styles.scaleCenter}>⚖️</div>
                  <div style={styles.scaleRight}>
                    <span style={styles.scaleLabel}>Against</span>
                    <span style={styles.scaleCount}>{evidenceAgainst.length}</span>
                  </div>
                </motion.div>
              </div>

              {/* Evidence Input */}
              <div style={styles.evidenceSection}>
                <div style={styles.evidenceInput}>
                  <input
                    type="text"
                    value={currentEvidence}
                    onChange={(e) => setCurrentEvidence(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddEvidence();
                      }
                    }}
                    placeholder={`Add evidence ${evidenceType === 'for' ? 'for' : 'against'}...`}
                    style={styles.input}
                    disabled={aiLoading}
                    aria-label={`Add evidence ${evidenceType === 'for' ? 'for' : 'against'} the thought`}
                  />
                  <button
                    onClick={handleAddEvidence}
                    style={styles.addButton}
                    disabled={!currentEvidence.trim() || aiLoading}
                  >
                    Add
                  </button>
                </div>

                {/* Evidence Lists */}
                <div style={styles.evidenceLists}>
                  <div style={styles.evidenceList}>
                    <h4 style={styles.evidenceListTitle}>Evidence For:</h4>
                    {evidenceFor.length === 0 ? (
                      <p style={styles.emptyEvidence}>No evidence yet</p>
                    ) : (
                      evidenceFor.map((item, index) => (
                        <div key={index} style={styles.evidenceItem}>
                          <span>{item}</span>
                          <button
                            onClick={() => handleDeleteEvidence(index, 'for')}
                            style={styles.deleteButton}
                            aria-label="Delete evidence"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={styles.evidenceList}>
                    <h4 style={styles.evidenceListTitle}>Evidence Against:</h4>
                    {evidenceAgainst.length === 0 ? (
                      <p style={styles.emptyEvidence}>No evidence yet</p>
                    ) : (
                      evidenceAgainst.map((item, index) => (
                        <div key={index} style={styles.evidenceItem}>
                          <span>{item}</span>
                          <button
                            onClick={() => handleDeleteEvidence(index, 'against')}
                            style={styles.deleteButton}
                            aria-label="Delete evidence"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Advance to AI Stage Button */}
                {evidenceFor.length > 0 && evidenceAgainst.length > 0 && (
                  <button
                    onClick={() => {
                      setStage('ai-arguments');
                      fetchAISuggestions();
                    }}
                    style={styles.nextStageButton}
                  >
                    Continue to AI Arguments →
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Stage 2: AI Arguments */}
      {stage === 'ai-arguments' && (
        <div style={styles.aiStage}>
          <div style={{ ...styles.roleCard, borderColor: '#6366f1', backgroundColor: '#6366f115' }}>
            <div style={styles.roleIcon}>🤖</div>
            <h4 style={styles.roleLabel}>AI Co-Counsel</h4>
            <p style={styles.roleDescription}>Reflective questions and examples</p>
          </div>

          {aiLoading && (
            <div style={styles.loadingCard}>
              <div style={styles.spinner} />
              <p>Thinking of helpful questions...</p>
            </div>
          )}

          {aiError && (
            <div style={styles.errorCard}>
              <p>{aiError}</p>
            </div>
          )}

          {aiSuggestions && !aiLoading && (
            <motion.div
              style={styles.suggestionCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 style={styles.suggestionTitle}>Reflective Questions</h4>
              {aiSuggestions.questions.map((question, index) => (
                <div key={index} style={styles.questionChip}>
                  {question}
                </div>
              ))}

              <h4 style={styles.suggestionTitle}>Example Evidence (you can adapt these)</h4>
              <div style={styles.exampleGrid}>
                {aiSuggestions.exampleEvidenceFor.map((example, index) => (
                  <button
                    key={`for-${index}`}
                    style={{
                      ...styles.exampleChip,
                      ...(usedExamples.has(example) ? styles.exampleChipUsed : {}),
                    }}
                    onClick={() => handleUseExample(example, 'for')}
                    disabled={usedExamples.has(example)}
                  >
                    {example}
                  </button>
                ))}
                {aiSuggestions.exampleEvidenceAgainst.map((example, index) => (
                  <button
                    key={`against-${index}`}
                    style={{
                      ...styles.exampleChip,
                      ...(usedExamples.has(example) ? styles.exampleChipUsed : {}),
                    }}
                    onClick={() => handleUseExample(example, 'against')}
                    disabled={usedExamples.has(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div style={styles.stageControls}>
            <button
              onClick={() => setStage('collect')}
              style={styles.backButton}
            >
              ← Back to Evidence
            </button>
            <button
              onClick={() => {
                setStage('verdict');
                if (!verdict) fetchVerdict();
              }}
              style={{
                ...styles.nextStageButton,
                ...((evidenceFor.length === 0 || evidenceAgainst.length === 0) ? styles.nextStageButtonDisabled : {}),
              }}
              disabled={evidenceFor.length === 0 || evidenceAgainst.length === 0}
            >
              Continue to Verdict →
            </button>
          </div>
        </div>
      )}

      {/* Stage 3: Verdict */}
      {stage === 'verdict' && (
        <div style={styles.verdictStage}>
          <div style={{ ...styles.roleCard, borderColor: '#059669', backgroundColor: '#05966915' }}>
            <div style={styles.roleIcon}>⚖️</div>
            <h4 style={styles.roleLabel}>Judge's Bench</h4>
            <p style={styles.roleDescription}>Given everything on both sides, what's a more balanced way to say this thought?</p>
          </div>

          {aiLoading && !verdict && (
            <div style={styles.loadingCard}>
              <div style={styles.spinner} />
              <p>Considering the evidence...</p>
            </div>
          )}

          {verdict && !showCompletion && (
            <motion.div
              style={styles.verdictCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 style={styles.suggestionTitle}>Example Balanced Thoughts (you can edit these)</h4>
              {verdict.balancedThoughts.map((bt, index) => (
                <button
                  key={index}
                  style={styles.balancedThoughtChip}
                  onClick={() => setBalancedThought(bt.replace(/^Example: /i, '').trim())}
                >
                  {bt}
                </button>
              ))}
            </motion.div>
          )}

          <div style={styles.balancedThoughtInput}>
            <textarea
              value={balancedThought}
              onChange={(e) => setBalancedThought(e.target.value)}
              placeholder="Write your balanced thought here..."
              style={styles.balancedTextarea}
            />
            <button
              onClick={handleComplete}
              style={styles.completeButton}
              disabled={!balancedThought.trim()}
            >
              Complete Trial
            </button>
          </div>
        </div>
      )}

      {/* Completion Screen */}
      {showCompletion && verdict && (
        <motion.div
          style={styles.completionCard}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={styles.completionIcon}>✨</div>
          <h3 style={styles.completionTitle}>Trial Complete</h3>
          <p style={styles.completionMessage}>{verdict.encouragement}</p>
          <div style={styles.completionStats}>
            <p>Evidence Collected: {evidenceFor.length + evidenceAgainst.length}</p>
            <p>Clarity Points Earned: {clarityPoints}</p>
          </div>
          <div style={styles.finalBalancedThought}>
            <h4 style={styles.finalThoughtTitle}>Your Balanced Thought:</h4>
            <p style={styles.finalThoughtText}>{balancedThought}</p>
          </div>
          <button onClick={handleReset} style={styles.resetButton}>
            Start New Trial
          </button>
        </motion.div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '100%',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    boxSizing: 'border-box' as const,
    overflowX: 'hidden' as const,
  },
  caseHeader: {
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
  },
  caseName: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'var(--text-primary, #1a1a1a)',
    margin: 0,
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
    marginBottom: '0.5rem',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--border-color, #e0e0e0)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--primary, #2c5282)',
    borderRadius: '4px',
  },
  progressStages: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    color: 'var(--text-secondary, #666)',
  },
  progressStage: {
    opacity: 0.5,
  },
  progressStageActive: {
    opacity: 1,
    fontWeight: '600',
    color: 'var(--primary, #2c5282)',
  },
  badgeContainer: {
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.4rem 0.8rem',
    backgroundColor: 'var(--primary-light, #f0f4f8)',
    border: '1px solid var(--primary, #2c5282)',
    borderRadius: '1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--primary, #2c5282)',
  },
  questionSection: {
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  label: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: 'var(--text-primary, #1a1a1a)',
  },
  textarea: {
    width: '100%',
    minHeight: '80px',
    maxWidth: '100%',
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
  },
  roleCard: {
    padding: '1rem',
    border: '2px solid',
    borderRadius: '0.75rem',
    textAlign: 'center' as const,
    marginBottom: '0.75rem',
  },
  roleIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  roleLabel: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 0.25rem 0',
    color: 'var(--text-primary, #1a1a1a)',
  },
  roleDescription: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary, #666)',
    margin: 0,
    fontStyle: 'italic',
  },
  challengeCard: {
    padding: '0.75rem',
    backgroundColor: 'var(--primary-light, #f0f4f8)',
    border: '1px solid var(--primary, #2c5282)',
    borderRadius: '0.5rem',
    marginBottom: '0.75rem',
  },
  challengeText: {
    fontSize: '0.9rem',
    color: 'var(--primary, #2c5282)',
    margin: 0,
    textAlign: 'center' as const,
    fontWeight: '500',
  },
  scaleContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0.5rem 0',
    width: '100%',
    boxSizing: 'border-box' as const,
    overflowX: 'hidden' as const,
  },
  scale: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transformOrigin: 'center',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  scaleLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  scaleRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  scaleCenter: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  scaleLabel: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-secondary, #666)',
  },
  scaleCount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary, #2c5282)',
  },
  evidenceSection: {
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  evidenceInput: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    minWidth: 0,
    boxSizing: 'border-box' as const,
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--primary-color, #02295b)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    whiteSpace: 'nowrap' as const,
  },
  evidenceLists: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  evidenceList: {
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    minWidth: 0,
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
    maxHeight: '200px',
    overflowY: 'auto' as const,
  },
  evidenceListTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: 'var(--text-primary, #1a1a1a)',
  },
  evidenceItem: {
    padding: '0.5rem',
    marginBottom: '0.25rem',
    backgroundColor: 'var(--bg-primary, #fafaf9)',
    borderRadius: '0.25rem',
    fontSize: '0.9rem',
    color: 'var(--text-primary, #1a1a1a)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  },
  emptyEvidence: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary, #888)',
    fontStyle: 'italic',
    textAlign: 'center' as const,
    padding: '1rem 0',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary, #888)',
    cursor: 'pointer',
    fontSize: '1.5rem',
    padding: '0',
    lineHeight: 1,
    flexShrink: 0,
  },
  aiStage: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  loadingCard: {
    padding: '1.5rem',
    textAlign: 'center' as const,
    backgroundColor: 'var(--bg-primary, #fafaf9)',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color, #e0e0e0)',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid var(--border-color, #e0e0e0)',
    borderTopColor: 'var(--primary, #2c5282)',
    borderRadius: '50%',
    margin: '0 auto 0.5rem',
    animation: 'spin 1s linear infinite',
  },
  errorCard: {
    padding: '0.75rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '0.5rem',
    color: '#991b1b',
    fontSize: '0.9rem',
  },
  suggestionCard: {
    padding: '1rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '2px solid var(--primary, #2c5282)',
    borderRadius: '0.5rem',
  },
  suggestionTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    margin: '0 0 0.75rem 0',
    color: 'var(--text-primary, #1a1a1a)',
  },
  questionChip: {
    padding: '0.75rem',
    marginBottom: '0.5rem',
    backgroundColor: 'var(--primary-light, #f0f4f8)',
    border: '1px solid var(--primary, #2c5282)',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-primary, #1a1a1a)',
    textAlign: 'left' as const,
  },
  exampleGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  exampleChip: {
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--bg-primary, #fafaf9)',
    border: '1px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-primary, #1a1a1a)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  exampleChipUsed: {
    opacity: 0.5,
    cursor: 'not-allowed',
    textDecoration: 'line-through',
  },
  nextStageButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--primary-color, #02295b)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '0.5rem',
  },
  verdictStage: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  verdictCard: {
    padding: '1rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '2px solid var(--primary, #2c5282)',
    borderRadius: '0.5rem',
  },
  balancedThoughtChip: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    backgroundColor: 'var(--primary-light, #f0f4f8)',
    border: '1px solid var(--primary, #2c5282)',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-primary, #1a1a1a)',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  balancedThoughtInput: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  balancedTextarea: {
    width: '100%',
    minHeight: '100px',
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
  },
  completeButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--primary-color, #02295b)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  nextStageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  stageControls: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  backButton: {
    padding: '0.75rem 1rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #1a1a1a)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  completionCard: {
    padding: '2rem 1rem',
    textAlign: 'center' as const,
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '2px solid var(--primary, #2c5282)',
    borderRadius: '0.75rem',
  },
  completionIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  completionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.75rem 0',
    color: 'var(--text-primary, #1a1a1a)',
  },
  completionMessage: {
    fontSize: '1rem',
    color: 'var(--text-primary, #1a1a1a)',
    margin: '0 0 1rem 0',
    lineHeight: '1.5',
  },
  completionStats: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #666)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    marginBottom: '1rem',
  },
  finalBalancedThought: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--primary-light, #f0f4f8)',
    borderRadius: '0.5rem',
    border: '1px solid var(--primary, #2c5282)',
  },
  finalThoughtTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    color: 'var(--text-primary, #1a1a1a)',
  },
  finalThoughtText: {
    fontSize: '1rem',
    color: 'var(--text-primary, #1a1a1a)',
    margin: 0,
    lineHeight: '1.5',
    fontStyle: 'italic',
  },
  resetButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #1a1a1a)',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
};

// Add spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default RealityCheckTechnique;
