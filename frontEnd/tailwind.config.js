/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        spin: {
          'from': { transform: 'translateX(0%)' },
          'to': { transform: 'translateX(-25%)' }  // Changed to 25% for smoother loop
        },
        shine: {
          '0%': { opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0 }
        }
      },
      animation: {
        'spin': 'spin 4s linear infinite',
        'shine': 'shine 1.5s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}