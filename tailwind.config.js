/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#38bdf8',
        secondary: '#818cf8',
        accent: '#10b981',
        dark: '#0f172a',
        darker: '#020617',
        light: '#f8fafc',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
        }
      }
    },
  },
  plugins: [],
}
