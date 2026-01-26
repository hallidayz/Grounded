import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';

interface Thought {
  id: string;
  text: string;
  x: number;
  y: number;
  onLeaf: boolean;
}

const ThoughtStreamTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
}) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [leaves, setLeaves] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const thoughtIdRef = useRef(0);

  useEffect(() => {
    // Create initial leaves floating down
    const createLeaf = () => {
      const id = `leaf-${Date.now()}-${Math.random()}`;
      const x = Math.random() * 100;
      return { id, x, y: -10 };
    };

    const interval = setInterval(() => {
      setLeaves((prev) => {
        const newLeaves = [...prev, createLeaf()];
        // Remove leaves that have floated off screen
        return newLeaves.filter((leaf) => leaf.y < 110);
      });
    }, 2000);

    // Animate leaves floating down
    const animateLeaves = setInterval(() => {
      setLeaves((prev) =>
        prev.map((leaf) => ({
          ...leaf,
          y: leaf.y + 0.5,
        }))
      );
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(animateLeaves);
    };
  }, []);

  const handleAddThought = () => {
    if (!inputValue.trim()) return;

    const newThought: Thought = {
      id: `thought-${thoughtIdRef.current++}`,
      text: inputValue,
      x: Math.random() * 80 + 10,
      y: Math.random() * 40 + 20,
      onLeaf: false,
    };

    setThoughts((prev) => [...prev, newThought]);
    setInputValue('');
  };

  const handleDragEnd = (thoughtId: string, event: any) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((event.x - rect.left) / rect.width) * 100;
    const y = ((event.y - rect.top) / rect.height) * 100;

    // Check if thought is near a leaf
    const nearbyLeaf = leaves.find((leaf) => Math.abs(leaf.x - x) < 5 && Math.abs(leaf.y - y) < 10);

    if (nearbyLeaf) {
      setThoughts((prev) =>
        prev.map((thought) =>
          thought.id === thoughtId ? { ...thought, onLeaf: true, x: nearbyLeaf.x, y: nearbyLeaf.y } : thought
        )
      );
    } else {
      setThoughts((prev) =>
        prev.map((thought) => (thought.id === thoughtId ? { ...thought, x, y } : thought))
      );
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Leaves on a Stream</h3>
      <p style={styles.instruction}>
        Type a thought and drag it onto a floating leaf. Watch it float away.
      </p>

      <div style={styles.inputContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddThought()}
          placeholder="Type a thought..."
          style={styles.input}
        />
        <button onClick={handleAddThought} style={styles.addButton}>
          Add
        </button>
      </div>

      <div ref={containerRef} style={styles.streamContainer}>
        {/* River background */}
        <div style={styles.river} />
        
        {/* Floating leaves */}
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            style={{
              ...styles.leaf,
              left: `${leaf.x}%`,
              top: `${leaf.y}%`,
            }}
            animate={{
              y: [0, -5, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            🍃
          </motion.div>
        ))}

        {/* Thoughts */}
        {thoughts.map((thought) => (
          <motion.div
            key={thought.id}
            style={{
              ...styles.thought,
              left: `${thought.x}%`,
              top: `${thought.y}%`,
              opacity: thought.onLeaf ? 0.7 : 1,
            }}
            drag
            dragMomentum={false}
            onDragEnd={(e, info) => handleDragEnd(thought.id, info)}
            animate={{
              y: thought.onLeaf ? [0, -100] : 0,
              opacity: thought.onLeaf ? [1, 0] : 1,
            }}
            transition={{
              y: { duration: 3 },
              opacity: { duration: 3 },
            }}
          >
            {thought.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '100%',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.75rem',
    boxSizing: 'border-box' as const,
    overflowX: 'hidden' as const,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
    color: 'var(--text-primary, #1a1a1a)',
  },
  instruction: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #666)',
    margin: 0,
    textAlign: 'center' as const,
  },
  inputContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    width: '100%',
    maxWidth: '400px',
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
  streamContainer: {
    width: '100%',
    height: '400px',
    position: 'relative' as const,
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  river: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, #e3f2fd, #90caf9)',
    opacity: 0.3,
  },
  leaf: {
    position: 'absolute' as const,
    fontSize: '2rem',
    pointerEvents: 'none' as const,
  },
  thought: {
    position: 'absolute' as const,
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '2px solid var(--primary-color, #02295b)',
    borderRadius: '1rem',
    fontSize: '0.9rem',
    cursor: 'grab',
    maxWidth: '150px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
};

export default ThoughtStreamTechnique;
