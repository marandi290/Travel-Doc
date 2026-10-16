/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#faf8f5',
          100: '#f4efe6',
          200: '#e8ddcc',
          300: '#dac7ad',
          400: '#c5a787',
          500: '#b18c66',
          600: '#9b7454',
          700: '#7e5b43',
          800: '#674a39',
          900: '#543d31',
        },
        terracotta: {
          50: '#fdf4f3',
          100: '#fbe8e6',
          200: '#f7d5d0',
          300: '#f0b7ae',
          400: '#e58e80',
          500: '#d76856',
          600: '#c24e3c',
          700: '#a23e2e',
          800: '#863629',
          900: '#703127',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
