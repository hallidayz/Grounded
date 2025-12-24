/**
 * DESIGN SYSTEM - 60/30/10 COLOR RULE
 * 
 * Implements the 60/30/10 design rule for consistent color distribution:
 * - 60%: Primary color (navy-primary) - backgrounds, main content
 * - 30%: Secondary color (yellow-warm) - accents, CTAs
 * - 10%: Accent colors (mood colors) - highlights, emphasis
 */

import { BrandingMaster } from './brandingMaster';

export type ColorDistributionType = 'primary' | 'secondary' | 'accent';

export interface ColorUsage {
  primary: number;    // Percentage of navy-primary usage
  secondary: number;  // Percentage of yellow-warm usage
  accent: number;     // Percentage of mood/accent colors usage
}

/**
 * Get color distribution for a component or page
 * Analyzes className strings to determine color usage
 */
export function getColorDistribution(classNames: string): ColorUsage {
  const classes = classNames.split(' ');
  
  let primaryCount = 0;
  let secondaryCount = 0;
  let accentCount = 0;
  let totalColorClasses = 0;

  classes.forEach(className => {
    // Primary colors (navy-primary, navy-dark, navy-light)
    if (className.includes('navy-primary') || 
        className.includes('navy-dark') || 
        className.includes('navy-light') ||
        className.includes('bg-primary') ||
        className.includes('dark-bg-primary')) {
      primaryCount++;
      totalColorClasses++;
    }
    // Secondary colors (yellow-warm, yellow-light, gold-muted)
    else if (className.includes('yellow-warm') || 
             className.includes('yellow-light') || 
             className.includes('gold-muted')) {
      secondaryCount++;
      totalColorClasses++;
    }
    // Accent colors (mood colors)
    else if (className.includes('calm-sage') || 
             className.includes('calm-lavender') || 
             className.includes('warm-coral') || 
             className.includes('energized-mint') ||
             className.includes('calm-') ||
             className.includes('warm-') ||
             className.includes('energized-')) {
      accentCount++;
      totalColorClasses++;
    }
  });

  if (totalColorClasses === 0) {
    return { primary: 0, secondary: 0, accent: 0 };
  }

  return {
    primary: Math.round((primaryCount / totalColorClasses) * 100),
    secondary: Math.round((secondaryCount / totalColorClasses) * 100),
    accent: Math.round((accentCount / totalColorClasses) * 100),
  };
}

/**
 * Validate color usage against 60/30/10 rule
 * Returns true if distribution is within acceptable range
 */
export function validateColorUsage(usage: ColorUsage, tolerance: number = 10): boolean {
  const targetPrimary = 60;
  const targetSecondary = 30;
  const targetAccent = 10;

  return (
    Math.abs(usage.primary - targetPrimary) <= tolerance &&
    Math.abs(usage.secondary - targetSecondary) <= tolerance &&
    Math.abs(usage.accent - targetAccent) <= tolerance
  );
}

/**
 * Get recommended color for a specific distribution type
 */
export function getColorForDistribution(type: ColorDistributionType): string {
  switch (type) {
    case 'primary':
      return BrandingMaster.colors.navy.primary;
    case 'secondary':
      return BrandingMaster.colors.yellow.warm;
    case 'accent':
      // Return a default accent color (can be customized)
      return BrandingMaster.colors.therapeutic.sage;
    default:
      return BrandingMaster.colors.navy.primary;
  }
}

/**
 * Get Tailwind class for a distribution type
 */
export function getTailwindClassForDistribution(type: ColorDistributionType, variant: 'bg' | 'text' | 'border' = 'bg'): string {
  switch (type) {
    case 'primary':
      return variant === 'bg' ? 'bg-navy-primary' : 
             variant === 'text' ? 'text-navy-primary' : 
             'border-navy-primary';
    case 'secondary':
      return variant === 'bg' ? 'bg-yellow-warm' : 
             variant === 'text' ? 'text-yellow-warm' : 
             'border-yellow-warm';
    case 'accent':
      return variant === 'bg' ? 'bg-calm-sage' : 
             variant === 'text' ? 'text-calm-sage' : 
             'border-calm-sage';
    default:
      return variant === 'bg' ? 'bg-navy-primary' : 
             variant === 'text' ? 'text-navy-primary' : 
             'border-navy-primary';
  }
}

/**
 * Design system constants for 60/30/10 rule
 */
export const DesignSystem = {
  colorDistribution: {
    primary: 60,    // 60% navy-primary
    secondary: 30,  // 30% yellow-warm
    accent: 10,      // 10% mood colors
  },
  tolerance: 10,    // Acceptable deviation from target percentages
};

