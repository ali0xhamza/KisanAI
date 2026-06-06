/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          950: '#0A1F10',
          900: '#1B4D2E',
          800: '#2D7A47',
          700: '#4CAF72',
          400: '#86D4A0',
          100: '#C8EDD6',
          50:  '#EAF7EE',
        },
        cream: { DEFAULT: '#FDF9F3' },
        wheat: { DEFAULT: '#D4A843' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: { '2xl': '20px', '3xl': '28px' },
      boxShadow: {
        card: '0 8px 32px rgba(27,77,46,0.13)',
        soft: '0 2px 12px rgba(27,77,46,0.08)',
      }
    },
  },
  plugins: [],
}