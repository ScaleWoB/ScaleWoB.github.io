/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FFF5F0',
          100: '#FFE5D6',
          200: '#FFC7A8',
          300: '#FFA874',
          400: '#FF8A40',
          500: '#FF6B35', // Primary warm color
          600: '#E55A2B',
          700: '#CC4822',
          800: '#A33A1C',
          900: '#7A2B15',
        },
        coral: {
          50: '#FFF0F5',
          100: '#FFE0EC',
          200: '#FFC1DB',
          300: '#FFA2C8',
          400: '#FF82B5',
          500: '#FF6B81', // Secondary warm color
          600: '#E55A6F',
          700: '#CC485D',
          800: '#A33A4A',
          900: '#7A2B38',
        },
        gold: {
          50: '#FFFBEB',
          100: '#FFF7D1',
          200: '#FFE9A3',
          300: '#FFDB75',
          400: '#FFCD47',
          500: '#FFD93D', // Accent color
          600: '#E5C237',
          700: '#CCAB31',
          800: '#A38928',
          900: '#7A661F',
        },
      },
      fontFamily: {
        sans: ['Stack Sans Text', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: [
          'Stack Sans Text',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        warm: '0 4px 6px -1px rgba(255, 107, 53, 0.1), 0 2px 4px -1px rgba(255, 107, 53, 0.06)',
        'warm-lg':
          '0 10px 15px -3px rgba(255, 107, 53, 0.1), 0 4px 6px -2px rgba(255, 107, 53, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-warm': 'pulseWarm 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseWarm: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
