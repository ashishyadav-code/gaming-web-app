/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sarkar: {
          bg: '#F2F6FC',
          card: 'rgba(255, 255, 255, 0.85)',
          blue: {
            DEFAULT: '#2563EB',
            light: '#3B82F6',
            soft: '#EFF6FF',
            glow: '#60A5FA',
            dark: '#1D4ED8'
          },
          indigo: {
            DEFAULT: '#4F46E5',
            soft: '#EEF2FF'
          },
          gold: {
            DEFAULT: '#F59E0B',
            soft: '#FEF3C7',
            badge: '#FBBF24'
          },
          rose: {
            DEFAULT: '#EF4444',
            soft: '#FEE2E2'
          },
          purple: {
            DEFAULT: '#8B5CF6',
            soft: '#F3E8FF'
          },
          emerald: {
            DEFAULT: '#10B981',
            soft: '#D1FAE5'
          }
        }
      },
      boxShadow: {
        'soft-card': '0 8px 30px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)',
        'float-nav': '0 10px 40px rgba(37, 99, 235, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05)',
        'btn-glow': '0 8px 25px rgba(37, 99, 235, 0.35)',
        'inner-light': 'inset 0 1px 1px rgba(255, 255, 255, 0.8)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
