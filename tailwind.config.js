/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9f6", 100: "#daf1e8", 200: "#b7e3d3", 300: "#87ceb6",
          400: "#54b394", 500: "#329677", 600: "#217a61", 700: "#1c614f",
          800: "#1a4d41", 900: "#174037",
        },
        accent: { 500: "#e8622c", 600: "#d4501f" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      borderRadius: { xl: "1rem", "2xl": "1.5rem" },
    },
  },
  plugins: [],
};
