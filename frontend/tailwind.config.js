/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        upb: {
          red: "#C8102E",
          redDark: "#9B0D23",
          redLight: "#FFF0F2",
          gold: "#C9A84C",
          goldLight: "#FDF8EA",
          dark: "#1A1A1A",
          gray: "#555555",
          bgLight: "#F8F9FA",
          cardBg: "#FFFFFF"
        }
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "sans-serif"],
      },
      boxShadow: {
        "antigravity-sm": "0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
        "antigravity-md": "0 8px 25px -4px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)",
        "antigravity-lg": "0 18px 40px -6px rgba(0, 0, 0, 0.09), 0 8px 16px -4px rgba(0, 0, 0, 0.04)",
        "antigravity-glow": "0 0 20px rgba(200, 16, 46, 0.25)",
        "antigravity-gold": "0 0 15px rgba(201, 168, 76, 0.35)",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        }
      }
    },
  },
  plugins: [],
}
