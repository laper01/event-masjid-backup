import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand tokens
        primary: "#004532",
        "primary-container": "#065f46",
        "primary-fixed": "#a6f2d1",
        "primary-fixed-dim": "#8bd6b6",
        "on-primary": "#ffffff",
        "on-primary-container": "#8bd6b7",
        "on-primary-fixed": "#002116",
        "on-primary-fixed-variant": "#00513b",

        secondary: "#6e5e0d",
        "secondary-container": "#f6df84",
        "secondary-fixed": "#f9e287",
        "secondary-fixed-dim": "#dcc66e",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#726212",
        "on-secondary-fixed": "#221b00",
        "on-secondary-fixed-variant": "#534600",

        tertiary: "#00462e",
        "tertiary-container": "#006041",
        "tertiary-fixed": "#6ffbbe",
        "tertiary-fixed-dim": "#4edea3",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#50e0a4",
        "on-tertiary-fixed": "#002113",
        "on-tertiary-fixed-variant": "#005236",

        surface: "#f9f9f8",
        "surface-dim": "#dadad9",
        "surface-bright": "#f9f9f8",
        "surface-variant": "#e2e2e2",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f3",
        "surface-container": "#eeeeed",
        "surface-container-high": "#e8e8e7",
        "surface-container-highest": "#e2e2e2",
        "surface-tint": "#1b6b51",

        background: "#f9f9f8",
        "on-background": "#1a1c1c",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#3f4944",
        "inverse-surface": "#2f3130",
        "inverse-on-surface": "#f1f1f0",
        "inverse-primary": "#8bd6b6",

        outline: "#6f7973",
        "outline-variant": "#bec9c2",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "1rem",
        md: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      boxShadow: {
        ambient: "0 20px 60px rgba(0, 69, 50, 0.06)",
        "ambient-md": "0 12px 40px rgba(0, 69, 50, 0.08)",
        "ambient-lg": "0 24px 80px rgba(0, 69, 50, 0.10)",
        "ambient-sm": "0 4px 20px rgba(0, 69, 50, 0.05)",
        float: "0 40px 80px rgba(0, 69, 50, 0.12)",
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(at top left, #a6f2d1 0%, transparent 50%), radial-gradient(at bottom right, #f6df84 0%, transparent 50%), radial-gradient(at center, #f9f9f8 0%, #f3f4f3 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at 30% 0%, rgba(166, 242, 209, 0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 100%, rgba(246, 223, 132, 0.3) 0%, transparent 60%)",
        "emerald-gradient": "linear-gradient(135deg, #004532 0%, #065f46 100%)",
        "jewel-gradient": "linear-gradient(135deg, #004532 0%, #065f46 50%, #1b6b51 100%)",
        "button-gradient": "linear-gradient(135deg, #065f46 0%, #004532 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        float: "float 6s ease-in-out infinite",
        "scale-in": "scale-in 0.5s ease-out both",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
