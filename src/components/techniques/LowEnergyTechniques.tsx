import React, { useState } from 'react';
import TechniqueWrapper from '../TechniqueWrapper';
import GroundingFlashTechnique from './GroundingFlashTechnique';
import WeightDropTechnique from './WeightDropTechnique';
import SensorySnapTechnique from './SensorySnapTechnique';
import CompassionateTouchTechnique from './CompassionateTouchTechnique';

interface LowEnergyTechniquesProps {
  selectedTechnique: string | null;
  onTechniqueSelect: (techniqueId: string) => void;
  onComplete: () => void;
}

const TECHNIQUES = [
  {
    id: 'grounding-flash',
    name: 'The Grounding Flash',
    description: 'Breath-Led',
    icon: '⚡',
    bestFor: 'Feeling "tight" or panicked',
  },
  {
    id: 'weight-drop',
    name: 'The Weight Drop',
    description: 'Body-Led',
    icon: '🪨',
    bestFor: 'High irritability, clenched teeth, or "on-edge" feeling',
  },
  {
    id: 'sensory-snap',
    name: 'The Sensory Snap',
    description: 'Senses-Led',
    icon: '👌',
    bestFor: 'Dissociation, "spacing out," or intense rumination',
  },
  {
    id: 'compassionate-touch',
    name: 'The Compassionate Touch',
    description: 'Emotional-Led',
    icon: '🤗',
    bestFor: 'Self-loathing, shame spirals, or feeling "unraveled"',
  },
];

const LowEnergyTechniques: React.FC<LowEnergyTechniquesProps> = ({
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
        energyLevel="low"
        duration={10}
        onComplete={onComplete}
        bestFor={technique?.bestFor}
        description={technique?.description}
      >
        {selectedTechnique === 'grounding-flash' && (
          <GroundingFlashTechnique bestFor={technique?.bestFor} />
        )}
        {selectedTechnique === 'weight-drop' && (
          <WeightDropTechnique bestFor={technique?.bestFor} />
        )}
        {selectedTechnique === 'sensory-snap' && (
          <SensorySnapTechnique bestFor={technique?.bestFor} />
        )}
        {selectedTechnique === 'compassionate-touch' && (
          <CompassionateTouchTechnique bestFor={technique?.bestFor} />
        )}
      </TechniqueWrapper>
    );
  }

  return (
    <div style={styles.container}>
      <p style={styles.subtext}>
        Quick interventions to shift perspective.
      </p>
      <div style={styles.optionsGrid}>
        {TECHNIQUES.map((technique) => (
          <button
            key={technique.id}
            style={styles.optionButton}
            onClick={() => onTechniqueSelect(technique.id)}
          >
            <div style={styles.optionHeader}>
              <span style={styles.optionIcon}>{technique.icon}</span>
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
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  optionButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
    alignItems: 'center' as const,
    minHeight: '120px',
  },
  optionHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  optionIcon: {
    fontSize: '2rem',
    marginBottom: '0.25rem',
  },
  optionName: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 0.25rem 0',
    color: 'var(--text-primary, #1a1a1a)',
  },
  optionType: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary, #666)',
    fontStyle: 'italic',
  },
};

export default LowEnergyTechniques;
