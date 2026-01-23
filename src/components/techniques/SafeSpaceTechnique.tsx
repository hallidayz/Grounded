import React, { useState } from 'react';
import { motion } from 'framer-motion';

const STAGES = [
  {
    name: 'Describe Place',
    duration: 120,
    instruction: 'Visualize a safe place (beach, forest, library)',
    prompt: 'What do you see?',
  },
  {
    name: 'Sensory Layering',
    duration: 120,
    instruction: 'Add sensory details',
    prompts: ['What is the temperature?', 'Who is there that loves you?', 'What sounds do you hear?'],
  },
  {
    name: 'Anchor',
    duration: 60,
    instruction: 'Associate this feeling with a physical gesture',
    prompt: 'Touch your heart and remember this feeling',
  },
];

const SafeSpaceTechnique: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [description, setDescription] = useState('');
  const [sensoryDetails, setSensoryDetails] = useState({
    temperature: '',
    people: '',
    sounds: '',
  });
  const [landscapeElements, setLandscapeElements] = useState<string[]>([]);

  const handleNext = () => {
    if (currentStage < STAGES.length - 1) {
      setCurrentStage((prev) => prev + 1);
    }
  };

  const handleAddElement = (element: string) => {
    if (element.trim() && !landscapeElements.includes(element)) {
      setLandscapeElements((prev) => [...prev, element]);
    }
  };

  const stage = STAGES[currentStage];

  return (
    <div style={styles.container}>
      <h3 style={styles.stageName}>{stage.name}</h3>
      <p style={styles.instruction}>{stage.instruction}</p>

      {currentStage === 0 && (
        <div style={styles.stageContent}>
          <p style={styles.prompt}>{stage.prompt}</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your safe place..."
            style={styles.textarea}
          />
          <div style={styles.landscapePreview}>
            {landscapeElements.map((element, index) => (
              <motion.div
                key={index}
                style={styles.landscapeElement}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                {element}
              </motion.div>
            ))}
          </div>
          <div style={styles.quickAdd}>
            <input
              type="text"
              placeholder="Add element (e.g., 'ocean', 'trees')..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddElement((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              style={styles.quickAddInput}
            />
          </div>
        </div>
      )}

      {currentStage === 1 && (
        <div style={styles.stageContent}>
          {stage.prompts?.map((prompt, index) => (
            <div key={index} style={styles.sensoryQuestion}>
              <label style={styles.label}>{prompt}</label>
              <input
                type="text"
                value={
                  index === 0
                    ? sensoryDetails.temperature
                    : index === 1
                    ? sensoryDetails.people
                    : sensoryDetails.sounds
                }
                onChange={(e) => {
                  if (index === 0) {
                    setSensoryDetails((prev) => ({ ...prev, temperature: e.target.value }));
                  } else if (index === 1) {
                    setSensoryDetails((prev) => ({ ...prev, people: e.target.value }));
                  } else {
                    setSensoryDetails((prev) => ({ ...prev, sounds: e.target.value }));
                  }
                }}
                style={styles.input}
                placeholder="Type your answer..."
              />
            </div>
          ))}
        </div>
      )}

      {currentStage === 2 && (
        <div style={styles.stageContent}>
          <p style={styles.prompt}>{stage.prompt}</p>
          <motion.div
            style={styles.heartGesture}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span style={styles.heartIcon}>💗</span>
          </motion.div>
        </div>
      )}

      <button onClick={handleNext} style={styles.nextButton} disabled={currentStage === STAGES.length - 1}>
        {currentStage === STAGES.length - 1 ? 'Complete' : 'Next'}
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minHeight: '400px',
  },
  stageName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: 'var(--text-primary, #1a1a1a)',
  },
  instruction: {
    fontSize: '1rem',
    color: 'var(--text-secondary, #666)',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  stageContent: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  prompt: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: 'var(--text-primary, #1a1a1a)',
    marginBottom: '0.5rem',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  landscapePreview: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-primary, #fafaf9)',
    borderRadius: '0.5rem',
    minHeight: '100px',
  },
  landscapeElement: {
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--primary-light, #f0f4f8)',
    border: '1px solid var(--primary-color, #02295b)',
    borderRadius: '1rem',
    fontSize: '0.9rem',
    color: 'var(--text-primary, #1a1a1a)',
  },
  quickAdd: {
    display: 'flex',
    gap: '0.5rem',
  },
  quickAddInput: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
  },
  sensoryQuestion: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '1rem',
    fontWeight: '500',
    color: 'var(--text-primary, #1a1a1a)',
  },
  input: {
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
  },
  heartGesture: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '150px',
    height: '150px',
    margin: '2rem auto',
  },
  heartIcon: {
    fontSize: '5rem',
    filter: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.5))',
  },
  nextButton: {
    marginTop: '2rem',
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--primary-color, #02295b)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },
};

export default SafeSpaceTechnique;
