/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Mode Brand Colors
        'authority-navy': '#02295b',
        'achievement-gold': '#fda700',
        'strategic-forest': '#2c5f41',
        'pure-foundation': '#f6f7f9',
        
        // Dark Mode Brand Colors
        'success-forest': '#4a6741',
        'creative-depth': '#6b4e71',
        'executive-depth': '#1b3448',
        
        // Semantic color mappings
        brand: {
          primary: '#02295b',      // Authority Navy (light mode)
          accent: '#fda700',       // Achievement Gold (both modes)
          growth: '#2c5f41',       // Strategic Forest (light mode)
          background: '#f6f7f9',   // Pure Foundation (light mode)
          // Dark mode variants
          'primary-dark': '#1b3448',    // Executive Depth
          'growth-dark': '#4a6741',     // Success Forest
          'creative-dark': '#6b4e71',    // Creative Depth
          'background-dark': '#1b3448', // Executive Depth
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

