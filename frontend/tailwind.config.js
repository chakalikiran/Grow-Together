/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: '#fdfcfb',
        terracotta: '#9a3412',
        slate: '#4b5563', // Enforcing neutral slate
        gold: '#fde68a',
      },
      boxShadow: {
        'warm': '0 10px 40px -10px rgba(69, 26, 3, 0.08)',
        'warm-sm': '0 4px 10px -2px rgba(69, 26, 3, 0.05)',
        'warm-deep': '0 20px 50px rgba(69, 26, 3, 0.06)',
      }
    },
  },
  plugins: [],
}
