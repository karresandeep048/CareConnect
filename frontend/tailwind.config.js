/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#effcf9', 100: '#d5f5ee', 200: '#aeeadc', 300: '#78d8c5', 400: '#3fbfab',
          500: '#1fa593', 600: '#0d8577', 700: '#0f6b61', 800: '#11554e', 900: '#0e3f3b',
        },
        ink: '#0f172a',
        canvas: '#f5f7fb',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)',
        lift: '0 2px 4px rgba(15,23,42,.05), 0 18px 40px -16px rgba(13,133,119,.35)',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pop: { '0%': { opacity: 0, transform: 'translateY(8px) scale(.98)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { floaty: 'floaty 6s ease-in-out infinite', pop: 'pop .25s ease-out both' },
    },
  },
  plugins: [],
};
