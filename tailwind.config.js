/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts}",
    "./utils/**/*.{js,ts}",
    "./App.tsx",
    "./index.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
    },
  },
  plugins: [],
}

