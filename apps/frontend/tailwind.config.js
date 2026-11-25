/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdfaf5',
          100: '#f3e9d9',
          200: '#e9d5c2',
          300: '#d9c1a5',
          400: '#c8ad82',
          500: '#a88a62',
          600: '#8a6f4c',
          700: '#6d5339',
          800: '#543e2b',
          900: '#3f2e20',
        },
      },
      boxShadow: {
        'neumorphic-light': '8px 8px 16px #d1c9bd, -8px -8px 16px #ffffff',
        'neumorphic-dark': '8px 8px 16px #c9c1b6, -8px -8px 16px #ffffff',
        'neumorphic-pressed': 'inset 4px 4px 8px #c9c1b6, inset -4px -4px 8px #ffffff',
        'neumorphic-pressed-dark': 'inset 4px 4px 8px #b8b0a6, inset -4px -4px 8px #ffffff',
      },
      animation: {
        'press': 'press 0.1s ease-in-out',
      },
      keyframes: {
        press: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};