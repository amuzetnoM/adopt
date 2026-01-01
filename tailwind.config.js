/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./index.tsx",
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Vivid accent colors for dark mode
        'accent-vivid': {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      boxShadow: {
        'neo-raised': '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
        'neo-inset': 'inset 8px 8px 16px #d1d9e6, inset -8px -8px 16px #ffffff',
        'neo-flat': '4px 4px 12px rgba(0, 0, 0, 0.08), -4px -4px 12px rgba(255, 255, 255, 0.8)',
        'neo-hover': '-10px -10px 20px rgba(255, 255, 255, 0.9), 10px 10px 20px rgba(0, 0, 0, 0.15)',
        'neo-dark-raised': '8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neo-dark-inset': 'inset 8px 8px 16px rgba(0, 0, 0, 0.4), inset -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neo-dark-flat': '4px 4px 12px rgba(0, 0, 0, 0.5), -4px -4px 12px rgba(255, 255, 255, 0.03)',
        'neo-dark-hover': '-10px -10px 20px rgba(255, 255, 255, 0.08), 10px 10px 20px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
