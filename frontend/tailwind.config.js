/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        taa: {
          primary: '#1E6B2B',
          accent: '#77BFA1',
          dark: '#111827',
          light: '#f3faf5',
          surface: '#ffffff',
          'surface-dark': '#1f2937',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    }
  },
  plugins: []
}
