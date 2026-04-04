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
    const technique = TECHNIQUES.find(t => t.id === selectedTechnique);
    return (
      <TechniqueWrapper
        techniqueId={selectedTechnique}
        techniqueName={technique?.name || ''}
        energyLevel="high"
        duration={300}
        onComplete={onComplete}
        bestFor={technique?.bestFor}
        description={technique?.description}
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

export default HighEnergyTechniques;
