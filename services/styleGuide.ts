/**
 * MASTER STYLE GUIDE
 * 
 * Centralized reference for all UI patterns, components, and styling conventions.
 * Use this as the single source of truth for consistent design across all pages.
 * 
 * This guide documents:
 * - Button styles (primary, accent, secondary, icon, small)
 * - Typography scales (headings, body, labels)
 * - Card/container patterns
 * - Input/form styles
 * - Spacing patterns
 * - Border/divider styles
 * - Animation patterns
 */

export const StyleGuide = {
  // ============================================
  // BUTTONS
  // ============================================
  buttons: {
    // Primary Action Button (Navy) - Main actions, confirmations
    // Standard spacing: px-6 py-4 (60% rule - primary spacing)
    primary: {
      base: 'px-6 py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base transition-all',
      colors: 'bg-navy-primary text-white dark:bg-navy-primary dark:text-white',
      hover: 'hover:opacity-90',
      active: 'active:scale-[0.98]',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
      shadow: 'shadow-lg',
      full: 'px-6 py-4 bg-navy-primary text-white dark:bg-navy-primary dark:text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg'
    },
    
    // Accent Action Button (Yellow) - Important actions, CTAs
    // Standard spacing: px-6 py-4 (30% rule - secondary spacing for CTAs)
    accent: {
      base: 'px-6 py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base transition-all',
      colors: 'bg-yellow-warm text-text-primary dark:bg-yellow-warm dark:text-text-primary',
      hover: 'hover:opacity-90',
      active: 'active:scale-[0.98]',
      shadow: 'shadow-lg',
      full: 'px-6 py-4 bg-yellow-warm text-text-primary dark:bg-yellow-warm dark:text-text-primary rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 active:scale-[0.98] shadow-lg transition-all'
    },
    
    // Secondary Button - Cancel, less important actions
    // Compact spacing: px-4 py-3 (30% rule - secondary spacing)
    secondary: {
      base: 'px-4 py-3 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base transition-all',
      colors: 'bg-bg-primary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white',
      hover: 'hover:opacity-80',
      border: 'border border-border-soft dark:border-dark-border/30',
      full: 'px-4 py-3 bg-bg-primary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-80 transition-all border border-border-soft dark:border-dark-border/30'
    },
    
    // Icon Button - Settings, help, logout (circular)
    // Minimal spacing: p-2 (10% rule - accent spacing)
    icon: {
      base: 'w-8 h-8 flex items-center justify-center rounded-full p-2 transition-all',
      colors: 'text-text-secondary dark:text-text-secondary',
      hover: 'hover:text-yellow-warm dark:hover:text-yellow-warm hover:bg-yellow-warm/10 dark:hover:bg-yellow-warm/20',
      full: 'w-8 h-8 flex items-center justify-center rounded-full p-2 text-text-secondary dark:text-text-secondary hover:text-yellow-warm dark:hover:text-yellow-warm hover:bg-yellow-warm/10 dark:hover:bg-yellow-warm/20 transition-all'
    },
    
    // Small Button - Compact spaces, inline actions
    // Compact spacing: px-3 py-1.5 (10% rule - accent spacing)
    small: {
      base: 'px-3 py-1.5 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest transition-all',
      primary: 'bg-navy-primary dark:bg-navy-primary text-white',
      accent: 'bg-yellow-warm text-text-primary hover:opacity-90',
      secondary: 'bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white',
      fullPrimary: 'px-3 py-1.5 bg-navy-primary dark:bg-navy-primary text-white rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest transition-all',
      fullAccent: 'px-3 py-1.5 bg-yellow-warm text-text-primary rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest hover:opacity-90 transition-all'
    },
    
    // Text Button - For links, subtle actions
    text: {
      base: 'font-medium text-text-primary dark:text-white transition-colors',
      hover: 'hover:text-yellow-warm dark:hover:text-yellow-warm',
      full: 'font-medium text-text-primary dark:text-white hover:text-yellow-warm dark:hover:text-yellow-warm transition-colors'
    }
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    // Headings
    h1: 'text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight',
    h2: 'text-xl sm:text-2xl font-black text-text-primary dark:text-white tracking-tight',
    h3: 'text-lg sm:text-xl font-semibold text-text-primary dark:text-white',
    h4: 'text-base sm:text-lg font-semibold text-text-primary dark:text-white',
    
    // Body Text
    body: 'text-sm sm:text-base text-text-primary dark:text-white leading-relaxed',
    bodySecondary: 'text-sm sm:text-base text-text-secondary dark:text-text-secondary leading-relaxed',
    bodySmall: 'text-xs sm:text-sm text-text-primary dark:text-white',
    bodyTiny: 'text-xs sm:text-sm text-text-primary dark:text-white',
    
    // Labels & Captions
    label: 'text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest',
    labelSmall: 'text-xs font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest',
    caption: 'text-xs text-text-secondary dark:text-text-secondary',
    captionSmall: 'text-xs text-text-secondary dark:text-text-secondary'
  },

  // ============================================
  // CARDS & CONTAINERS
  // ============================================
  cards: {
    // Standard Card - Most common card style
    standard: 'bg-white dark:bg-dark-bg-secondary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border shadow-sm p-4 sm:p-5',
    
    // Elevated Card - Modals, important content
    elevated: 'bg-white dark:bg-dark-bg-primary rounded-2xl sm:rounded-3xl border border-border-soft dark:border-dark-border shadow-2xl p-6 sm:p-8',
    
    // Subtle Card - Backgrounds, nested content
    subtle: 'bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4 sm:p-5',
    
    // Interactive Card - Clickable cards
    interactive: 'bg-white dark:bg-dark-bg-secondary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border shadow-sm hover:shadow-md transition-all cursor-pointer',
    
    // Active Card - Selected state
    active: 'bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl border-2 border-navy-primary dark:border-yellow-warm shadow-lg'
  },

  // ============================================
  // INPUTS & FORMS
  // ============================================
  inputs: {
    // Text Input
    text: {
      base: 'w-full bg-bg-secondary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 rounded-xl p-3 font-black text-text-primary dark:text-white transition-all outline-none',
      focus: 'focus:ring-2 focus:ring-yellow-warm focus:border-yellow-warm',
      full: 'w-full bg-bg-secondary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 rounded-xl p-3 font-black text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm focus:border-yellow-warm transition-all outline-none'
    },
    
    // Textarea
    textarea: {
      base: 'w-full bg-bg-secondary dark:bg-dark-bg-primary/50 border-none rounded-xl sm:rounded-2xl p-3 sm:p-4 text-text-primary dark:text-white min-h-[140px] sm:min-h-[160px] resize-none text-[10px] sm:text-[11px] leading-relaxed shadow-inner transition-all outline-none',
      focus: 'focus:ring-2 focus:ring-yellow-warm/30',
      full: 'w-full bg-bg-secondary dark:bg-dark-bg-primary/50 border-none rounded-xl sm:rounded-2xl p-3 sm:p-4 focus:ring-2 focus:ring-yellow-warm/30 outline-none text-text-primary dark:text-white min-h-[140px] sm:min-h-[160px] resize-none text-[10px] sm:text-[11px] leading-relaxed shadow-inner transition-all'
    },
    
    // Checkbox
    checkbox: {
      base: 'w-5 h-5 rounded border-2 border-text-primary/30 dark:border-white/30 text-yellow-warm cursor-pointer',
      focus: 'focus:ring-2 focus:ring-yellow-warm/50',
      full: 'w-5 h-5 rounded border-2 border-text-primary/30 dark:border-white/30 text-yellow-warm focus:ring-2 focus:ring-yellow-warm/50 cursor-pointer'
    },
    
    // Select/Dropdown
    select: {
      base: 'w-full bg-bg-secondary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 rounded-xl p-3 font-black text-text-primary dark:text-white transition-all outline-none',
      focus: 'focus:ring-2 focus:ring-yellow-warm focus:border-yellow-warm',
      full: 'w-full bg-bg-secondary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 rounded-xl p-3 font-black text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm focus:border-yellow-warm transition-all outline-none'
    }
  },

  // ============================================
  // SPACING PATTERNS (60/30/10 Rule)
  // ============================================
  spacing: {
    // Primary spacing (60% of sections) - Main content areas
    primary: 'space-y-6 sm:space-y-8',
    primaryPadding: 'p-6 sm:p-8',
    primaryGap: 'gap-6 sm:gap-8',
    primaryMargin: 'mb-6 sm:mb-8',
    
    // Secondary spacing (30% of sections) - Supporting content
    secondary: 'space-y-4 sm:space-y-6',
    secondaryPadding: 'p-4 sm:p-5',
    secondaryGap: 'gap-4 sm:gap-6',
    secondaryMargin: 'mb-4 sm:mb-6',
    
    // Accent spacing (10% of sections) - Highlights, emphasis
    accent: 'space-y-2 sm:space-y-3',
    accentPadding: 'p-2 sm:p-3',
    accentGap: 'gap-2 sm:gap-3',
    accentMargin: 'mb-2 sm:mb-3',
    
    // Legacy aliases for backward compatibility
    section: 'space-y-4 sm:space-y-6', // Maps to secondary
    sectionLarge: 'space-y-6 sm:space-y-8', // Maps to primary
    card: 'p-4 sm:p-5', // Maps to secondaryPadding
    cardLarge: 'p-6 sm:p-8', // Maps to primaryPadding
    cardSmall: 'p-3 sm:p-4', // Maps to accentPadding
    gap: 'gap-3 sm:gap-4', // Maps to secondaryGap
    gapSmall: 'gap-2 sm:gap-3', // Maps to accentGap
    gapLarge: 'gap-4 sm:gap-6', // Maps to secondaryGap
    marginSection: 'mb-4 sm:mb-6', // Maps to secondaryMargin
    marginLarge: 'mb-6 sm:mb-8' // Maps to primaryMargin
  },

  // ============================================
  // BORDERS & DIVIDERS
  // ============================================
  borders: {
    // Dividers
    divider: 'border-t border-border-soft dark:border-dark-border',
    dividerVertical: 'border-l border-border-soft dark:border-dark-border',
    
    // Card borders
    card: 'border border-border-soft dark:border-dark-border',
    cardActive: 'border-2 border-navy-primary dark:border-yellow-warm',
    cardHover: 'border-border-soft dark:border-dark-border hover:border-yellow-warm/50 dark:hover:border-yellow-warm/50',
    
    // Input borders
    input: 'border border-border-soft dark:border-dark-border/30',
    inputFocus: 'border-yellow-warm ring-2 ring-yellow-warm'
  },

  // ============================================
  // ANIMATIONS & TRANSITIONS
  // ============================================
  animations: {
    // Standard transitions
    transition: 'transition-all duration-200',
    transitionSlow: 'transition-all duration-300',
    transitionFast: 'transition-all duration-150',
    
    // Hover effects
    hoverScale: 'hover:scale-105 active:scale-95',
    hoverLift: 'hover:shadow-md hover:-translate-y-0.5',
    
    // Active states
    activeScale: 'active:scale-[0.98]',
    activeScaleSmall: 'active:scale-95',
    
    // Fade in
    fadeIn: 'animate-fade-in',
    pop: 'animate-pop'
  },

  // ============================================
  // BADGES & TAGS
  // ============================================
  badges: {
    // Status badges
    success: 'bg-calm-sage text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest',
    warning: 'bg-yellow-warm/20 dark:bg-yellow-warm/20 text-yellow-warm dark:text-yellow-warm text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest',
    info: 'bg-navy-light/20 dark:bg-navy-light/20 text-navy-primary dark:text-navy-light text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest',
    
    // Small badge
    small: 'text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest'
  },

  // ============================================
  // MODALS & OVERLAYS
  // ============================================
  modals: {
    // Backdrop
    backdrop: 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-dark/60 backdrop-blur-sm',
    
    // Modal container
    container: 'bg-white dark:bg-dark-bg-primary w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative border border-border-soft dark:border-dark-border',
    
    // Close button
    closeButton: 'absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors'
  },

  // ============================================
  // GRID LAYOUTS
  // ============================================
  grids: {
    // Responsive grid (mobile-first)
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4',
    
    // Emotion selector grid (4x2 mobile, 8 cols desktop)
    emotions: 'grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3',
    
    // Two column
    twoCol: 'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get button class string
 * @param type - Button type: 'primary' | 'accent' | 'secondary' | 'icon' | 'small' | 'text'
 * @param variant - Optional variant (e.g., 'full', 'base', 'colors')
 * @returns Complete className string
 */
export function getButtonClass(
  type: 'primary' | 'accent' | 'secondary' | 'icon' | 'small' | 'text',
  variant: 'full' | 'base' | 'colors' | 'fullPrimary' | 'fullAccent' = 'full'
): string {
  const button = StyleGuide.buttons[type];
  
  if (variant === 'full' && button.full) {
    return button.full;
  }
  
  if (variant === 'base' && button.base) {
    return button.base;
  }
  
  if (variant === 'colors' && button.colors) {
    return button.colors;
  }
  
  // Handle small button variants
  if (type === 'small') {
    if (variant === 'fullPrimary' && button.fullPrimary) {
      return button.fullPrimary;
    }
    if (variant === 'fullAccent' && button.fullAccent) {
      return button.fullAccent;
    }
  }
  
  // Fallback: combine base + colors + hover + active
  const parts = [
    button.base,
    button.colors,
    button.hover,
    button.active,
    button.shadow,
    button.border
  ].filter(Boolean);
  
  return parts.join(' ');
}

/**
 * Get typography class string
 * @param variant - Typography variant
 * @returns Complete className string
 */
export function getTypographyClass(
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySecondary' | 'bodySmall' | 'label' | 'caption'
): string {
  return StyleGuide.typography[variant];
}

/**
 * Get card class string
 * @param variant - Card variant: 'standard' | 'elevated' | 'subtle' | 'interactive' | 'active'
 * @returns Complete className string
 */
export function getCardClass(
  variant: 'standard' | 'elevated' | 'subtle' | 'interactive' | 'active' = 'standard'
): string {
  return StyleGuide.cards[variant];
}

/**
 * Get input class string
 * @param type - Input type: 'text' | 'textarea' | 'checkbox' | 'select'
 * @param variant - Optional variant (e.g., 'full', 'base', 'focus')
 * @returns Complete className string
 */
export function getInputClass(
  type: 'text' | 'textarea' | 'checkbox' | 'select',
  variant: 'full' | 'base' | 'focus' = 'full'
): string {
  const input = StyleGuide.inputs[type];
  
  if (variant === 'full' && input.full) {
    return input.full;
  }
  
  if (variant === 'base' && input.base) {
    return input.base;
  }
  
  // Fallback: combine base + focus
  return `${input.base} ${input.focus || ''}`.trim();
}

/**
 * Get spacing class string based on 60/30/10 rule
 * @param type - Spacing type: 'primary' | 'secondary' | 'accent'
 * @param variant - Spacing variant: 'space' | 'padding' | 'gap' | 'margin'
 * @returns Complete className string
 */
export function getSpacing(
  type: 'primary' | 'secondary' | 'accent',
  variant: 'space' | 'padding' | 'gap' | 'margin' = 'space'
): string {
  const spacing = StyleGuide.spacing;
  
  switch (variant) {
    case 'space':
      return type === 'primary' ? spacing.primary : 
             type === 'secondary' ? spacing.secondary : 
             spacing.accent;
    case 'padding':
      return type === 'primary' ? spacing.primaryPadding : 
             type === 'secondary' ? spacing.secondaryPadding : 
             spacing.accentPadding;
    case 'gap':
      return type === 'primary' ? spacing.primaryGap : 
             type === 'secondary' ? spacing.secondaryGap : 
             spacing.accentGap;
    case 'margin':
      return type === 'primary' ? spacing.primaryMargin : 
             type === 'secondary' ? spacing.secondaryMargin : 
             spacing.accentMargin;
    default:
      return spacing.secondary;
  }
}

// Export for convenience
export default StyleGuide;

