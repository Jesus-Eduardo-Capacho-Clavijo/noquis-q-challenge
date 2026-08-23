/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0d14',
        surface: {
          DEFAULT: '#111722',
          light: '#182030',
          border: '#1f293d',
        },
        challenger: {
          DEFAULT: '#00d2ff',
          glow: 'rgba(0, 210, 255, 0.4)',
        },
        grandmaster: {
          DEFAULT: '#ff334b',
          glow: 'rgba(255, 51, 75, 0.4)',
        },
        master: {
          DEFAULT: '#b24bf3',
          glow: 'rgba(178, 75, 243, 0.4)',
        },
        diamond: {
          DEFAULT: '#4b9eff',
          glow: 'rgba(75, 158, 255, 0.3)',
        },
        emerald: {
          DEFAULT: '#00cc7a',
          glow: 'rgba(0, 204, 122, 0.3)',
        },
        gold: {
          DEFAULT: '#e6a623',
          glow: 'rgba(230, 166, 35, 0.3)',
        },
        accent: {
          DEFAULT: '#ff4655', // eSports red accent
          gold: '#f5a623',
          cyan: '#00e5ff',
          purple: '#9d4edd',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.35)',
        'neon-gold': '0 0 25px rgba(245, 166, 35, 0.4)',
        'neon-purple': '0 0 20px rgba(157, 78, 221, 0.35)',
        'neon-red': '0 0 20px rgba(255, 70, 85, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
