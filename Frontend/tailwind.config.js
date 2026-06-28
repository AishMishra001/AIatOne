/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0d0d0d",
        darkCard: "#121212",
        lightAccent: "#fefff5",
        accentYellow: "#fefff5",
        borderGray: "#212121",
        textGray: "#d4d4d4",
      },
      fontFamily: {
        satoshi: ["Satoshi", "Inter", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#fefff5",
          "secondary": "#a855f7",
          "accent": "#6366f1",
          "neutral": "#121212",
          "base-content": "#fefff5",
          "base-100": "#0d0d0d",
          "info": "#38bdf8",
          "success": "#34d399",
          "warning": "#fbbf24",
          "error": "#f87171",
        },
      },
    ],
  },
}
