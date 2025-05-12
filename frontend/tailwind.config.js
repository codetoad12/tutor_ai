/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'chalk': '#F5F5F5',
        'paper': '#FFFFFF',
        'ink': '#1F2937',
        'accent': '#2563EB',
        'accent-blue': '#2563EB',
        'highlight': '#FEF3C7',
        'border': '#E5E7EB',
        'muted': '#9CA3AF',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        'mono': ['ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade': 'fade 0.3s ease-out',
      },
      keyframes: {
        fade: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
} 