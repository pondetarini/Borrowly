/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#485148',
          100: '#252923',
          200: '#3E463E',
          300: '#5E665E',
          400: '#777D75',
          500: '#626960',
          600: '#485148',
          700: '#DDE2DA',
          800: '#E9ECE7',
          900: '#FFFFFF',
          950: '#FAFAF7'
        },
        emerald: {
          50: '#F2F6F1',
          100: '#E4EDE2',
          200: '#C9DAC7',
          300: '#A7BFA5',
          400: '#78977A',
          500: '#648567',
          600: '#55795A',
          700: '#426B50',
          800: '#365943',
          900: '#2C4937',
          950: '#EDF2EB'
        },
        teal: {
          50: '#F1F6F4',
          100: '#E0ECE7',
          200: '#C2D9CE',
          300: '#9BBEAE',
          400: '#739B88',
          500: '#5B846F',
          600: '#4B745E',
          700: '#3E624F',
          800: '#345141',
          900: '#2C4337',
          950: '#EDF3EF'
        },
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22'
        },
        brand: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#10b981',
          highlight: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
