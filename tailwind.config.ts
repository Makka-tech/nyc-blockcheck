import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        paper: "#f8f7f3",
        civic: "#0d5c7a",
        clay: "#c95f3f",
        moss: "#3e6b56",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23, 33, 43, .06), 0 8px 24px rgba(23, 33, 43, .05)",
      },
    },
  },
  plugins: [],
} satisfies Config;
