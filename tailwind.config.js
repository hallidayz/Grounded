import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}', // Add root components directory
    './hooks/**/*.{js,ts,jsx,tsx}',      // Add hooks if they contain any classes
    './services/**/*.{js,ts,jsx,tsx}',   // Add services if they contain any classes
    './App.tsx',                          // Add App.tsx if it's in root
    './main.tsx',                         // Add main.tsx if it's in root
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#A5B4FC',
          DEFAULT: '#4F46E5',
          dark: '#3730A3',
        },
        // Preserve existing custom colors below this point
        // Core Brand (Navy)
        'navy-primary': '#2c5282',
        'navy-dark': '#1e3a5f',
        'navy-light': '#5b7c99',
        
        // Accent (Yellow/Gold)
        'yellow-warm': '#f7c948',
        'yellow-light': '#ffd166',
        'gold-muted': '#e6b84d',
        
        // Mood-Driven Colors
        'calm-sage': '#a8c5a0',
        'calm-lavender': '#c4b5d5',
        'warm-coral': '#ffb088',
        'energized-mint': '#90e0b6',
        
        // Neutrals (Warm-toned)
        'bg-primary': '#fafaf9',
        'bg-secondary': '#f8f7f4',
        'bg-tertiary': '#f0eeeb',
        'border-soft': '#e5e3df',
        'text-primary': '#4a5568',
        'text-secondary': '#6b7280',
        'text-tertiary': '#9ca3af',
        
        // Dark Mode
        'dark-bg-primary': '#1b3448',
        'dark-bg-secondary': '#243b53',
        'dark-bg-tertiary': '#2d4a5f',
        'dark-border': '#334e68',
        
        // Legacy colors (for backward compatibility during migration)
        'authority-navy': '#02295b',
        'achievement-gold': '#fda700',
        'strategic-forest': '#2c5f41',
        'pure-foundation': '#f6f7f9',
        'success-forest': '#4a6741',
        'creative-depth': '#6b4e71',
        'executive-depth': '#1b3448',
        'brand-accent': '#fda700',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      transitionTimingFunction: {
        'sheet-open': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'sheet-slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'sheet-slide-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-out': { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
      },
      animation: {
        'sheet-up': 'sheet-slide-up 0.35s cubic-bezier(0.22,0.61,0.36,1)',
        'sheet-down': 'sheet-slide-down 0.35s ease-in',
        'fade-in': 'fade-in 0.25s ease-out',
        'fade-out': 'fade-out 0.25s ease-in',
      },
      height: { 'screen-dvh': '100dvh' },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      const safeArea = {
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top)' },
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom)' },
        '.pl-safe': { paddingLeft: 'env(safe-area-inset-left)' },
        '.pr-safe': { paddingRight: 'env(safe-area-inset-right)' },
        '.px-safe': {
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.py-safe': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
      };
      addUtilities(safeArea);
    }),
    plugin(({ addVariant }) => {
      addVariant('motion-safe', '@media (prefers-reduced-motion: no-preference)');
      addVariant('motion-reduce', '@media (prefers-reduced-motion: reduce)');
    }),
  ],
  darkMode: 'class', // better theme control
};
