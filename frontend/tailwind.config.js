/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // custom matcha palette for er
        matcha: {
          darker: '#204226',
          dark: '#44624a',      // Deep matcha green
          DEFAULT: '#8ba888',   // Medium matcha green
          light: '#c0cfb2',     // Light matcha green
          cream: '#f1ebe1',     // Very light cream
        },
      },
    },
  },
  plugins: [],
}