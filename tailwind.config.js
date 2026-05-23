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
        background: {
          DEFAULT: "#090a0f",
          card: "#12141c",
          panel: "#161924",
          input: "#1d2130",
        },
        cyber: {
          green: "#00ff88",
          blue: "#00e5ff",
          purple: "#bf55ec",
          amber: "#ffb900",
          rose: "#ff007f",
          gray: "#7f8c8d",
          border: "#202538",
          'border-glow': "#2d3550",
          text: "#a0aec0",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["Courier New", "Courier", "monospace"],
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(rgba(18, 20, 28, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(18, 20, 28, 0.5) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        "cyber-grid-size": "20px 20px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-glow": "borderGlow 3s ease infinite",
      },
      keyframes: {
        borderGlow: {
          "0%, 100%": { "border-color": "#202538" },
          "50%": { "border-color": "#00ff88" },
        }
      }
    },
  },
  plugins: [],
};
