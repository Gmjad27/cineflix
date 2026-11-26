/** @type {import('tailwindcss').Config} */
export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050507',
          900: '#07070a',
          850: '#0a0a0f',
          800: '#0e0e14',
          750: '#13131b',
          700: '#1a1a24',
        },
        cine: {
          red: '#E50914',
          glow: 'rgba(229, 9, 20, 0.45)',
        },
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '36px',
        '4xl': '48px',
      },
      boxShadow: {
        'glass-sm': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 0 4px 16px -2px rgba(0, 0, 0, 0.6)',
        'glass-md': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), 0 12px 32px -4px rgba(0, 0, 0, 0.75)',
        'glass-lg': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.25), 0 24px 60px -12px rgba(0, 0, 0, 0.85)',
        'glass-mirror': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.5), 0 20px 50px -10px rgba(0, 0, 0, 0.9)',
        'neon-red': '0 0 25px rgba(229, 9, 20, 0.45)',
        'neon-white': '0 0 20px rgba(255, 255, 255, 0.25)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-glow': 'pulse-glow 3s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
