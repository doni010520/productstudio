/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0056e0',  // Main blue
          600: '#0044ad',
          700: '#00337a',
          800: '#002247',
          900: '#001014',
        },
        dark: {
          900: '#0a0e1a',
          800: '#0f1525',
          700: '#141b30',
          600: '#1a2340',
          500: '#202b50',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(240, 90%, 30%, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(240, 70%, 40%, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(210, 80%, 30%, 0.2) 0px, transparent 50%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-blue': '0 0 20px rgba(0, 86, 224, 0.5)',
        'glow-blue-lg': '0 0 40px rgba(0, 86, 224, 0.6)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
