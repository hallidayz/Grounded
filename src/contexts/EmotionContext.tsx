import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmotionState {
  primaryEmotion: string | null;
  subEmotion: string | null;
  source: 'dashboard' | 'checkin' | null;
}

interface EmotionContextType {
  emotionState: EmotionState;
  setPrimaryEmotion: (emotion: string | null, source: 'dashboard' | 'checkin') => void;
  setSubEmotion: (subEmotion: string | null) => void;
  clearEmotions: () => void;
}

const defaultState: EmotionState = {
  primaryEmotion: null,
  subEmotion: null,
  source: null,
};

export const EmotionContext = createContext<EmotionContextType>({
  emotionState: defaultState,
  setPrimaryEmotion: () => {},
  setSubEmotion: () => {},
  clearEmotions: () => {},
});

export const EmotionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [emotionState, setEmotionState] = useState<EmotionState>(defaultState);

  const setPrimaryEmotion = (emotion: string | null, source: 'dashboard' | 'checkin') => {
    setEmotionState(prev => ({
      ...prev,
      primaryEmotion: emotion,
      source,
      subEmotion: emotion !== prev.primaryEmotion ? null : prev.subEmotion,
    }));
  };

  const setSubEmotion = (subEmotion: string | null) => {
    setEmotionState(prev => ({ ...prev, subEmotion }));
  };

  const clearEmotions = () => {
    setEmotionState(defaultState);
  };

  return (
    <EmotionContext.Provider value={{ emotionState, setPrimaryEmotion, setSubEmotion, clearEmotions }}>
      {children}
    </EmotionContext.Provider>
  );
};

export const useEmotion = () => useContext(EmotionContext);