import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderWidth: {
        3: "3px",
      },
      colors: {
        primary: {
          400: "#33cfff",
          500: "#00b7ff",
          600: "#008ee6",
        },
        secondary: {
          400: "#ffffff",
          500: "#dff6ff",
          600: "#9be8ff",
        },
        accent: {
          400: "#33cfff",
          500: "#00b7ff",
          600: "#0057ff",
        },
        dark: {
          900: "#0f0f0f",
          800: "#1a1a1a",
          700: "#262626",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        "gen-z-gradient": "linear-gradient(to right, #c084fc, #f472b6, #2dd4bf)",
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
