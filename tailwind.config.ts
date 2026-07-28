import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./os/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--os-bg) / <alpha-value>)",
        surface: "rgb(var(--os-surface) / <alpha-value>)",
        border: "rgb(var(--os-border) / <alpha-value>)",
        text: "rgb(var(--os-text) / <alpha-value>)",
        muted: "rgb(var(--os-muted) / <alpha-value>)",
        dim: "rgb(var(--os-dim) / <alpha-value>)",
        accent: "rgb(var(--os-accent) / <alpha-value>)",
        "accent-bright": "rgb(var(--os-accent-bright) / <alpha-value>)",
        "on-accent": "rgb(var(--os-on-accent) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
