import React, { useState } from 'react';
import type { EnergyLevel } from './EnergyCheckIn';
import LowEnergyTechniques from './techniques/LowEnergyTechniques';
import MediumEnergyTechniques from './techniques/MediumEnergyTechniques';
import HighEnergyTechniques from './techniques/HighEnergyTechniques';
import { logTechniqueSelection } from '../services/energyTrackingService';

interface TechniqueCardProps {
  energyLevel: EnergyLevel;
  selectedTechnique: string | null;
  onTechniqueSelect: (techniqueId: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

const getTechniqueDuration = (energyLevel: EnergyLevel): number => {
  switch (energyLevel) {
    case 'low':
      return 10;
    case 'medium':
      return 120;
    case 'high':
      return 300;
    default:
      return 0;
  }
};

const getTechniqueName = (energyLevel: EnergyLevel, techniqueId: string): string => {
  // Import technique names from the technique components
  if (energyLevel === 'low') {
    const lowTechniques: Record<string, string> = {
      'grounding-flash': 'The Grounding Flash',
      'weight-drop': 'The Weight Drop',
      'sensory-snap': 'The Sensory Snap',
      'compassionate-touch': 'The Compassionate Touch',
    };
    return lowTechniques[techniqueId] || techniqueId;
  } else if (energyLevel === 'medium') {
    const mediumTechniques: Record<string, string> = {
      'thought-stream': 'The Thought Stream',
      'self-compassion-break': 'The Self-Compassion Break',
      'reality-check': 'The Reality Check',
    };
    return mediumTechniques[techniqueId] || techniqueId;
  } else if (energyLevel === 'high') {
    const highTechniques: Record<string, string> = {
      'rain-method': 'The RAIN Method',
      'safe-space': 'The Safe Space',
      'compassionate-letter': 'The Compassionate Letter',
    };
    return highTechniques[techniqueId] || techniqueId;
  }
  return techniqueId;
};

const TechniqueCard: React.FC<TechniqueCardProps> = ({
  energyLevel,
  selectedTechnique,
  onTechniqueSelect,
  onComplete,
  onBack,
}) => {
  const handleTechniqueSelect = (techniqueId: string) => {
    onTechniqueSelect(techniqueId);
  };
  const getCardTitle = () => {
    switch (energyLevel) {
      case 'low':
        return 'Tiny step for low energy';
      case 'medium':
        return '2-minute reset';
      case 'high':
        return '5-minute deep support';
      default:
        return '';
    }
  };

  const getDurationPill = () => {
    switch (energyLevel) {
      case 'low':
        return '≈ 10 seconds';
      case 'medium':
        return '≈ 2 minutes';
      case 'high':
        return '≈ 5 minutes';
      default:
        return '';
    }
  };

  const [isBackHovered, setIsBackHovered] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          style={{
            ...styles.backButton,
            ...(isBackHovered ? { opacity: 1 } : {})
          }} 
          onClick={onBack} 
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
          aria-label="Back to energy selection"
        >
          ← Back
        </button>
        <h3 style={styles.cardTitle}>{getCardTitle()}</h3>
        <span style={styles.durationPill}>{getDurationPill()}</span>
      </div>

      <div style={styles.content}>
        {energyLevel === 'low' && (
          <LowEnergyTechniques
            selectedTechnique={selectedTechnique}
            onTechniqueSelect={(techniqueId) => {
              handleTechniqueSelect(techniqueId);
              const techniqueName = getTechniqueName(energyLevel, techniqueId);
              logTechniqueSelection(energyLevel, techniqueId, techniqueName).catch(console.error);
            }}
            onComplete={onComplete}
          />
        )}
        {energyLevel === 'medium' && (
          <MediumEnergyTechniques
            selectedTechnique={selectedTechnique}
            onTechniqueSelect={(techniqueId) => {
              handleTechniqueSelect(techniqueId);
              const techniqueName = getTechniqueName(energyLevel, techniqueId);
              logTechniqueSelection(energyLevel, techniqueId, techniqueName).catch(console.error);
            }}
            onComplete={onComplete}
          />
        )}
        {energyLevel === 'high' && (
          <HighEnergyTechniques
            selectedTechnique={selectedTechnique}
            onTechniqueSelect={(techniqueId) => {
              handleTechniqueSelect(techniqueId);
              const techniqueName = getTechniqueName(energyLevel, techniqueId);
              logTechniqueSelection(energyLevel, techniqueId, techniqueName).catch(console.error);
            }}
            onComplete={onComplete}
          />
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    padding: '0.75rem',
  },
  header: {
    marginBottom: '0.75rem',
    position: 'relative' as const,
  },
  backButton: {
    position: 'absolute' as const,
    left: 0,
    top: '-0.25rem',
    background: 'none',
    border: 'none',
    color: 'var(--text-primary, #1a1a1a)',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '500',
    padding: '8px 12px',
    opacity: 0.8,
    transition: 'opacity 0.2s ease',
    zIndex: 10,
    minHeight: '44px',
    minWidth: '44px',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 0.25rem 0',
    textAlign: 'center' as const,
    color: 'var(--text-primary, #1a1a1a)',
  },
  durationPill: {
    display: 'block',
    textAlign: 'center' as const,
    fontSize: '0.8rem',
    color: 'var(--text-secondary, #666)',
    fontStyle: 'italic',
    marginBottom: '0.5rem',
  },
  content: {
    width: '100%',
  },
};

export default TechniqueCard;
