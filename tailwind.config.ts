import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "var(--color-void)",
        surface: {
          DEFAULT: "var(--color-surface)",
          2: "var(--color-surface-2)",
          3: "var(--color-surface-3)",
        },
        border: "var(--color-border)",
        indigo: "var(--color-indigo)",
        "indigo-light": "var(--color-indigo-light)",
        violet: "var(--color-violet)",
        gold: "var(--color-gold)",
        "gold-light": "var(--color-gold-light)",
        rose: "var(--color-rose)",
        text: {
          DEFAULT: "var(--color-text)",
          2: "var(--color-text-2)",
        },
        muted: "var(--color-muted)",
        // Backward compat
        magenta: "var(--color-magenta)",
        orange: "var(--color-orange)",
        purple: "var(--color-purple)",
        pink: "var(--color-pink)",
      },
      backgroundImage: {
        "brand-gradient": "var(--brand-gradient)",
        "brand-gradient-subtle": "var(--brand-gradient-subtle)",
        "gold-gradient": "var(--gold-gradient)",
      },
      fontFamily: {
        display: ["var(--font-syne)", "var(--font-bebas)", "sans-serif"],
        body: ["var(--font-inter)", "var(--font-dm-sans)", "sans-serif"],
        bebas: ["var(--font-bebas)", "sans-serif"],
      },
      boxShadow: {
        "glow-indigo": "0 0 40px rgba(99, 102, 241, 0.3)",
        "glow-gold": "0 0 30px rgba(245, 158, 11, 0.25)",
        "glow-indigo-sm": "0 0 20px rgba(99, 102, 241, 0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      animation: {
        "blob-1": "float-blob-1 18s infinite ease-in-out",
        "blob-2": "float-blob-2 22s infinite ease-in-out",
        "blob-3": "float-blob-3 26s infinite ease-in-out",
        shimmer: "shimmer 4s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
