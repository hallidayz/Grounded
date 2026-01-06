
import React, { useState, useMemo, useEffect } from 'react';
import { ALL_VALUES } from '../constants';
import { ValueItem } from '../types';

interface ValueSelectionProps {
  initialSelected: string[];
  onComplete: (ids: string[]) => void;
  isReorderingOnly?: boolean;
  onAddGoal?: (valueId: string) => void;
  goals?: Array<{ valueId: string }>;
}

const ValueSelection: React.FC<ValueSelectionProps> = ({ initialSelected, onComplete, isReorderingOnly = false, onAddGoal, goals = [] }) => {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Default to sort view if already have selections, fulfilling the "default to prioritize" requirement
  const [viewMode, setViewMode] = useState<'pick' | 'sort'>(initialSelected.length > 0 ? 'sort' : 'pick');
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const groupedValues = useMemo(() => {
    return ALL_VALUES.reduce((acc, value) => {
      if (!acc[value.category]) acc[value.category] = [];
      acc[value.category].push(value);
      return acc;
    }, {} as Record<string, ValueItem[]>);
  }, []);

  const selectedObjects = useMemo(() => {
    return selected.map(id => ALL_VALUES.find(v => v.id === id)).filter(Boolean) as ValueItem[];
  }, [selected]);

  const toggleValue = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      if (prev.length >= 10) {
        setShakeId(id);
        setTimeout(() => setShakeId(null), 500);
        return prev;
      }
      return [...prev, id];
    });
  };

  const moveValue = (index: number, direction: 'up' | 'down') => {
    const newSelected = [...selected];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSelected.length) return;
    [newSelected[index], newSelected[targetIndex]] = [newSelected[targetIndex], newSelected[index]];
    setSelected(newSelected);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); 
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newSelected = [...selected];
    const itemToMove = newSelected.splice(draggedIndex, 1)[0];
    newSelected.splice(index, 0, itemToMove);
    setSelected(newSelected);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4 animate-fade-in pb-20 sm:pb-24">
      <div className="text-center space-y-2 px-3 sm:px-0">
        <h1 className="text-lg sm:text-xl font-black text-text-primary dark:text-white tracking-tight">
          {/* PREV: text-yellow-warm */}
          {viewMode === 'pick' ? 'Define Your ' : 'Rank Your '}<span className="text-brand dark:text-brand-light">Compass</span>
        </h1>
        <div className="flex justify-center gap-1 mt-1">
           <button 
             onClick={() => setViewMode('pick')}
             /* PREV: bg-yellow-warm */
             className={`px-3 py-1 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-widest transition-all ${viewMode === 'pick' ? 'bg-brand dark:bg-brand-light text-white dark:text-navy-dark shadow-sm' : 'bg-white dark:bg-dark-bg-primary text-text-primary/60 dark:text-white/60 border border-border-soft dark:border-dark-border/30'}`}
           >
             Selection
           </button>
           <button 
             onClick={() => setViewMode('sort')}
             disabled={selected.length === 0}
             /* PREV: bg-yellow-warm */
             className={`px-3 py-1 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-widest transition-all ${viewMode === 'sort' ? 'bg-brand dark:bg-brand-light text-white dark:text-navy-dark shadow-sm' : 'bg-white dark:bg-dark-bg-primary text-text-primary/60 dark:text-white/60 border border-border-soft dark:border-dark-border/30'} disabled:opacity-30`}
           >
             Priority
           </button>
        </div>
      </div>

      {viewMode === 'pick' ? (
        <div className="space-y-3">
          {(Object.entries(groupedValues) as [string, ValueItem[]][]).map(([category, items]) => {
            const isCollapsed = collapsedCategories.has(category);
            const selectedInCategory = items.filter(v => selected.includes(v.id)).length;
            
            return (
              <section key={category} className="bg-white dark:bg-dark-bg-primary rounded-xl border border-border-soft dark:border-dark-border/30 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-3 bg-bg-secondary/50 dark:bg-dark-bg-primary/50 hover:bg-bg-secondary dark:hover:bg-dark-bg-primary transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-black text-text-primary dark:text-white uppercase tracking-widest">{category}</h2>
                    {selectedInCategory > 0 && (
                      /* PREV: bg-yellow-warm text-text-primary */
                      <span className="bg-brand dark:bg-brand-light text-white dark:text-navy-dark text-xs font-black px-1.5 py-0.5 rounded uppercase">
                        {selectedInCategory}
                      </span>
                    )}
                  </div>
                  <svg className={`w-3 h-3 text-text-primary/40 dark:text-white/40 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>

                <div className={`transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100 p-2 sm:p-3'}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {items.map((value) => {
                      const isSelected = selected.includes(value.id);
                      return (
                        <button
                          key={value.id}
                          onClick={() => toggleValue(value.id)}
                          /* PREV: border-yellow-warm bg-yellow-warm/10 dark:bg-yellow-warm/20 ... hover:border-yellow-warm/50 */
                          className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border text-left transition-all ${isSelected ? 'border-brand dark:border-brand-light bg-brand/10 dark:bg-brand/20 shadow-sm' : 'border-border-soft dark:border-dark-border/30 bg-white dark:bg-dark-bg-primary/50 hover:border-brand/50 dark:hover:border-brand-light/50'} ${shakeId === value.id ? 'animate-shake' : ''}`}
                        >
                          <h3 className={`font-black text-xs sm:text-sm tracking-tight ${isSelected ? 'text-text-primary dark:text-white' : 'text-text-primary dark:text-white'}`}>{value.name}</h3>
                          <p className={`text-xs leading-tight font-medium mt-0.5 ${isSelected ? 'text-text-primary/70 dark:text-white/70' : 'text-text-primary/50 dark:text-white/50'}`}>{value.description.substring(0, 45)}...</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-2 animate-pop">
          {selectedObjects.map((value, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            const valueGoals = goals.filter((g: any) => g.valueId === value.id);
            const hasGoals = valueGoals.length > 0;

            return (
              <div 
                key={value.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={() => handleDrop(index)}
                /* PREV: border-dashed border-yellow-warm/50 ... border-yellow-warm */
                className={`relative flex items-center gap-2 sm:gap-3 bg-white dark:bg-dark-bg-primary p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30 scale-95 border-dashed border-brand/50 dark:border-brand-light/50' : 'border-border-soft dark:border-dark-border/30 shadow-sm'} ${isDragOver ? 'border-brand dark:border-brand-light' : ''}`}
              >
                <div className="flex flex-col gap-0.5 items-center bg-bg-secondary dark:bg-dark-bg-primary/50 p-1 rounded-md">
                  {/* PREV: hover:text-yellow-warm */}
                  <button onClick={(e) => { e.stopPropagation(); moveValue(index, 'up'); }} disabled={index === 0} className="text-text-primary/30 dark:text-white/30 hover:text-brand dark:hover:text-brand-light disabled:opacity-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>
                  <button onClick={(e) => { e.stopPropagation(); moveValue(index, 'down'); }} disabled={index === selected.length - 1} className="text-text-primary/30 dark:text-white/30 hover:text-brand dark:hover:text-brand-light disabled:opacity-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></button>
                </div>
                <div className="flex-grow select-none flex items-center gap-2 min-w-0">
                  {/* PREV: bg-yellow-warm text-text-primary */}
                  <span className={`text-xs font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${index === 0 ? 'bg-brand dark:bg-brand-light text-white dark:text-navy-dark' : 'bg-navy-primary dark:bg-navy-primary text-white dark:text-white'}`}>{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-text-primary dark:text-white text-sm sm:text-base tracking-tight truncate">{value.name}</h4>
                    <p className="text-xs text-text-primary/50 dark:text-white/50 font-bold uppercase tracking-widest">{value.category}</p>
                  </div>
                </div>
                {/* Plus button for adding goals - only in Values menu */}
                {onAddGoal && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddGoal(value.id);
                    }}
                    /* PREV: bg-yellow-warm text-text-primary */
                    className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-brand dark:bg-brand-light text-white dark:text-navy-dark hover:opacity-90 transition-all shadow-sm active:scale-95 flex-shrink-0"
                    title="Add goal"
                    aria-label="Add goal"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
                <div className="text-text-primary/20 dark:text-white/20 pr-1 flex-shrink-0"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></div>
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-3 z-[60] safe-area-inset-bottom" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4rem)' }}>
        <div className="max-w-md mx-auto bg-white/95 dark:bg-dark-bg-primary/95 backdrop-blur shadow-2xl border border-border-soft dark:border-dark-border/30 rounded-xl sm:rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="px-2 sm:px-3 flex-shrink-0">
            <p className="text-xs text-text-primary/50 dark:text-white/50 font-black uppercase tracking-widest">Strength</p>
            <p className="text-sm font-bold text-text-primary dark:text-white">{selected.length}/10</p>
          </div>
          <button
            onClick={() => onComplete(selected)}
            disabled={selected.length === 0}
            /* PREV: bg-yellow-warm text-text-primary */
            className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all flex-shrink-0 ${selected.length > 0 ? 'bg-brand dark:bg-brand-light text-white dark:text-navy-dark hover:opacity-90 shadow-lg' : 'bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/30 dark:text-white/30 cursor-not-allowed'}`}
          >
            <span className="hidden sm:inline">Confirm Compass</span>
            <span className="sm:hidden">Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValueSelection;
