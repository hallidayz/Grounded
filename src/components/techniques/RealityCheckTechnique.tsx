import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';

const RealityCheckTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
}) => {
  // This component manages its own state for user input
  // Props are optional - can work standalone or with SessionEngine
  const [thought, setThought] = useState('');
  const [evidenceFor, setEvidenceFor] = useState<string[]>([]);
  const [evidenceAgainst, setEvidenceAgainst] = useState<string[]>([]);
  const [currentEvidence, setCurrentEvidence] = useState('');
  const [evidenceType, setEvidenceType] = useState<'for' | 'against'>('for');

  const handleAddEvidence = () => {
    if (!currentEvidence.trim()) return;

    if (evidenceType === 'for') {
      setEvidenceFor((prev) => [...prev, currentEvidence]);
    } else {
      setEvidenceAgainst((prev) => [...prev, currentEvidence]);
    }

    setCurrentEvidence('');
  };

  const balance = evidenceFor.length - evidenceAgainst.length;
  const rotation = Math.max(-15, Math.min(15, balance * 3));

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Evidence Trial</h3>

      <div style={styles.questionSection}>
        <label style={styles.label}>What is the thought?</label>
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="Type your thought here..."
          style={styles.textarea}
        />
      </div>

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

      <div style={styles.evidenceSection}>
        <div style={styles.evidenceTypeSelector}>
          <button
            style={{
              ...styles.typeButton,
              ...(evidenceType === 'for' ? styles.typeButtonActive : {}),
            }}
            onClick={() => setEvidenceType('for')}
          >
            Evidence For
          </button>
          <button
            style={{
              ...styles.typeButton,
              ...(evidenceType === 'against' ? styles.typeButtonActive : {}),
            }}
            onClick={() => setEvidenceType('against')}
          >
            Evidence Against
          </button>
        </div>

        <div style={styles.evidenceInput}>
          <input
            type="text"
            value={currentEvidence}
            onChange={(e) => setCurrentEvidence(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEvidence()}
            placeholder={`Add evidence ${evidenceType === 'for' ? 'for' : 'against'}...`}
            style={styles.input}
          />
          <button onClick={handleAddEvidence} style={styles.addButton}>
            Add
          </button>
        </div>

        <div style={styles.evidenceLists}>
          <div style={styles.evidenceList}>
            <h4 style={styles.evidenceListTitle}>Evidence For:</h4>
            {evidenceFor.map((item, index) => (
              <div key={index} style={styles.evidenceItem}>
                {item}
              </div>
            ))}
          </div>
          <div style={styles.evidenceList}>
            <h4 style={styles.evidenceListTitle}>Evidence Against:</h4>
            {evidenceAgainst.map((item, index) => (
              <div key={index} style={styles.evidenceItem}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    maxHeight: 'calc(100svh - 200px)', // Fit between header and footer
    overflowY: 'auto' as const,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    color: 'var(--text-primary, #1a1a1a)',
  },
  questionSection: {
    width: '100%',
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
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  scaleContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem 0',
  },
  scale: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    transformOrigin: 'center',
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
    fontSize: '2.5rem',
  },
  scaleLabel: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-secondary, #666)',
  },
  scaleCount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary, #2c5282)', // Use CSS variable that adapts to dark mode
  },
  evidenceSection: {
    width: '100%',
  },
  evidenceTypeSelector: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  typeButton: {
    flex: 1,
    padding: '0.75rem',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  typeButtonActive: {
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'var(--primary-color, #02295b)',
    backgroundColor: 'var(--primary-light, #f0f4f8)',
    color: 'var(--primary-color, #02295b)',
  },
  evidenceInput: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
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
  },
  evidenceLists: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  evidenceList: {
    padding: '1rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
  },
  evidenceListTitle: {
    fontSize: '1rem',
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
  },
};

export default RealityCheckTechnique;
