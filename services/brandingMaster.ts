/**
 * BRANDING MASTER CONFIGURATION
 * 
 * Centralized branding system for the application.
 * Provides consistent colors, spacing, and typography across all components.
 */

export const BrandingMaster = {
  colors: {
    navy: {
      primary: '#2c5282',
      dark: '#1e3a5f',
      light: '#5b7c99'
    },
    yellow: {
      warm: '#f7c948',
      light: '#ffd166',
      muted: '#e6b84d'
    },
    neutrals: {
      bg: '#fafaf9',
      bgSecondary: '#f8f7f4',
      border: '#e5e3df'
    },
    therapeutic: {
      sage: '#a8c5a0',
      lavender: '#c4b5d5',
      coral: '#ffb088',
      mint: '#90e0b6'
    },
    dark: {
      bgPrimary: '#1b3448',
      bgSecondary: '#243b53',
      bgTertiary: '#2d4a5f',
      border: '#334e68'
    }
  },
  spacing: {
    mobile: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem'
    },
    tablet: {
      xs: '0.75rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem'
    },
    desktop: {
      xs: '1rem',
      sm: '1.5rem',
      md: '2rem',
      lg: '3rem'
    }
  },
  typography: {
    mobile: {
      base: '16px',
      sm: '14px',
      lg: '18px',
      xl: '20px'
    },
    tablet: {
      base: '18px',
      sm: '16px',
      lg: '20px',
      xl: '24px'
    },
    desktop: {
      base: '20px',
      sm: '18px',
      lg: '24px',
      xl: '28px'
    }
  }
};

