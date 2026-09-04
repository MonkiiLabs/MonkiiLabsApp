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
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Archivo", "Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      // Type ladder on phi (1.618). 10 / 16 / 26 / 42 / 69 / 111 are exact
      // phi steps; 13 / 21 / 33 / 54 / 87 fill between them at sqrt(phi).
      // Running text is set at golden leading (1.618); display is set tight.
      fontSize: {
        micro: ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.28em" }],
        label: ["0.8125rem", { lineHeight: "1.45", letterSpacing: "0.06em" }],
        body: ["1rem", { lineHeight: "1.618" }],
        lead: ["1.3125rem", { lineHeight: "1.5" }],
        d1: ["1.625rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        d2: ["2.0625rem", { lineHeight: "1.05", letterSpacing: "-0.024em" }],
        d3: ["2.625rem", { lineHeight: "1", letterSpacing: "-0.028em" }],
        d4: ["3.375rem", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        d5: ["4.3125rem", { lineHeight: "0.96", letterSpacing: "-0.032em" }],
        d6: ["5.4375rem", { lineHeight: "0.94", letterSpacing: "-0.034em" }],
        d7: ["6.9375rem", { lineHeight: "0.92", letterSpacing: "-0.036em" }],
      },
      // Fibonacci rhythm — it converges on phi, so the vertical spacing
      // and the type scale share one ratio.
      spacing: {
        fib1: "0.5rem",    /*   8 */
        fib2: "0.8125rem", /*  13 */
        fib3: "1.3125rem", /*  21 */
        fib4: "2.125rem",  /*  34 */
        fib5: "3.4375rem", /*  55 */
        fib6: "5.5625rem", /*  89 */
        fib7: "9rem",      /* 144 */
      },
      // The golden section, for two-column splits that are never 50/50.
      gridTemplateColumns: {
        golden: "1.618fr 1fr",
        "golden-flip": "1fr 1.618fr",
      },
      maxWidth: {
        major: "61.8%",
        minor: "38.2%",
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
        // Ink — the outline colour that defines every surface.
        ink: "hsl(var(--claw-charcoal))",
        // The Activation Chamber: the one dark world on the page.
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
        state: {
          thriving: "hsl(var(--state-thriving))",
          idle: "hsl(var(--state-idle))",
          fading: "hsl(var(--state-fading))",
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
      // No blur anywhere. The art casts hard shadows; so does the UI.
      boxShadow: {
        ink: "0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        "ink-sm": "0 2px 8px -1px rgba(0, 0, 0, 0.06)",
        "ink-lg": "0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)",
        playful: "0 4px 20px -2px rgba(0, 0, 0, 0.08)",
        "playful-lg": "0 12px 32px -4px rgba(0, 0, 0, 0.12)",
        coral: "0 4px 16px -2px rgba(231, 68, 53, 0.35)",
        vital: "0 0 24px -2px rgba(0, 200, 5, 0.45)",
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
