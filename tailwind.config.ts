import type { Config } from "tailwindcss";

// Spacing/type scale per PDF Section 07 "Hard specs you can copy"
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
        16: "64px",
        "sidebar-expanded": "260px",
        "sidebar-collapsed": "72px",
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.5" }],
        sm: ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.5" }],
        lg: ["20px", { lineHeight: "1.2" }],
        xl: ["24px", { lineHeight: "1.2" }],
        "2xl": ["32px", { lineHeight: "1.2" }],
        "3xl": ["48px", { lineHeight: "1.2" }],
      },
      borderRadius: {
        DEFAULT: "8px",
        input: "6px",
        card: "12px",
        pill: "9999px",
      },
      transitionDuration: {
        micro: "150ms",
        transition: "250ms",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "var(--font-geist-mono)", "monospace"],
      },
      colors: {
        ink: "var(--color-ink)",   /* #1E1B4B deep indigo-ink for headings */
        page: "var(--color-page)", /* #F8F8FC off-white page background */
      },
      backdropBlur: {
        glass: "20px",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px 0 rgba(99,102,241,0.15)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(99,102,241,0.25)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "scale-in": "scale-in 200ms ease-out",
        "fade-in": "fade-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
