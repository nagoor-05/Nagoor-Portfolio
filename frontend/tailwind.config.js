export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cosmic: "#050816",
        primary: "#915EFF",
        secondary: "#00CEA8",
        soft: "#AAAAAA",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 34px rgba(145, 94, 255, 0.35)",
        cyan: "0 0 34px rgba(0, 206, 168, 0.22)",
      },
    },
  },
  plugins: [],
};
