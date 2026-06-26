/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080B12",
          900: "#0E131D",
          800: "#141B28",
          700: "#1C2433",
          600: "#2C3650",
        },
        paper: {
          100: "#F3EEE1",
          200: "#E8E1CE",
        },
        ledger: {
          blue: "#4A63E8",
          "blue-dim": "#2F3F8F",
        },
        rule: {
          red: "#C0473A",
          "red-dim": "#7A2E26",
        },
        seal: {
          gold: "#C9A227",
          "gold-dim": "#8C7019",
        },
        mist: "#8B93A7",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.45)",
        seal: "0 0 0 4px rgba(201,162,39,0.25)",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
          "100%": { transform: "translateY(0px)" },
        },
        stampIn: {
          "0%": { transform: "scale(2.4) rotate(-18deg)", opacity: "0" },
          "55%": { transform: "scale(0.92) rotate(-8deg)", opacity: "1" },
          "75%": { transform: "scale(1.05) rotate(-10deg)" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" },
        },
        fadeUp: {
          "0%": { transform: "translateY(14px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        drift: "drift 6s ease-in-out infinite",
        stampIn: "stampIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        fadeUp: "fadeUp 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
