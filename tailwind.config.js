/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'Noto Sans Arabic', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#0d0c12',
        panel: '#17151f',
        violet: {
          100: '#eee8ff',
          200: '#d9cbff',
          300: '#c0aeff',
          400: '#a98fff',
          500: '#8c6dff',
          600: '#7551e8',
          700: '#5e3fc2',
          DEFAULT: '#8c6dff',
        },
        lime: '#c9f27a',
      },
      boxShadow: {
        glow: '0 0 40px rgba(140,109,255,.24)',
      },
    },
  },
  plugins: [],
}
