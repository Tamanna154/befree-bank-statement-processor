import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        befree: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fc",
          400: "#36acf8",
          500: "#0c92eb",
          600: "#0173ca",
          700: "#025ca3",
          800: "#064e86",
          900: "#0b416f",
          950: "#072a4a",
        },
        navy: {
          850: "#10192e",
          900: "#0a0f1d",
          950: "#05070e",
        }
      },
    },
  },
  plugins: [],
};
export default config;
