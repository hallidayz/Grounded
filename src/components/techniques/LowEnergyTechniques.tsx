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
              <span style={styles.optionType}>{technique.description}</span>
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
    gap: '0.5rem', // Tighter gap to match app style
  },
  optionButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '8px 12px', // Compact padding to match app style
    border: '1px solid var(--border, rgba(0,0,0,0.1))',
    borderRadius: '12px', // Match app button border radius
    backgroundColor: 'var(--bg-card, #ffffff)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
    alignItems: 'center' as const,
    minHeight: 'auto', // Remove fixed height
  },
  optionHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: '0.2rem',
  },
  optionIcon: {
    fontSize: '1.5rem', // Smaller icon
    marginBottom: '0.2rem',
  },
  optionName: {
    fontSize: '0.8rem', // Smaller font to match app style
    fontWeight: '600',
    margin: 0,
    color: 'var(--text-primary, #1a1a1a)',
  },
  optionType: {
    fontSize: '0.65rem', // Smaller font
    color: 'var(--text-secondary, #666)',
    fontStyle: 'italic',
  },
};

export default LowEnergyTechniques;
