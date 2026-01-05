/**
 * DESIGN SYSTEM HOOK
 * 
 * Provides consistent styling utilities based on the 60/30/10 design rule
 * and brand resources. Use this hook to ensure all components follow
 * the same design patterns.
 */

import { useMemo } from 'react';
import { StyleGuide, getButtonClass, getTypographyClass, getCardClass, getInputClass, getSpacing } from '../services/styleGuide';

export interface UseDesignSystemReturn {
  // Button utilities
  button: {
    primary: (className?: string) => string;
    accent: (className?: string) => string;
    secondary: (className?: string) => string;
    icon: (className?: string) => string;
    small: (className?: string) => string;
    text: (className?: string) => string;
  };
  
  // Typography utilities
  typography: {
    h1: (className?: string) => string;
    h2: (className?: string) => string;
    h3: (className?: string) => string;
    body: (className?: string) => string;
    caption: (className?: string) => string;
    label: (className?: string) => string;
  };
  
  // Card utilities
  card: {
    base: (className?: string) => string;
    elevated: (className?: string) => string;
    outlined: (className?: string) => string;
  };
  
  // Input utilities
  input: {
    base: (className?: string) => string;
    textarea: (className?: string) => string;
    select: (className?: string) => string;
  };
  
  // Spacing utilities
  spacing: {
    primary: (variant?: 'space' | 'padding' | 'gap' | 'margin') => string;
    secondary: (variant?: 'space' | 'padding' | 'gap' | 'margin') => string;
    accent: (variant?: 'space' | 'padding' | 'gap' | 'margin') => string;
  };
  
  // Direct access to style guide
  styleGuide: typeof StyleGuide;
}

/**
 * Hook to access design system utilities
 * 
 * @example
 * ```tsx
 * const { button, typography, spacing } = useDesignSystem();
 * 
 * return (
 *   <div className={spacing.primary('padding')}>
 *     <h1 className={typography.h1()}>Title</h1>
 *     <button className={button.primary()}>Click me</button>
 *   </div>
 * );
 * ```
 */
export function useDesignSystem(): UseDesignSystemReturn {
  return useMemo(() => ({
    button: {
      primary: (className = '') => getButtonClass('primary', className),
      accent: (className = '') => getButtonClass('accent', className),
      secondary: (className = '') => getButtonClass('secondary', className),
      icon: (className = '') => getButtonClass('icon', className),
      small: (className = '') => getButtonClass('small', className),
      text: (className = '') => getButtonClass('text', className),
    },
    
    typography: {
      h1: (className = '') => getTypographyClass('h1', className),
      h2: (className = '') => getTypographyClass('h2', className),
      h3: (className = '') => getTypographyClass('h3', className),
      body: (className = '') => getTypographyClass('body', className),
      caption: (className = '') => getTypographyClass('caption', className),
      label: (className = '') => getTypographyClass('label', className),
    },
    
    card: {
      base: (className = '') => getCardClass('base', className),
      elevated: (className = '') => getCardClass('elevated', className),
      outlined: (className = '') => getCardClass('outlined', className),
    },
    
    input: {
      base: (className = '') => getInputClass('base', className),
      textarea: (className = '') => getInputClass('textarea', className),
      select: (className = '') => getInputClass('select', className),
    },
    
    spacing: {
      primary: (variant = 'space') => getSpacing('primary', variant),
      secondary: (variant = 'space') => getSpacing('secondary', variant),
      accent: (variant = 'space') => getSpacing('accent', variant),
    },
    
    styleGuide: StyleGuide,
  }), []);
}

export default useDesignSystem;

