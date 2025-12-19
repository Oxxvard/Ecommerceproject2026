import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ff',
          100: '#fde9ff',
          200: '#fcd4ff',
          300: '#fab0ff',
          400: '#f77bff',
          500: '#ea4bff',
          600: '#d31aeb',
          700: '#b10dc5',
          800: '#9110a3',
          900: '#771385',
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        vivid: {
          orange: '#ff6b35',
          pink: '#ff0080',
          yellow: '#ffd60a',
          blue: '#0096ff',
          purple: '#a855f7',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        display: ['Bebas Neue', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'slide-left': 'slideLeft 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-right': 'slideRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 25s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-15px) translateX(5px)' },
          '75%': { transform: 'translateY(15px) translateX(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 25px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 40px rgba(0, 0, 0, 0.12)',
        'accent': '0 8px 30px rgba(234, 75, 255, 0.25)',
        'accent-strong': '0 15px 50px rgba(234, 75, 255, 0.35)',
        'colored': '0 10px 40px rgba(168, 85, 247, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.3) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.3) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.3) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.3) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
export default config;
