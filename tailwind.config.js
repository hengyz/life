/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdf8f3',
          100: '#f9ede0',
          200: '#f2d9bc',
          300: '#e8bf94',
          400: '#dda06a',
          500: '#d4884a',
          600: '#c66f3a',
          700: '#a55732',
          800: '#85462f',
          900: '#6c3b28',
        },
        cream: '#faf6f0',
        ink: '#2c2416',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(44, 36, 22, 0.08)',
        soft: '0 4px 20px rgba(44, 36, 22, 0.06)',
        glow: '0 8px 32px rgba(212, 136, 74, 0.12)',
      },
    },
  },
  plugins: [],
};
