import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        sage: 'rgb(var(--sage) / <alpha-value>)',
        'sage-soft': 'rgb(var(--sage-soft) / <alpha-value>)',
        lavender: 'rgb(var(--lavender) / <alpha-value>)',
        mist: 'rgb(var(--mist) / <alpha-value>)',
        warm: 'rgb(var(--warm) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        crisis: 'rgb(var(--crisis) / <alpha-value>)',
        'mood-rough': 'rgb(var(--mood-rough) / <alpha-value>)',
        'mood-low': 'rgb(var(--mood-low) / <alpha-value>)',
        'mood-great': 'rgb(var(--mood-great) / <alpha-value>)',
        'mood-ink': 'rgb(var(--mood-ink) / <alpha-value>)',
        sand: 'rgb(var(--sand) / <alpha-value>)',
      },
      borderRadius: { mp: '1.4rem', 'mp-lg': '2rem' },
      boxShadow: { soft: '0 18px 50px rgba(41, 58, 52, 0.08)' },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(.82)', opacity: '.7' },
          '50%': { transform: 'scale(1)', opacity: '1' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        breathe: 'breathe 8s ease-in-out infinite',
        rise: 'rise .4s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
