import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0b",
        surface: "#141416",
        "surface-highlight": "#1c1c1f",
        primary: "#d4af37",
        "primary-glow": "rgba(212, 175, 55, 0.15)",
        secondary: "#b87333",
        "text-primary": "#fafafa",
        "text-secondary": "#a1a1aa",
        "text-muted": "#71717a",
        border: "rgba(255, 255, 255, 0.05)",
        "border-highlight": "rgba(212, 175, 55, 0.3)",
        success: "#10b981",
        error: "#ef4444",
      },
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
        jetbrains: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        hero: "clamp(3rem, 8vw, 8rem)",
        h2: "clamp(2rem, 4vw, 4rem)",
        body: "1.125rem",
      },
      spacing: {
        section: "128px",
      },
      borderRadius: {
        card: "24px",
      },
      boxShadow: {
        card: "0 8px 32px rgba(0, 0, 0, 0.5)",
        glow: "0 0 40px rgba(212, 175, 55, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-up": "slideUp 0.8s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        float: "float 20s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
