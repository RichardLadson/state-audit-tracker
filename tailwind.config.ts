import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        mono: ["IBM Plex Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
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
        "lane-a": "hsl(var(--lane-a))",
        "lane-b": "hsl(var(--lane-b))",
        warning: "hsl(var(--warning))",
        caution: "hsl(var(--caution))",
        critical: "hsl(var(--critical))",
        success: "hsl(var(--success))",
        info: "hsl(var(--info))",
        "posture-reference": "hsl(var(--posture-reference))",
        "posture-evidence": "hsl(var(--posture-evidence))",
        "posture-runtime": "hsl(var(--posture-runtime))",
        "posture-policy": "hsl(var(--posture-policy))",
        "posture-controlled": "hsl(var(--posture-controlled))",
        "posture-enabled": "hsl(var(--posture-enabled))",
        "posture-go-hold": "hsl(var(--posture-go-hold))",
        "posture-nogo": "hsl(var(--posture-nogo))",
        "confidence-high": "hsl(var(--confidence-high))",
        "confidence-medium": "hsl(var(--confidence-medium))",
        "confidence-low": "hsl(var(--confidence-low))",
        "terminal-bg": "hsl(var(--terminal-bg))",
        "terminal-border": "hsl(var(--terminal-border))",
        "swimlane-a": "hsl(var(--swimlane-a))",
        "swimlane-b": "hsl(var(--swimlane-b))",
        "swimlane-enable": "hsl(var(--swimlane-enable))",
        "swimlane-terminal": "hsl(var(--swimlane-terminal))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
