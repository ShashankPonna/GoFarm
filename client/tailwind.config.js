/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        secondary: {
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#081c15',
        }
      },
      boxShadow: {
        'card': '0 15px 35px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 45px rgba(0, 0, 0, 0.08)',
        'nav': '0 -10px 30px rgba(0, 0, 0, 0.05)',
        'fab': '0 10px 25px rgba(255, 193, 7, 0.4)',
      }
    },
  },
  plugins: [],
}
