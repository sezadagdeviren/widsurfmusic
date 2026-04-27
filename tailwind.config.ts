/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        spotify: {
          black: '#000000',
          dark: '#121212',
          light: '#282828',
          lighter: '#404040',
          green: '#1DB954',
          white: '#FFFFFF',
          gray: '#B3B3B3',
        },
      },
    },
  },
  plugins: [],
}