/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",   // ✅ this is critical
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-light": "#F4F5F7",
        "background-dark": "#111216",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1a1b1f",
        "text-light": "#1E1E1E",
        "text-dark": "#E5E7EB",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        smooth: "0 8px 20px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
}
