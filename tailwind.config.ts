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
      // Tailwind's stock opacity scale jumps 5 / 10 / 20 / 25, which is far
      // too coarse for a hairline system: the difference between a border
      // at 9% and one at 13% is the difference between a surface you feel
      // and one you see. Anything off the scale emits no rule at all, so
      // the whole integer range is defined here rather than scattering
      // arbitrary-value syntax across every component.
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, i) => [String(i), String(i / 100)]),
      ),
      fontFamily: {
        sans: ["Instrument Sans", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "Instrument Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      // Type ladder on phi (1.618). 10 / 16 / 26 / 42 / 69 / 111 are exact
      // phi steps; 13 / 21 / 33 / 54 / 87 fill between them at sqrt(phi).
      // Running text is set at golden leading (1.618); display is set tight.
      fontSize: {
        micro: ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.24em" }],
        label: ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0.005em" }],
        body: ["1rem", { lineHeight: "1.618" }],
        lead: ["1.3125rem", { lineHeight: "1.5", letterSpacing: "-0.008em" }],
        d1: ["1.625rem", { lineHeight: "1.12", letterSpacing: "-0.018em" }],
        d2: ["2.0625rem", { lineHeight: "1.04", letterSpacing: "-0.022em" }],
        d3: ["2.625rem", { lineHeight: "1", letterSpacing: "-0.026em" }],
        d4: ["3.375rem", { lineHeight: "0.98", letterSpacing: "-0.028em" }],
        d5: ["4.3125rem", { lineHeight: "0.96", letterSpacing: "-0.03em" }],
        d6: ["5.4375rem", { lineHeight: "0.94", letterSpacing: "-0.032em" }],
        d7: ["6.9375rem", { lineHeight: "0.92", letterSpacing: "-0.034em" }],
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
        // Borders are consumed through an alpha — border-hair/11, never
        // a solid keyline.
        hair: "hsl(var(--hair))",
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

        /* ---- The bench: four surfaces, warm graphite --------------- */
        bench: {
          DEFAULT: "hsl(var(--bench))",
          2: "hsl(var(--bench-2))",
          3: "hsl(var(--bench-3))",
          4: "hsl(var(--bench-4))",
        },
        /* ---- Type: cream, four levels ------------------------------ */
        paper: {
          DEFAULT: "hsl(var(--paper))",
          2: "hsl(var(--paper-2))",
          3: "hsl(var(--paper-3))",
          4: "hsl(var(--paper-4))",
        },
        /* ---- Act: the only colour you can press -------------------- */
        act: {
          DEFAULT: "hsl(var(--act))",
          lit: "hsl(var(--act-lit))",
          deep: "hsl(var(--act-deep))",
        },
        /* ---- Alive: the only colour that reports vitality ---------- */
        alive: {
          DEFAULT: "hsl(var(--alive))",
          lit: "hsl(var(--alive-lit))",
          dim: "hsl(var(--alive-dim))",
        },
        idle: "hsl(var(--idle))",
        brass: "hsl(var(--brass))",
        cream: {
          DEFAULT: "hsl(var(--cream))",
          dark: "hsl(var(--cream-dark))",
        },
        state: {
          thriving: "hsl(var(--state-thriving))",
          idle: "hsl(var(--state-idle))",
          fading: "hsl(var(--state-fading))",
        },

        /* ---- Aliases from the previous build -----------------------
           Every one resolves into the bench palette, so a class that has
           not been migrated yet still renders in the new world. */
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
        ink: "hsl(var(--bench))",
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
      // A tight ladder. Small controls sit near-square; only cards and
      // sheets get real curvature. The old 14px base read as a toy.
      borderRadius: {
        sm: "calc(var(--radius) - 6px)",  /*  4 — chips, inline code   */
        md: "calc(var(--radius) - 4px)",  /*  6 — inputs, small buttons */
        lg: "var(--radius)",              /* 10 — cards                 */
        xl: "calc(var(--radius) + 4px)",  /* 14 — panels, figures       */
        "2xl": "calc(var(--radius) + 8px)", /* 18 — sheets, modals      */
        "3xl": "calc(var(--radius) + 8px)",
      },
      // Depth is a hairline plus a lightness step, never a drop shadow.
      // These collapse to a ring so any stale shadow-* class is harmless.
      boxShadow: {
        ink: "0 0 0 1px hsl(var(--hair) / 0.08)",
        "ink-sm": "0 0 0 1px hsl(var(--hair) / 0.06)",
        "ink-lg": "0 0 0 1px hsl(var(--hair) / 0.12)",
        playful: "0 0 0 1px hsl(var(--hair) / 0.08)",
        "playful-lg": "0 0 0 1px hsl(var(--hair) / 0.12)",
        coral: "0 0 0 1px hsl(var(--act) / 0.35)",
        vital: "0 0 0 1px hsl(var(--alive) / 0.3)",
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
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
        "accordion-up": "accordion-up 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
        "fade-in": "fade-in 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        "scale-in": "scale-in 0.18s cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
