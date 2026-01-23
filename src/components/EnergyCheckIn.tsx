import React, { useState, useCallback } from 'react';
import EnergySelection from './EnergySelection';
import TechniqueCard from './TechniqueCard';
import { logEnergySelection } from '../services/energyTrackingService';

export type EnergyLevel = 'low' | 'medium' | 'high';

interface EnergyCheckInProps {
  onComplete?: () => void;
  onReturnHome?: () => void;
}

const EnergyCheckIn: React.FC<EnergyCheckInProps> = ({ onComplete, onReturnHome }) => {
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);

  const handleEnergySelect = useCallback((energy: EnergyLevel) => {
    setSelectedEnergy(energy);
    setSelectedTechnique(null); // Reset technique when energy changes
    // Log energy selection
    logEnergySelection(energy).catch(console.error);
  }, []);

  const handleTechniqueSelect = useCallback((techniqueId: string) => {
    setSelectedTechnique(techniqueId);
  }, []);

  const handleTechniqueComplete = useCallback(() => {
    // Reset state and return to home
    setSelectedEnergy(null);
    setSelectedTechnique(null);
    onReturnHome?.();
  }, [onReturnHome]);

  const handleBackToSelection = useCallback(() => {
    setSelectedTechnique(null);
    setSelectedEnergy(null); // Go back to energy selection
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {!selectedEnergy ? (
        <EnergySelection onSelect={handleEnergySelect} />
      ) : (
        <TechniqueCard
          energyLevel={selectedEnergy}
          selectedTechnique={selectedTechnique}
          onTechniqueSelect={handleTechniqueSelect}
          onComplete={handleTechniqueComplete}
          onBack={handleBackToSelection}
        />
      )}
    </div>
  );
};

export default EnergyCheckIn;
