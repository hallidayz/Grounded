
import React, { useState, useMemo, useEffect } from 'react';
import { ALL_VALUES } from '../constants';
import { ValueItem } from '../types';

interface ValueSelectionProps {
  initialSelected: string[];
  onComplete: (ids: string[]) => void;
  isReorderingOnly?: boolean;
}

const ValueSelection: React.FC<ValueSelectionProps> = ({ initialSelected, onComplete, isReorderingOnly = false }) => {
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
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {viewMode === 'pick' ? 'Define Your ' : 'Rank Your '}<span className="text-indigo-600">Compass</span>
        </h1>
        <div className="flex justify-center gap-1 mt-1">
           <button 
             onClick={() => setViewMode('pick')}
             className={`px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${viewMode === 'pick' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'}`}
           >
             Selection
           </button>
           <button 
             onClick={() => setViewMode('sort')}
             disabled={selected.length === 0}
             className={`px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${viewMode === 'sort' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'} disabled:opacity-30`}
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
              <section key={category} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50/30 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{category}</h2>
                    {selectedInCategory > 0 && (
                      <span className="bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">
                        {selectedInCategory}
                      </span>
                    )}
                  </div>
                  <svg className={`w-3 h-3 text-slate-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>

                <div className={`transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100 p-3'}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {items.map((value) => {
                      const isSelected = selected.includes(value.id);
                      return (
                        <button
                          key={value.id}
                          onClick={() => toggleValue(value.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50/20 shadow-sm' : 'border-slate-50 bg-white hover:border-indigo-100'} ${shakeId === value.id ? 'animate-shake' : ''}`}
                        >
                          <h3 className={`font-black text-[11px] tracking-tight ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{value.name}</h3>
                          <p className={`text-[8px] leading-tight font-medium mt-0.5 ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>{value.description.substring(0, 45)}...</p>
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

            return (
              <div 
                key={value.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={() => handleDrop(index)}
                className={`flex items-center gap-3 bg-white p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30 scale-95 border-dashed border-indigo-200' : 'border-slate-100 shadow-sm'} ${isDragOver ? 'border-indigo-500' : ''}`}
              >
                <div className="flex flex-col gap-0.5 items-center bg-slate-50 p-1 rounded-md">
                  <button onClick={(e) => { e.stopPropagation(); moveValue(index, 'up'); }} disabled={index === 0} className="text-slate-300 hover:text-indigo-600 disabled:opacity-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>
                  <button onClick={(e) => { e.stopPropagation(); moveValue(index, 'down'); }} disabled={index === selected.length - 1} className="text-slate-300 hover:text-indigo-600 disabled:opacity-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></button>
                </div>
                <div className="flex-grow select-none flex items-center gap-2">
                  <span className={`text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center ${index === 0 ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}>{index + 1}</span>
                  <div>
                    <h4 className="font-black text-slate-900 text-[12px] tracking-tight">{value.name}</h4>
                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{value.category}</p>
                  </div>
                </div>
                <div className="text-slate-200 pr-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></div>
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-3 z-30">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur shadow-2xl border border-slate-200 rounded-2xl p-2 flex items-center justify-between">
          <div className="px-3">
            <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest">Strength</p>
            <p className="text-[10px] font-bold text-slate-800">{selected.length}/10</p>
          </div>
          <button
            onClick={() => onComplete(selected)}
            disabled={selected.length === 0}
            className={`px-8 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${selected.length > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'}`}
          >
            Confirm Compass
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValueSelection;
