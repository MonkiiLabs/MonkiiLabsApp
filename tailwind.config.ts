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
      // Nunito everywhere. The display/mono split belonged to the dark
      // instrument look; here even the "mono" slot is Nunito so a stale
      // font-mono on a wallet address or a gauge label still reads as
      // part of the same round, friendly face. Tabular figures come from
      // font-variant-numeric (see .tabular in index.css) rather than
      // from swapping in a monospace family.
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
        display: ["Nunito", "system-ui", "sans-serif"],
        mono: ["Nunito", "system-ui", "sans-serif"],
      },
      // Kept from the previous build: this is measure, not identity, and
      // the dashboard layouts are built on it. Only leading is loosened,
      // because Nunito is rounder and wants more air than a grotesk.
      fontSize: {
        micro: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.12em" }],
        label: ["0.8125rem", { lineHeight: "1.5" }],
        body: ["1rem", { lineHeight: "1.65" }],
        lead: ["1.3125rem", { lineHeight: "1.55" }],
        d1: ["1.625rem", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        d2: ["2.0625rem", { lineHeight: "1.15", letterSpacing: "-0.018em" }],
        d3: ["2.625rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        d4: ["3.375rem", { lineHeight: "1.08", letterSpacing: "-0.022em" }],
        d5: ["4.3125rem", { lineHeight: "1.05", letterSpacing: "-0.024em" }],
        d6: ["5.4375rem", { lineHeight: "1.02", letterSpacing: "-0.026em" }],
        d7: ["6.9375rem", { lineHeight: "1", letterSpacing: "-0.028em" }],
      },
      spacing: {
        fib1: "0.5rem",
        fib2: "0.8125rem",
        fib3: "1.3125rem",
        fib4: "2.125rem",
        fib5: "3.4375rem",
        fib6: "5.5625rem",
        fib7: "9rem",
      },
      gridTemplateColumns: {
        golden: "1.618fr 1fr",
        "golden-flip": "1fr 1.618fr",
      },
      maxWidth: {
        major: "61.8%",
        minor: "38.2%",
      },
      // The full integer opacity range stays: the dashboard uses
      // border-hair/9, /13, /16 and friends, and anything off Tailwind's
      // stock 5/10/20/25 scale would emit no rule at all.
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, i) => [String(i), String(i / 100)]),
      ),
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

        /* ---- Playful brand colours ------------------------------- */
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
        cloud: "hsl(var(--cloud-white))",
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
        dashboard: {
          bg: "hsl(var(--dashboard-bg))",
          card: "hsl(var(--dashboard-card))",
          "card-foreground": "hsl(var(--dashboard-card-foreground))",
          border: "hsl(var(--dashboard-border))",
          hover: "hsl(var(--dashboard-hover))",
        },
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

        /* ---- Bench-era names, resolved into the sky palette --------
           These exist so the live, API-wired dashboard components keep
           compiling and render light. Every one points at a CSS variable
           that index.css has already repointed. */
        hair: "hsl(var(--hair))",
        bench: {
          DEFAULT: "hsl(var(--bench))",
          2: "hsl(var(--bench-2))",
          3: "hsl(var(--bench-3))",
          4: "hsl(var(--bench-4))",
        },
        paper: {
          DEFAULT: "hsl(var(--paper))",
          2: "hsl(var(--paper-2))",
          3: "hsl(var(--paper-3))",
          4: "hsl(var(--paper-4))",
        },
        act: {
          DEFAULT: "hsl(var(--act))",
          lit: "hsl(var(--act-lit))",
          deep: "hsl(var(--act-deep))",
        },
        alive: {
          DEFAULT: "hsl(var(--alive))",
          lit: "hsl(var(--alive-lit))",
          dim: "hsl(var(--alive-dim))",
        },
        idle: "hsl(var(--idle))",
        brass: "hsl(var(--brass))",
        state: {
          thriving: "hsl(var(--state-thriving))",
          idle: "hsl(var(--state-idle))",
          fading: "hsl(var(--state-fading))",
        },
        ink: "hsl(var(--claw-charcoal))",
        chamber: {
          DEFAULT: "hsl(var(--chamber))",
          2: "hsl(var(--chamber-2))",
          3: "hsl(var(--chamber-3))",
        },
        vital: {
          DEFAULT: "hsl(var(--vital))",
          deep: "hsl(var(--vital-deep))",
          dim: "hsl(var(--vital-dim))",
        },
        bone: {
          DEFAULT: "hsl(var(--bone))",
          2: "hsl(var(--bone-2))",
          3: "hsl(var(--bone-3))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      // Soft, diffuse, sky-tinted. Depth here is light and air, not a
      // hairline cut into a dark ground.
      boxShadow: {
        playful: "0 4px 20px -4px hsl(var(--sky-blue) / 0.25)",
        "playful-lg": "0 12px 40px -8px hsl(var(--sky-blue) / 0.3)",
        coral: "0 4px 20px -4px hsl(var(--coral) / 0.3)",
        vital: "0 4px 20px -4px hsl(var(--human-green) / 0.25)",
        ink: "0 4px 20px -4px hsl(var(--sky-blue) / 0.25)",
        "ink-sm": "0 2px 10px -3px hsl(var(--sky-blue) / 0.2)",
        "ink-lg": "0 12px 40px -8px hsl(var(--sky-blue) / 0.3)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(180deg, hsl(199 89% 70%) 0%, hsl(199 89% 80%) 50%, hsl(40 33% 97%) 100%)",
        "sky-gradient":
          "linear-gradient(180deg, hsl(199 89% 70%) 0%, hsl(199 89% 85%) 100%)",
        "coral-gradient":
          "linear-gradient(135deg, hsl(6 78% 57%) 0%, hsl(6 78% 70%) 100%)",
        "cloud-pattern":
          "radial-gradient(ellipse at center, hsl(0 0% 100% / 0.9), transparent 70%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
