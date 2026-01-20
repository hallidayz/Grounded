/**
 * BRANDING CONFIGURATION
 * Centralized branding system for Grounded app.
 */

export const Branding = {
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
      border: '#e5e3df',
      textPrimary: '#1b3448',
      textSecondary: '#4a5568',
      textTertiary: '#718096'
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
      border: '#334e68',
      textPrimary: '#f6f4f0',
      textSecondary: '#cbd5e1',
      textTertiary: '#94a3b8'
    },
    timerOnBubbles: {
      text: '#2c5282',
      outline: 'transparent'
    }
  },

  // Helper to get colors based on theme
  getTimerColors: (isDark: boolean) => ({
    text: isDark ? '#ffffff' : '#2c5282',
    outline: isDark ? '#2c5282' : 'transparent'
  }),

  // Helper to get colors based on theme
  getColors: (isDark: boolean) => ({
    bgPrimary: isDark ? '#1b3448' : '#fafaf9',
    bgSecondary: isDark ? '#243b53' : '#f8f7f4',
    border: isDark ? '#334e68' : '#e5e3df',
    textPrimary: isDark ? '#f6f4f0' : '#1b3448',
    textSecondary: isDark ? '#cbd5e1' : '#4a5568',
    primary: '#2c5282',
    primaryHover: '#1e3a5f'
  })
};

export default Branding;
