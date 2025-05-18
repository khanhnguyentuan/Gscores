/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgba(15,34,137,255)",
        secondary: "rgba(250,214,3,255)",
        tertiary: "rgba(65,136,146,255)"
      },
      fontFamily: {
        rubik: ['Rubik', 'sans-serif']
      }
    },
  },
  plugins: [],
} 