import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    "from-violet-500",
    "to-purple-600",
    "from-blue-500",
    "to-cyan-600",
    "from-red-500",
    "to-orange-600",
    "from-pink-500",
    "to-rose-600",
    "from-emerald-500",
    "to-teal-600",

    "bg-gradient-to-br",
  ],
} satisfies Config;
