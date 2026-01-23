import React from 'react';
import type { EnergyLevel } from './EnergyCheckIn';

interface EnergySelectionProps {
  onSelect: (energy: EnergyLevel) => void;
}

const ENERGY_OPTIONS: Array<{
  level: EnergyLevel;
  label: string;
  description: string;
  image: string;
}> = [
  {
    level: 'low',
    label: 'Low / Drained',
    description: 'Heavy, tired, hard to move.',
    image: '/energy-low.svg',
  },
  {
    level: 'medium',
    label: 'Medium / Managing',
    description: 'Getting through, not great, not awful.',
    image: '/energy-medium.svg',
  },
  {
    level: 'high',
    label: 'High / Wired',
    description: 'On edge, restless, keyed up.',
    image: '/energy-high.svg',
  },
];

const EnergySelection: React.FC<EnergySelectionProps> = ({ onSelect }) => {
  const [selectedEnergy, setSelectedEnergy] = React.useState<EnergyLevel | null>(null);

  const handleClick = (energy: EnergyLevel) => {
    setSelectedEnergy(energy);
    onSelect(energy);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>How is your energy right now?</h2>
        <p style={styles.subtext}>Pick one that fits right now. There's no wrong answer.</p>
      </div>
      
      <div style={styles.buttonsContainer}>
        {ENERGY_OPTIONS.map((option) => (
          <button
            key={option.level}
            style={{
              ...styles.button,
              ...(selectedEnergy === option.level ? styles.buttonSelected : {}),
            }}
            onClick={() => handleClick(option.level)}
          >
            <img src={option.image} alt={option.label} style={styles.buttonImage} />
            <span style={styles.buttonLabel}>{option.label}</span>
            {selectedEnergy === option.level && (
              <span style={styles.description}>{option.description}</span>
            )}
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
  header: {
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    color: 'var(--text-primary, #1a1a1a)',
  },
  subtext: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #666)',
    margin: 0,
  },
  buttonsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    width: '100%',
  },
  button: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem 0.5rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '80px',
    gap: '0.5rem',
  },
  buttonImage: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
  },
  buttonSelected: {
    borderColor: 'var(--primary-color, #02295b)',
    backgroundColor: 'var(--primary-light, #f0f4f8)',
    boxShadow: '0 2px 8px rgba(2, 41, 91, 0.15)',
  },
  buttonLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1a1a1a)',
    textAlign: 'center' as const,
  },
  description: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary, #666)',
    marginTop: '0.5rem',
    textAlign: 'center' as const,
    fontStyle: 'italic',
  },
};

export default EnergySelection;
