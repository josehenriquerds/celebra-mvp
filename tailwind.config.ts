// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
        lg: "2.5rem",
        xl: "3rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Paleta Pastel
        pastel: {
          lavender: {
            50: "#F5F4FF",
            100: "#EEECFF",
            200: "#E0DEFF",
            300: "#D4D0FF",
            400: "#C4BFFF",
            500: "#B8B5FF",
            600: "#9D99E8",
            700: "#7E7AC2",
          },
          peach: {
            50: "#FFF5F3",
            100: "#FFEDE8",
            200: "#FFD9D0",
            300: "#FFC4B8",
            400: "#FFAEA0",
            500: "#FFA896",
            600: "#FF9280",
            700: "#E87B6B",
          },
          mint: {
            50: "#F0FAF5",
            100: "#E3F7ED",
            200: "#C7EED9",
            300: "#A8D5BA",
            400: "#8BC4A3",
            500: "#7FC8A9",
            600: "#63A889",
            700: "#4F8A6E",
          },
          rose: {
            50: "#FFF5F8",
            100: "#FFEEF3",
            200: "#FFD9E6",
            300: "#FFC1E3",
            400: "#FFB5D8",
            500: "#FFA4CE",
            600: "#E88DB8",
            700: "#C2709A",
          },
          sky: {
            50: "#F0F9FF",
            100: "#E6F4FF",
            200: "#C4E8FF",
            300: "#A8E6FF",
            400: "#90D5F0",
            500: "#7AC8E8",
            600: "#5FAED4",
            700: "#4A8FB5",
          },
          coral: {
            50: "#FFF7F5",
            100: "#FFEDE8",
            200: "#FFD4C8",
            300: "#FFB8A8",
            400: "#FFA896",
            500: "#FF9280",
            600: "#E8786B",
            700: "#C25E52",
          },
        },

        // Celebre Design Tokens (via CSS vars)
        celebre: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          ink: "var(--ink)",
          muted: "var(--muted)",
          primary: "var(--primary)",
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
        },

        // shadcn/ui compat
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
      },

      // Raios
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
        "4xl": "2rem",
      },

      // Elevação (shadows)
      boxShadow: {
        none: "none",
        "elevation-1": "0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)",
        "elevation-2": "0 2px 4px rgba(0,0,0,0.04), 0 3px 8px rgba(0,0,0,0.08)",
        "elevation-3": "0 4px 8px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.1)",
        "elevation-4": "0 8px 16px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.12)",
        "elevation-5": "0 16px 32px rgba(0,0,0,0.1), 0 24px 48px rgba(0,0,0,0.14)",
        glass: "0 8px 32px rgba(31,38,135,0.15)",
        "glass-sm": "0 4px 16px rgba(31,38,135,0.1)",
      },

      // Blur
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },

      // >>> FONTE PRINCIPAL
      fontFamily: {
        sans: ["var(--font-sans)", "Zalando Sans", "system-ui", "sans-serif"],
      },

      // Tamanhos
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.015em" }],
        "2xl": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "4xl": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.025em" }],
        "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
      },

      // Animações
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        "slide-in-from-top": { from: { transform: "translateY(-8px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "slide-in-from-bottom": { from: { transform: "translateY(8px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "slide-in-from-left": { from: { transform: "translateX(-8px)", opacity: "0" }, to: { transform: "translateX(0)", opacity: "1" } },
        "slide-in-from-right": { from: { transform: "translateX(8px)", opacity: "0" }, to: { transform: "translateX(0)", opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-out": "fade-out 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-top": "slide-in-from-top 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-bottom": "slide-in-from-bottom 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-left": "slide-in-from-left 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-right": "slide-in-from-right 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 2s linear infinite",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
