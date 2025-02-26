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
      keyframes: {
                glitch: {
                  "0%": { "clip-path": "inset(20% 0 50% 0)" },
                  "5%": { "clip-path": "inset(10% 0 60% 0)" },
                  "10%": { "clip-path": "inset(15% 0 55% 0)" },
                  "15%": { "clip-path": "inset(25% 0 35% 0)" },
                  "20%": { "clip-path": "inset(30% 0 40% 0)" },
                  "25%": { "clip-path": "inset(40% 0 20% 0)" },
                  "30%": { "clip-path": "inset(10% 0 60% 0)" },
                  "35%": { "clip-path": "inset(15% 0 55% 0)" },
                  "40%": { "clip-path": "inset(25% 0 35% 0)" },
                  "45%": { "clip-path": "inset(30% 0 40% 0)" },
                  "50%": { "clip-path": "inset(20% 0 50% 0)" },
                  "55%": { "clip-path": "inset(10% 0 60% 0)" },
                  "60%": { "clip-path": "inset(15% 0 55% 0)" },
                  "65%": { "clip-path": "inset(25% 0 35% 0)" },
                  "70%": { "clip-path": "inset(30% 0 40% 0)" },
                  "75%": { "clip-path": "inset(40% 0 20% 0)" },
                  "80%": { "clip-path": "inset(20% 0 50% 0)" },
                  "85%": { "clip-path": "inset(10% 0 60% 0)" },
                  "90%": { "clip-path": "inset(15% 0 55% 0)" },
                  "95%": { "clip-path": "inset(25% 0 35% 0)" },
                  "100%": { "clip-path": "inset(30% 0 40% 0)" },
                },
              },
              animation: {
                "glitch-after": "glitch var(--after-duration) infinite linear alternate-reverse",
                "glitch-before": "glitch var(--before-duration) infinite linear alternate-reverse",
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
