/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        'primary-dark': '#0051D5',
        // INÖ Platform (coach landing)
        indigo: { 600: '#6366f1', 500: '#818cf8' },
        platform: {
          pink: '#ec4899',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          cyan: '#06b6d4',
        },
      },
      backgroundImage: {
        'platform-gradient': 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        'platform-warm': 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
      },
    },
  },
  plugins: [],
}
