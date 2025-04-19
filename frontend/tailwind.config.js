/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'chalkboard': '#2C3E50',
        'notebook': '#F5F5F5',
        'accent': {
          'blue': '#3498DB',
          'green': '#2ECC71',
        },
        'student': {
          'light': '#E3F2FD',
          'dark': '#1976D2',
        },
        'tutor': {
          'light': '#F1F8E9',
          'dark': '#689F38',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'handwriting': ['Caveat', 'cursive'],
      },
      boxShadow: {
        'chalkboard': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'chalkboard-texture': "url('/images/chalkboard-texture.png')",
        'notebook-paper': "url('/images/notebook-paper.png')",
      }
    },
  },
  plugins: [],
} 