/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // "Archive" palette: cool graphite + warm brass accent, evoking a
        // filing system rather than a generic SaaS blue/purple gradient.
        graphite: {
          50: "#f6f7f8",
          100: "#e9ebee",
          200: "#d3d7dd",
          300: "#aeb5bf",
          400: "#838c99",
          500: "#636d7b",
          600: "#4d5563",
          700: "#3f4550",
          800: "#2c3038",
          900: "#1c1e24",
          950: "#111318",
        },
        brass: {
          400: "#c9a24a",
          500: "#b3893a",
          600: "#96702e",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
