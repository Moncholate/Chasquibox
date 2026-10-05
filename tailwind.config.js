/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#7c3aed',
        success: '#16a34a',
        warning: '#ea580c',
        danger: '#dc2626',
        info: '#0284c7',
      }
    },
  },
  plugins: [],
}
