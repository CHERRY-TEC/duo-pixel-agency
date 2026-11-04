import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './portal.html',
    './site/src/**/*.{ts,tsx}',
    './portal/src/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050506',
          900: '#0A0A0C',
          850: '#0E0E11',
          800: '#131317',
          750: '#17171C',
          700: '#1E1E25',
          600: '#2A2A33',
          500: '#3A3A46',
          400: '#5A5A6A',
          300: '#8A8A9A',
          200: '#B9B9C6',
          100: '#E4E4EC',
        },
        accent: {
          DEFAULT: '#B9FF39',
          soft: '#D6FF8A',
          dim: '#8FD41F',
          deep: '#1B2A08',
        },
        amber: {
          soft: '#FFC53D',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(185,255,57,0.25), 0 18px 50px -20px rgba(185,255,57,0.45)',
        card: '0 24px 60px -32px rgba(0,0,0,0.9)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        blink: 'blink 1.4s steps(2, start) infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
