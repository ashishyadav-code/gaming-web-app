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
          bg: '#0A0A0C',
          surface: '#121217',
          card: '#16161D',
          cardBorder: '#23232E',
          red: {
            DEFAULT: '#EF4444',
            light: '#F87171',
            soft: '#271416',
            glow: '#DC2626',
            dark: '#991B1B',
          },
          blue: {
            DEFAULT: '#EF4444',
            light: '#F87171',
            soft: '#271416',
            glow: '#DC2626',
            dark: '#991B1B',
          },
          gold: {
            DEFAULT: '#F59E0B',
            soft: '#2D2314',
            badge: '#FBBF24',
          },
          rose: {
            DEFAULT: '#EF4444',
            soft: '#271416',
          },
          purple: {
            DEFAULT: '#A855F7',
            soft: '#22152E',
          },
          emerald: {
            DEFAULT: '#10B981',
            soft: '#12251D',
          },
        },
      },
      boxShadow: {
        'soft-card': '0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.25)',
        'float-nav': '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 15px rgba(239, 68, 68, 0.08)',
        'btn-glow': '0 8px 25px rgba(239, 68, 68, 0.45)',
        'inner-light': 'inset 0 1px 1px rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
}
