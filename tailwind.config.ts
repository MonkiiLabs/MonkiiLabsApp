import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Playful brand colors
        sky: {
          DEFAULT: "hsl(var(--sky-blue))",
          light: "hsl(var(--sky-blue-light))",
          dark: "hsl(var(--sky-blue-dark))",
        },
        coral: {
          DEFAULT: "hsl(var(--coral))",
          light: "hsl(var(--coral-light))",
          dark: "hsl(var(--coral-dark))",
        },
        cream: {
          DEFAULT: "hsl(var(--cream))",
          dark: "hsl(var(--cream-dark))",
        },
        surface: {
          dark: "hsl(var(--surface-dark))",
          darker: "hsl(var(--surface-darker))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        purple: "hsl(var(--purple))",
        // Dashboard tokens
        dashboard: {
          bg: "hsl(var(--dashboard-bg))",
          card: "hsl(var(--dashboard-card))",
          "card-foreground": "hsl(var(--dashboard-card-foreground))",
          border: "hsl(var(--dashboard-border))",
          hover: "hsl(var(--dashboard-hover))",
        },
        // Claw brand colors
        claw: {
          coral: "hsl(var(--claw-coral))",
          "coral-dark": "hsl(var(--claw-coral-dark))",
          sky: "hsl(var(--claw-sky))",
          "sky-dark": "hsl(var(--claw-sky-dark))",
          charcoal: "hsl(var(--claw-charcoal))",
          "gray-900": "hsl(var(--claw-gray-900))",
          "gray-600": "hsl(var(--claw-gray-600))",
          "gray-400": "hsl(var(--claw-gray-400))",
        },
        ai: {
          purple: "hsl(var(--ai-purple))",
          "purple-bg": "hsl(var(--ai-purple-bg))",
        },
        human: {
          green: "hsl(var(--human-green))",
          "green-bg": "hsl(var(--human-green-bg))",
        },
        reward: "hsl(var(--reward-green))",
        "notification-red": "hsl(var(--notification-red))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        'playful': '0 4px 20px -4px hsl(var(--sky-blue) / 0.25)',
        'playful-lg': '0 12px 40px -8px hsl(var(--sky-blue) / 0.3)',
        'coral': '0 4px 20px -4px hsl(var(--coral) / 0.3)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "wiggle": "wiggle 0.5s ease-in-out",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(180deg, hsl(199 89% 70%) 0%, hsl(199 89% 80%) 50%, hsl(40 33% 97%) 100%)",
        "sky-gradient": "linear-gradient(180deg, hsl(199 89% 70%) 0%, hsl(199 89% 85%) 100%)",
        "coral-gradient": "linear-gradient(135deg, hsl(6 78% 57%) 0%, hsl(6 78% 70%) 100%)",
        "cloud-pattern": "radial-gradient(ellipse at center, hsl(0 0% 100% / 0.9), transparent 70%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
