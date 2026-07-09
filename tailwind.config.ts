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
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
