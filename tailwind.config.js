/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6F4ED',
          100: '#B3DFC8',
          200: '#80CAA3',
          300: '#4DB57E',
          400: '#26A559',
          500: '#0B6B3A',
          600: '#095A31',
          700: '#074828',
          800: '#05361F',
          900: '#032416',
        },
        'brand-light': '#16A34A',
        'brand-lighter': '#22C55E',
        surface: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'risk-low': '#16A34A',
        'risk-moderate': '#F59E0B',
        'risk-high': '#DC2626',
        'risk-critical': '#7F1D1D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
