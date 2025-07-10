/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        primaryHover: '#1e40af',
        backgroundDark: '#gray-900',
        backgroundLight: '#gray-200',
        textPrimary: '#fff',
        textSecondary: '#gray-300',
      },
    },
  },
  plugins: [],
};
