import React from 'react';
import TechniqueWrapper from '../TechniqueWrapper';
import RAINMethodTechnique from './RAINMethodTechnique';
import SafeSpaceTechnique from './SafeSpaceTechnique';
import CompassionateLetterTechnique from './CompassionateLetterTechnique';

interface HighEnergyTechniquesProps {
  selectedTechnique: string | null;
  onTechniqueSelect: (techniqueId: string) => void;
  onComplete: () => void;
}

const TECHNIQUES = [
  {
    id: 'rain-method',
    name: 'The RAIN Method',
    description: 'Compassionate Inquiry',
    bestFor: 'De-shaming and emotional processing',
    image: '/exercise-rain-method.svg',
  },
  {
    id: 'safe-space',
    name: 'The Safe Space',
    description: 'Imagery Rescripting',
    bestFor: 'High stress or trauma triggers',
    image: '/exercise-safe-space.svg',
  },
  {
    id: 'compassionate-letter',
    name: 'The Compassionate Letter',
    description: 'Perspective Taking',
    bestFor: 'Intense guilt or shame',
    image: '/exercise-compassionate-letter.svg',
  },
];

const HighEnergyTechniques: React.FC<HighEnergyTechniquesProps> = ({
  selectedTechnique,
  onTechniqueSelect,
  onComplete,
}) => {
  if (selectedTechnique) {
    return (
      <TechniqueWrapper
        techniqueId={selectedTechnique}
        techniqueName={TECHNIQUES.find(t => t.id === selectedTechnique)?.name || ''}
        energyLevel="high"
        duration={300}
        onComplete={onComplete}
        bestFor={TECHNIQUES.find(t => t.id === selectedTechnique)?.bestFor}
        description={TECHNIQUES.find(t => t.id === selectedTechnique)?.description}
      >
        {selectedTechnique === 'rain-method' && (
          <RAINMethodTechnique />
        )}
        {selectedTechnique === 'safe-space' && (
          <SafeSpaceTechnique />
        )}
        {selectedTechnique === 'compassionate-letter' && (
          <CompassionateLetterTechnique />
        )}
      </TechniqueWrapper>
    );
  }

  return (
    <div style={styles.container}>
      <p style={styles.subtext}>
        Deeply restorative work for when you have the capacity to sit with your feelings.
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
    padding: '1rem',
  },
  subtext: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #666)',
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
    fontStyle: 'italic',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  optionButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '0.75rem 0.5rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
    alignItems: 'center' as const,
    minHeight: '100px',
  },
  optionHeader: {
    marginBottom: '0.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: '0.25rem',
  },
  optionImage: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
  },
  optionName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    margin: '0 0 0.15rem 0',
    color: 'var(--text-primary, #1a1a1a)',
    lineHeight: '1.2',
  },
};

export default HighEnergyTechniques;
