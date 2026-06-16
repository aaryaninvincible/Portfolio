/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        dark: 'rgb(var(--color-dark) / <alpha-value>)',
        darker: 'rgb(var(--color-darker) / <alpha-value>)',
        light: 'rgb(var(--color-light) / <alpha-value>)',
        gray: {
          900: '#0f172a',
          800: '#1e293b',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      animation: {
        'blob': 'blob 20s infinite ease-in-out alternate',
        'shine': 'shine 3s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(15vw, 10vw) scale(1.1)' },
          '66%': { transform: 'translate(-10vw, 20vw) scale(0.9)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
          '100%': { transform: 'translateX(100%) translateY(100%) rotate(45deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 115, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(255, 115, 0, 0)' },
        }
      }
    },
  },
  plugins: [],
}
