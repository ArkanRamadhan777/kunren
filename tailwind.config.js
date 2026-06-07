/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        structly: {
          ink: '#00163d',
          navy: '#00338d',
          blue: '#005af5',
          orange: '#f27f0c',
          yellow: '#f7ad19',
          cream: '#f4f2dd',
          black: '#00163d',
          white: '#f4f2dd',
          gray: '#f4f2dd',
          green: '#f7ad19',
          pink: '#f27f0c',
          mint: '#f4f2dd',
          violet: '#f7ad19',
          cyan: '#005af5',
        },
      },
      boxShadow: {
        brutal: '6px 6px 0 #00163d',
        'brutal-sm': '3px 3px 0 #00163d',
        'brutal-lg': '10px 10px 0 #00163d',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'slide-in-left': 'slide-in-left 220ms ease-out both',
        'fade-up': 'fade-up 240ms ease-out both',
        pop: 'pop 180ms ease-out both',
      },
    },
  },
  plugins: [],
};
