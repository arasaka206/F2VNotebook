/** @type {import('tailwindcss').Config} */
export default {
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
          bg: '#0f1923',
          card: '#1a2535',
          border: '#253347',
          accent: '#22c55e',
          warn: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        }
      },
    },
  },
  plugins: [],
}

