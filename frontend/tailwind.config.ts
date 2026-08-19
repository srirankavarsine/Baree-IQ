import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: "#ff9aa5",
          500: "#ff6b7a",
          600: "#d94d60",
        },
        secondary: {
          400: "#8fe9d2",
          500: "#63dfc1",
          600: "#3ab99a",
        },
        accent: {
          400: "#8bdcff",
          500: "#55c7ff",
          600: "#2498d2",
        },
        dark: {
          900: "#0d1117",
          800: "#151c26",
          700: "#344356",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0d1117 0%, #151c26 55%, #24384a 100%)",
        "gen-z-gradient": "linear-gradient(to right, #ff6b7a, #b7a7ff, #55c7ff)",
      },
      animation: {
        "gradient": "gradient 8s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
