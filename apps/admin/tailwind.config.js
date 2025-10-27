/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          dark: '#0f172a',
          'dark-light': '#1e293b',
          primary: '#3b82f6',
          'primary-dark': '#2563eb',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
