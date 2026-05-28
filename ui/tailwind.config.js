/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        bio: {
          bg: "#03070d",
          panel: "#0a1320",
          surface: "#0f1c2f",
          border: "#1c2c45",
          cyan: "#22d3ee",
          teal: "#2dd4bf",
          mint: "#34d399",
          amber: "#fbbf24",
          rose: "#fb7185",
          violet: "#a78bfa",
        },
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "45%": { opacity: "0.85" },
          "55%": { opacity: "0.95" },
        },
        "shimmer-x": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "drift-1": {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "50%": { transform: "translate(6px, -4px)" },
        },
        "drift-2": {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "50%": { transform: "translate(-5px, 5px)" },
        },
        boot: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        scan: "scan 3s linear infinite",
        flicker: "flicker 4s ease-in-out infinite",
        shimmer: "shimmer-x 2.4s linear infinite",
        "drift-1": "drift-1 6s ease-in-out infinite",
        "drift-2": "drift-2 7s ease-in-out infinite",
        boot: "boot 0.7s ease-out forwards",
      },
      boxShadow: {
        "glow-cyan": "0 0 24px rgba(34,211,238,0.45), 0 0 4px rgba(34,211,238,0.7)",
        "glow-mint": "0 0 24px rgba(52,211,153,0.45), 0 0 4px rgba(52,211,153,0.7)",
        "glow-amber": "0 0 24px rgba(251,191,36,0.45), 0 0 4px rgba(251,191,36,0.7)",
        "glow-rose": "0 0 24px rgba(251,113,133,0.45), 0 0 4px rgba(251,113,133,0.7)",
      },
    },
  },
  plugins: [],
};
