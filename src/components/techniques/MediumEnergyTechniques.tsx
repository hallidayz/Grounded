import React from 'react';
import TechniqueWrapper from '../TechniqueWrapper';
import ThoughtStreamTechnique from './ThoughtStreamTechnique';
import SelfCompassionBreakTechnique from './SelfCompassionBreakTechnique';
import RealityCheckTechnique from './RealityCheckTechnique';

interface MediumEnergyTechniquesProps {
  selectedTechnique: string | null;
  onTechniqueSelect: (techniqueId: string) => void;
  onComplete: () => void;
}

const TECHNIQUES = [
  {
    id: 'thought-stream',
    name: 'The Thought Stream',
    description: 'Defusion',
    bestFor: 'Overthinking or "Sticky" thoughts',
    image: '/exercise-thought-stream.svg',
  },
  {
    id: 'self-compassion-break',
    name: 'The Self-Compassion Break',
    description: 'Based on Dr. Kristin Neff\'s work',
    bestFor: 'Self-criticism or "not enough-ness"',
    image: '/exercise-self-compassion.svg',
  },
  {
    id: 'reality-check',
    name: 'The Reality Check',
    description: 'Cognitive Distortions',
    bestFor: 'Catastrophizing',
    image: '/exercise-reality-check.svg',
  },
];

const MediumEnergyTechniques: React.FC<MediumEnergyTechniquesProps> = ({
  selectedTechnique,
  onTechniqueSelect,
  onComplete,
}) => {
  if (selectedTechnique) {
    return (
      <TechniqueWrapper
        techniqueId={selectedTechnique}
        techniqueName={TECHNIQUES.find(t => t.id === selectedTechnique)?.name || ''}
        energyLevel="medium"
        duration={120}
        onComplete={onComplete}
        bestFor={TECHNIQUES.find(t => t.id === selectedTechnique)?.bestFor}
        description={TECHNIQUES.find(t => t.id === selectedTechnique)?.description}
      >
        {selectedTechnique === 'thought-stream' && (
          <ThoughtStreamTechnique />
        )}
        {selectedTechnique === 'self-compassion-break' && (
          <SelfCompassionBreakTechnique />
        )}
        {selectedTechnique === 'reality-check' && (
          <RealityCheckTechnique />
        )}
      </TechniqueWrapper>
    );
  }

  return (
    <div style={styles.container}>
      <p style={styles.subtext}>
        Quick interventions to shift the nervous system or cognitive perspective.
      </p>
      <div style={styles.optionsGrid}>
        {TECHNIQUES.map((technique) => (
          <button
            key={technique.id}
            style={styles.optionButton}
            onClick={() => onTechniqueSelect(technique.id)}
          >
            <div style={styles.optionHeader}>
              <img src={technique.image} alt={technique.name} style={styles.optionImage} />
              <h4 style={styles.optionName}>{technique.name}</h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    padding: '0.5rem',
  },
  subtext: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #666)',
    textAlign: 'center' as const,
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '0.75rem',
  },
  optionButton: {
    display: 'flex',
    flexDirection: 'row' as const,
    padding: '1rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
    alignItems: 'center' as const,
    minHeight: '64px',
    gap: '1rem',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
  },
  optionHeader: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: '1rem',
    flex: 1,
  },
  optionImage: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
    flexShrink: 0,
  },
  optionName: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: 0,
    color: 'var(--text-primary, #1a1a1a)',
    lineHeight: '1.3',
  },
};

export default MediumEnergyTechniques;
