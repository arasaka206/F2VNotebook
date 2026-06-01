/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        farm: {
          bg: 'hsl(var(--farm-bg) / <alpha-value>)',
          card: 'hsl(var(--farm-card) / <alpha-value>)',
          border: 'hsl(var(--farm-border) / <alpha-value>)',
          text: 'hsl(var(--farm-text) / <alpha-value>)',
          muted: 'hsl(var(--farm-muted) / <alpha-value>)',
          accent: 'hsl(var(--farm-accent) / <alpha-value>)',
          warn: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        }
      },
    },
  },
  plugins: [],
}

