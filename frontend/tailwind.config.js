/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#202b27',
        moss: '#35745c',
        canvas: '#f5f6f2',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};