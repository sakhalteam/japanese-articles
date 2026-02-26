import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { cyan: "#22d3ee", purple: "#a78bfa" },
      },
      boxShadow: { card: "0 10px 30px rgba(2,6,23,.12)" },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [],
} satisfies Config;
