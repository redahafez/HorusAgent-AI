/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        horus: {
          dark: "#070b14",
          card: "rgba(13, 21, 38, 0.7)",
          cardHover: "rgba(20, 32, 58, 0.85)",
          border: "rgba(56, 189, 248, 0.15)",
          borderHover: "rgba(56, 189, 248, 0.4)",
          cyan: "#0ea5e9",
          sky: "#38bdf8",
          gold: "#f59e0b",
          goldLight: "#fbbf24",
          purple: "#8b5cf6",
          emerald: "#10b981",
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(14, 165, 233, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(14, 165, 233, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};
