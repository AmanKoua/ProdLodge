/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: {
    content: [
      './src/*.{tsx,ts}',
      './src/audioComponents/*.{tsx,ts}',
      './src/components/*.{tsx,ts}',
      './src/pages/*.{tsx,ts}',
    ],
    enabled: false, // Disable tree shaking
  },
  safelist: [
    {
      pattern: /^.*$/, // Match any class pattern during development
    },
  ],
  content: [],
  theme: {
    extend: {
      colors: {
        primary: "#ff6363",
        secondary: {
          100: "#e2e2d5",
          200: "#888883",
        }
      },
    },
  },
  plugins: [],
}
