module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        taa: {
          primary: '#1E6B2B',
          accent: '#77BFA1',
          dark: '#111827'
        }
      }
    }
  },
  plugins: []
}

// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        "taa-primary": "#1E6B2B",
        "taa-accent": "#77BFA1",
        "taa-dark": "#111827",
      },
    },
  },
};
