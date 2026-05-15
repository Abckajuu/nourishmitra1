/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  "#fff8f0",
          100: "#fdecd8",
          200: "#fad5a5",
          400: "#F4A261",
          600: "#e07a35",
          800: "#a0521d",
        },
        teal: {
          50:  "#e8f7f5",
          100: "#c3ebe6",
          300: "#5bc4b8",
          500: "#2A9D8F",
          700: "#1d7068",
          900: "#0f3d39",
        },
        night: "#1a1a2e",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      fontSize: {
        base: ["20px", { lineHeight: "1.7" }],
        lg:   ["22px", { lineHeight: "1.6" }],
        xl:   ["26px", { lineHeight: "1.5" }],
        "2xl":["30px", { lineHeight: "1.4" }],
        "3xl":["36px", { lineHeight: "1.3" }],
        "4xl":["44px", { lineHeight: "1.2" }],
      },
      borderRadius: {
        xl:  "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      animation: {
        "fade-in":    "fadeIn 0.6s ease forwards",
        "slide-up":   "slideUp 0.5s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "wave":       "wave 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        wave:    { "0%,100%": { transform: "scaleY(0.4)" }, "50%": { transform: "scaleY(1)" } },
      },
    },
  },
  plugins: [],
};
