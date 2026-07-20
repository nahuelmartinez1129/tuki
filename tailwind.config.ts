import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Paleta de marca TUKI
        tuki: {
          yellow: "#F5E57A",
          lime: "#C6DB00",
          turquoise: "#1BA091",
          "turquoise-dark": "#0E2E2B",
          green: "#80AD7E",
          night: "#0B1F1E",
          "night-soft": "#12312E",
          cream: "#FFFDF6",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1BA091",
          foreground: "#FFFDF6",
        },
        secondary: {
          DEFAULT: "#C6DB00",
          foreground: "#0B1F1E",
        },
        accent: {
          DEFAULT: "#F5E57A",
          foreground: "#0B1F1E",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "#E85D5D",
          foreground: "#FFFDF6",
        },
      },
      fontFamily: {
        display: ["'Baloo 2'", "system-ui", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
        blob: "42% 58% 65% 35% / 45% 45% 55% 55%",
      },
      boxShadow: {
        soft: "0 8px 24px -6px rgba(11, 31, 30, 0.18)",
        "soft-lg": "0 20px 45px -12px rgba(11, 31, 30, 0.35)",
        glow: "0 0 0 4px rgba(198, 219, 0, 0.25)",
        "glow-turquoise": "0 0 40px -8px rgba(27, 160, 145, 0.55)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        "float-slower": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "twinkle": {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        "pop": {
          "0%": { transform: "scale(0.96)" },
          "60%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-slower": "float-slower 8s ease-in-out infinite",
        twinkle: "twinkle 3.2s ease-in-out infinite",
        pop: "pop 0.35s ease-out",
        wiggle: "wiggle 4.5s ease-in-out infinite",
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
