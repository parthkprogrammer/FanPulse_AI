/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pitch: {
          dark: '#0B0F19',
          card: '#111827',
          elevated: '#1F2937',
          border: '#374151',
          subtle: '#1E293B',
          surface: '#151C2C',
        },
        cricket: {
          green: {
            DEFAULT: '#10B981',
            light: '#34D399',
            dark: '#059669',
            deep: '#047857',
          },
          gold: {
            DEFAULT: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
          },
          live: '#EF4444',
          blue: '#3B82F6',
          silver: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'card-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
