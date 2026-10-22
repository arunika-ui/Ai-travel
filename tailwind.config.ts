import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Oxblood/burgundy — used only as punctuation (buttons, hover, rules, accents).
        brand: {
          50: "#f8edec",
          100: "#eed6d4",
          200: "#dcaeab",
          300: "#c57f7a",
          400: "#a84f4a",
          500: "#7c1f1f",
          600: "#6e1423",
          700: "#58101c",
          800: "#450d16",
          900: "#330a10",
        },
        ivory: "#faf6ef",
        ink: "#231f1c",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
