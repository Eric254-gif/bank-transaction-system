/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1E3B",
          light: "#122A4D",
          text: "#1A1F2B",
        },
        canvas: "#F6F5F1",
        ledger: {
          DEFAULT: "#1F7A5C",
          light: "#e8f3ee",
          dark: "#155c44",
        },
        amber: {
          DEFAULT: "#D97706",
          light: "#fdf1e0",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#fbe9e9",
        },
        slate: {
          muted: "#6B7280",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,30,59,0.06), 0 4px 16px rgba(11,30,59,0.06)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
